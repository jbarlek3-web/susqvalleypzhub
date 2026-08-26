#!/usr/bin/env python3
"""Recover catalog records from a municipal archive without copying source files.

The archive contains saved official pages and their downloaded documents. A document
is emitted only when its filename or link label has a confident match to a public
URL found on that municipality's saved page; unmatched files are intentionally left
out rather than being assigned an unusable local path or guessed URL.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import importlib.util
import json
import re
import zipfile
from collections import defaultdict
from datetime import date
from difflib import SequenceMatcher
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse


DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xlsx"}


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonical: str | None = None
        self.links: list[dict[str, str]] = []
        self._anchor: dict[str, object] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag == "link" and values.get("rel", "").lower() == "canonical":
            self.canonical = values.get("href") or self.canonical
        if tag == "base" and not self.canonical:
            self.canonical = values.get("href") or self.canonical
        if tag == "a" and values.get("href"):
            self._anchor = {
                "href": values["href"],
                "label": values.get("title") or values.get("aria-label") or "",
                "text": [],
            }

    def handle_data(self, data: str) -> None:
        if self._anchor:
            self._anchor["text"].append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag != "a" or not self._anchor:
            return
        label = " ".join([self._anchor["label"], *self._anchor["text"]]).strip()
        self.links.append({"href": self._anchor["href"], "label": label})
        self._anchor = None


def load_catalog_helpers(script_dir: Path):
    spec = importlib.util.spec_from_file_location(
        "gen_doc_catalog", script_dir / "gen-doc-catalog.py"
    )
    if not spec or not spec.loader:
        raise RuntimeError("Could not load gen-doc-catalog.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.clean_name, module.categorize


def normalize(value: str) -> str:
    value = html.unescape(unquote(value)).lower()
    value = value.replace("Â", "").replace("�", " ")
    value = re.sub(r"\.(pdf|docx?|xlsx)$", "", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def municipality_and_title(name: str) -> tuple[str, str] | None:
    stem = Path(name).stem
    if " - " not in stem:
        return None
    municipality, title = stem.split(" - ", 1)
    return municipality.strip(), title.strip()


def link_score(title: str, link: dict[str, str]) -> float:
    target = normalize(title)
    if not target:
        return 0
    path_name = Path(urlparse(link["url"]).path).name
    candidate = normalize(f"{link['label']} {path_name}")
    if not candidate:
        return 0
    if target == candidate or target in candidate or candidate in target:
        return 1
    target_tokens = set(target.split())
    candidate_tokens = set(candidate.split())
    overlap = len(target_tokens & candidate_tokens)
    if overlap < 2:
        return 0
    token_score = overlap / len(target_tokens | candidate_tokens)
    sequence_score = SequenceMatcher(None, target, candidate).ratio()
    return max(token_score, sequence_score)


def official_sources_by_municipality(
    archive: zipfile.ZipFile,
) -> tuple[dict[str, list[dict[str, str]]], dict[str, list[dict[str, str]]]]:
    links_by_municipality: dict[str, list[dict[str, str]]] = defaultdict(list)
    pages_by_municipality: dict[str, list[dict[str, str]]] = defaultdict(list)
    for info in archive.infolist():
        if Path(info.filename).suffix.lower() != ".html":
            continue
        parsed = municipality_and_title(info.filename)
        if not parsed:
            continue
        municipality, _ = parsed
        parser = LinkCollector()
        parser.feed(archive.read(info).decode("utf-8", errors="replace"))
        base = parser.canonical
        if base and base.startswith(("https://", "http://")):
            pages_by_municipality[municipality].append({"url": base, "title": parsed[1]})
        for raw in parser.links:
            href = html.unescape(raw["href"]).strip()
            if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
                continue
            url = urljoin(base, href) if base else href
            if not url.startswith(("https://", "http://")):
                continue
            links_by_municipality[municipality].append({"url": url, "label": raw["label"]})
    return links_by_municipality, pages_by_municipality


def source_page_score(category: str, page: dict[str, str]) -> int:
    title = normalize(page["title"])
    keywords = {
        "Builder": ("permit", "application", "building", "form", "zoning"),
        "Codes": ("stormwater", "flood", "code", "ordinance", "zoning"),
        "SALDO": ("subdivision", "land development", "planning", "zoning"),
        "Zoning": ("zoning", "ordinance", "planning", "map"),
    }[category]
    return sum(keyword in title for keyword in keywords)


def load_manual_source_pages(path: Path | None) -> dict[str, list[dict[str, str]]]:
    if not path:
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    return {
        municipality: [
            {"url": entry["url"], "title": " ".join(entry.get("categories") or [])}
            for entry in entries
        ]
        for municipality, entries in raw.items()
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--county", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--unresolved-output", type=Path)
    parser.add_argument("--source-pages", type=Path)
    parser.add_argument("--min-score", type=float, default=0.78)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    clean_name, categorize = load_catalog_helpers(Path(__file__).parent)
    with zipfile.ZipFile(args.archive) as archive:
        links_by_municipality, pages_by_municipality = official_sources_by_municipality(archive)
        for municipality, pages in load_manual_source_pages(args.source_pages).items():
            pages_by_municipality[municipality].extend(pages)
        records: list[dict[str, object]] = []
        unresolved: list[str] = []
        seen_hashes: set[str] = set()
        seen_urls: set[str] = set()
        direct_count = 0
        source_page_count = 0

        for info in archive.infolist():
            extension = Path(info.filename).suffix.lower()
            if extension not in DOCUMENT_EXTENSIONS:
                continue
            parsed = municipality_and_title(info.filename)
            category = categorize(info.filename)
            if not parsed or not category:
                continue
            municipality, title = parsed
            candidates = links_by_municipality.get(municipality, [])
            scored = [(link_score(title, link), link) for link in candidates]
            score, match = max(scored, default=(0, None), key=lambda item: item[0])
            link_type = None
            kind = extension
            size: int | str = info.file_size
            url: str | None = None
            display_name = clean_name(Path(info.filename).name)
            if match and score >= args.min_score:
                url = match["url"]
                direct_count += 1
            else:
                pages = pages_by_municipality.get(municipality, [])
                page_score, page = max(
                    ((source_page_score(category, page), page) for page in pages),
                    default=(0, None),
                    key=lambda item: item[0],
                )
                if not page or page_score == 0:
                    unresolved.append(info.filename)
                    continue
                url = page["url"]
                link_type = "source-page"
                kind = "WEB"
                size = "Online"
                display_name = f"{display_name} (official source page)"
                source_page_count += 1

            content = archive.read(info)
            if extension == ".pdf" and not content.startswith(b"%PDF") and not link_type:
                unresolved.append(info.filename)
                continue
            digest = hashlib.sha256(content).hexdigest()
            if digest in seen_hashes or (not link_type and url in seen_urls):
                continue
            seen_hashes.add(digest)
            if not link_type:
                seen_urls.add(url)
            modified = date(*info.date_time[:3]).isoformat()
            records.append(
                {
                    "id": f"rec-{args.county.lower()}-{digest[:16]}",
                    "contentHash": digest,
                    "n": display_name,
                    "m": kind,
                    "s": size,
                    "d": modified,
                    "c": args.county,
                    "muni": municipality,
                    "category": category,
                    "url": url,
                    "source": "official",
                    **({"kind": "WEB", "size": "Online", "linkType": link_type} if link_type else {}),
                }
            )

    category_order = {"Zoning": 0, "SALDO": 1, "Builder": 2, "Codes": 3}
    records.sort(
        key=lambda doc: (
            str(doc["c"]),
            str(doc["muni"]),
            category_order[str(doc["category"])],
            str(doc["n"]).lower(),
        )
    )
    print(
        f"matched {len(records)} catalog documents "
        f"({direct_count} direct, {source_page_count} official source pages); "
        f"{len(unresolved)} relevant archive files had no official source page"
    )
    if args.unresolved_output:
        args.unresolved_output.write_text(
            json.dumps(sorted(unresolved), indent=2) + "\n", encoding="utf-8"
        )
        print(f"wrote {len(unresolved)} unresolved archive names -> {args.unresolved_output}")
    if args.dry_run:
        return
    args.output.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(records)} recovered {args.county} records -> {args.output}")


if __name__ == "__main__":
    main()
