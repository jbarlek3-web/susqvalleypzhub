"""Build the private four-county AI reference corpus from local source documents.

The generated records deliberately omit local paths and public URLs. Documents are
deduplicated by content hash while retaining every attributable jurisdiction and
filename. Extraction failures remain visible in the manifest instead of disappearing.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
import zipfile
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = ROOT / "src/lib/data/ai-reference"
OCR_SIDECAR_DIR = ROOT / "src/lib/data/ai-reference-ocr"
LEGACY_OUTPUT = ROOT / "src/lib/data/ai-reference-corpus.json"
TEMP_ROOT = Path(r"C:\Users\jbarl\AppData\Local\Temp")
COUNTY_SOURCE_ROOTS = {
    "Cumberland": [
        Path(r"E:\Master Zoning Folder\Pennsylvania\Cumberland County Intake\Cumberland County Intake"),
        Path(r"E:\Master Zoning Folder\Pennsylvania\PA\county-pa-cumberland"),
    ],
    "Dauphin": [
        Path(r"E:\Master Zoning Folder\Pennsylvania\Dauphin County, PA\Documents_Hard Copies"),
        Path(r"E:\Master Zoning Folder\Pennsylvania\PA\county-pa-dauphin"),
        Path(r"E:\Master Zoning Folder\Pennsylvania\PA\municipality-pa-dauphin-east-hanover-township"),
        Path(r"E:\Master Zoning Folder\Pennsylvania\PA\municipality-pa-dauphin-swatara-township"),
    ],
    "Lancaster": [
        Path(r"E:\Master Zoning Folder\Pennsylvania\Lancaster County\Lancaster County"),
        Path(r"E:\Master Zoning Folder\Pennsylvania\PA\county-pa-lancaster"),
    ],
    "York": [
        Path(r"E:\Master Zoning Folder\Pennsylvania\York County"),
        Path(r"E:\Master Zoning Folder\Pennsylvania\PA\county-pa-york"),
    ],
}
CORE_COUNTIES = frozenset(COUNTY_SOURCE_ROOTS)
SUPPORTED_EXTENSIONS = {
    ".csv",
    ".doc",
    ".docx",
    ".htm",
    ".html",
    ".md",
    ".pdf",
    ".txt",
    ".xls",
    ".xlsx",
}
MAX_CHUNK_CHARS = 2_400
MIN_CHUNK_CHARS = 40
MAX_TABULAR_CHARS = 2_000_000
LOW_TEXT_PER_PAGE = 50
EXCLUDED_PATH_PARTS = {
    "cumberlandcounty_address_points202601",
    "cumberlandcounty_taxparcels202601",
    "dauphincountyparcels202205",
    "dauphincountystreets202205",
    "dc_parceldim",
    "map data_parcel_zoning",
}
EXCLUDED_FILENAMES = {
    # The contents identify this as Allegany County, Maryland, despite the filename.
    "York Township 2014 COMPREHENSIVE PLAN Planning for Today.md",
    # This is byte-identical to the verified 2024 directory; its 2026 label is false.
    "York County's 2026 Directory.pdf",
}
TEMP_AMBIGUOUS_OVERRIDES = {
    # These files came from the user-supplied York County municipal batch.
    "hopewell township": "York",
    "manheim township": "York",
    "penn township": "York",
}


def normalized_key(value: str) -> str:
    value = re.sub(r"\s+\(\d+\)(?=\.[^.]+$)", "", value.strip())
    value = value.casefold().replace("townhsip", "township").replace("towmship", "township")
    value = value.replace("borough of ", "").replace("township of ", "")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def normalize_text(value: str) -> str:
    value = html.unescape(value).replace("\x00", " ")
    value = re.sub(r"(?i)\b[A-Z]:\\[^\r\n\"]+", "[municipal internal path omitted]", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def redact_sensitive_tokens(value: str) -> str:
    return re.sub(
        r"AIza[0-9A-Za-z_-]{35}",
        "[third-party API credential omitted]",
        value,
    )


def chunk_text(value: str) -> list[str]:
    text = normalize_text(value)
    if not text:
        return []
    pieces = [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]
    chunks: list[str] = []
    current = ""
    for piece in pieces:
        segments = re.split(r"(?<=[.!?;:])\s+|\n", piece) if len(piece) > MAX_CHUNK_CHARS else [piece]
        for segment in segments:
            segment = segment.strip()
            if not segment:
                continue
            parts = [segment[i : i + MAX_CHUNK_CHARS] for i in range(0, len(segment), MAX_CHUNK_CHARS)]
            for part in parts:
                candidate = f"{current}\n\n{part}".strip() if current else part
                if len(candidate) <= MAX_CHUNK_CHARS:
                    current = candidate
                else:
                    if len(current) >= MIN_CHUNK_CHARS:
                        chunks.append(current)
                    current = part
    if len(current) >= MIN_CHUNK_CHARS:
        chunks.append(current)
    return chunks


class TextHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.parts.append(data.strip())


def extract_pdf(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    if path.read_bytes()[:256].lstrip().lower().startswith((b"<!doc", b"<html")):
        _, extracted, quality = extract_html(path)
        quality["extractionMode"] = "html-disguised-as-pdf"
        return 0, extracted, quality
    reader = PdfReader(path)
    extracted: list[tuple[int | None, str]] = []
    low_text_pages: list[int] = []
    for page_number, page in enumerate(reader.pages, start=1):
        text = normalize_text(page.extract_text() or "")
        if len(re.sub(r"\s+", "", text)) < LOW_TEXT_PER_PAGE:
            low_text_pages.append(page_number)
        extracted.extend((page_number, chunk) for chunk in chunk_text(text))
    characters = sum(len(text) for _, text in extracted)
    needs_ocr = bool(reader.pages) and (characters < 500 or len(low_text_pages) > len(reader.pages) / 2)
    if needs_ocr:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        sidecar_path = OCR_SIDECAR_DIR / f"{digest}.json"
        if sidecar_path.exists():
            sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
            if sidecar.get("sha256") != digest:
                raise ValueError(f"OCR sidecar hash mismatch: {sidecar_path.name}")
            ocr_chunks = [
                (int(page["page"]), chunk)
                for page in sidecar.get("pages", [])
                for chunk in chunk_text(str(page.get("text") or ""))
            ]
            if ocr_chunks:
                return len(reader.pages), ocr_chunks, {
                    "extractionMode": "ocr-sidecar",
                    "extractedCharacters": sum(len(text) for _, text in ocr_chunks),
                    "lowTextPages": [],
                    "needsOcr": False,
                }
    quality = {
        "extractionMode": "native-text",
        "extractedCharacters": characters,
        "lowTextPages": low_text_pages,
        "needsOcr": needs_ocr,
    }
    return len(reader.pages), extracted, quality


def extract_docx(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ElementTree.fromstring(xml)
    text = "\n".join(node.text or "" for node in root.iter() if node.tag.endswith("}t"))
    chunks = [(None, chunk) for chunk in chunk_text(text)]
    return 0, chunks, {
        "extractionMode": "docx-xml",
        "extractedCharacters": sum(len(item[1]) for item in chunks),
        "lowTextPages": [],
        "needsOcr": False,
    }


def extract_html(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    parser = TextHTMLParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    chunks = [(None, chunk) for chunk in chunk_text("\n".join(parser.parts))]
    return 0, chunks, {
        "extractionMode": "html-text",
        "extractedCharacters": sum(len(item[1]) for item in chunks),
        "lowTextPages": [],
        "needsOcr": False,
    }


def extract_plain(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    chunks = [(None, chunk) for chunk in chunk_text(text)]
    return 0, chunks, {
        "extractionMode": "plain-text",
        "extractedCharacters": sum(len(item[1]) for item in chunks),
        "lowTextPages": [],
        "needsOcr": False,
    }


def extract_csv(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    rendered: list[str] = []
    characters = 0
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as stream:
        for row in csv.reader(stream):
            line = " | ".join(cell.strip() for cell in row)
            rendered.append(line)
            characters += len(line)
            if characters >= MAX_TABULAR_CHARS:
                break
    chunks = [(None, chunk) for chunk in chunk_text("\n".join(rendered))]
    return 0, chunks, {
        "extractionMode": "csv-text",
        "extractedCharacters": sum(len(item[1]) for item in chunks),
        "lowTextPages": [],
        "needsOcr": False,
        "truncated": characters >= MAX_TABULAR_CHARS,
    }


def extract_xlsx(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    with zipfile.ZipFile(path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ElementTree.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root:
                shared.append(" ".join(node.text or "" for node in item.iter() if node.tag.endswith("}t")))
        values: list[str] = []
        for name in sorted(item for item in archive.namelist() if item.startswith("xl/worksheets/sheet") and item.endswith(".xml")):
            sheet = ElementTree.fromstring(archive.read(name))
            for cell in (node for node in sheet.iter() if node.tag.endswith("}c")):
                value = next((node.text or "" for node in cell if node.tag.endswith("}v")), "")
                if cell.attrib.get("t") == "s" and value.isdigit() and int(value) < len(shared):
                    value = shared[int(value)]
                if value:
                    values.append(value)
                if sum(len(item) for item in values) >= MAX_TABULAR_CHARS:
                    break
    chunks = [(None, chunk) for chunk in chunk_text("\n".join(values))]
    return 0, chunks, {
        "extractionMode": "xlsx-xml",
        "extractedCharacters": sum(len(item[1]) for item in chunks),
        "lowTextPages": [],
        "needsOcr": False,
    }


def extract(path: Path) -> tuple[int, list[tuple[int | None, str]], dict[str, object]]:
    suffix = path.suffix.casefold()
    if suffix == ".pdf":
        return extract_pdf(path)
    if suffix == ".docx":
        return extract_docx(path)
    if suffix in {".html", ".htm"}:
        return extract_html(path)
    if suffix in {".md", ".txt"}:
        return extract_plain(path)
    if suffix == ".csv":
        return extract_csv(path)
    if suffix == ".xlsx":
        return extract_xlsx(path)
    return 0, [], {
        "extractionMode": "unsupported-legacy-office",
        "extractedCharacters": 0,
        "lowTextPages": [],
        "needsOcr": False,
    }


def category_for(filename: str) -> str:
    name = filename.casefold()
    if any(term in name for term in ("zoning", "variance", "special exception", "specialexception", "conditional use", "zhb")):
        return "Zoning"
    if any(term in name for term in ("saldo", "subdivision", "land development")):
        return "SALDO"
    if any(term in name for term in ("stormwater", "flood", "sewer", "sewage", "water", "utility", "utilities", "erosion", "sediment")):
        return "Codes"
    return "Builder"


def municipality_from_filename(filename: str) -> str | None:
    stem = re.sub(r"\s+\(\d+\)(?=\.[^.]+$)", "", filename).rsplit(".", 1)[0]
    if " - " in stem:
        return stem.split(" - ", 1)[0].strip().replace("Townhsip", "Township").replace("Towmship", "Township")
    for county in CORE_COUNTIES:
        if stem.casefold().startswith(f"{county.casefold()} county"):
            return f"{county} County"
    return None


def manifest_records() -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    paths = [ROOT / "scripts/drive-docs.json", ROOT / "scripts/extra-drive-docs.json"]
    paths.extend(sorted((ROOT / "scripts").glob("recovered-*-official-documents.json")))
    for path in paths:
        if path.exists():
            records.extend(json.loads(path.read_text(encoding="utf-8")))
    return [record for record in records if record.get("c") in CORE_COUNTIES]


def candidate_files() -> tuple[list[tuple[Path, str, str]], list[dict[str, str]]]:
    candidates: list[tuple[Path, str, str]] = []
    unresolved: list[dict[str, str]] = []
    exact_manifest: dict[str, tuple[str, str]] = {}
    municipality_counties: dict[str, set[str]] = defaultdict(set)
    display_names: dict[str, str] = {}

    for record in manifest_records():
        county = str(record["c"])
        municipality = str(record.get("muni") or municipality_from_filename(str(record.get("n") or "")) or f"{county} County")
        exact_manifest[normalized_key(str(record.get("n") or ""))] = (county, municipality)
        key = normalized_key(municipality)
        municipality_counties[key].add(county)
        display_names[key] = municipality

    for county, roots in COUNTY_SOURCE_ROOTS.items():
        for root in roots:
            if not root.is_dir():
                unresolved.append({"filename": root.name, "reason": "source-root-missing", "county": county})
                continue
            for path in root.rglob("*"):
                if not path.is_file() or path.suffix.casefold() not in SUPPORTED_EXTENSIONS:
                    continue
                if path.name in EXCLUDED_FILENAMES or any(part.casefold() in EXCLUDED_PATH_PARTS for part in path.parts):
                    continue
                municipality = municipality_from_filename(path.name)
                if not municipality:
                    # A municipal folder name is preferable to guessing from document prose.
                    parent = next(
                        (
                            part
                            for part in reversed(path.relative_to(root).parts[:-1])
                            if re.search(r"(?i)township|townhsip|towmship|borough|city|county", part)
                        ),
                        "",
                    )
                    municipality = parent or f"{county} County"
                municipality = municipality.replace("Townhsip", "Township").replace("Towmship", "Township")
                if path.name.casefold() in {
                    "saldo flowchart-pdf.pdf",
                    "flowchart-pdf.pdf",
                    "plan review process flowchart (pdf).pdf",
                }:
                    municipality = "York County"
                if re.search(r"(?i)^pa (borough and town|municipality) statutes|municipalities planning code", path.name):
                    for shared_county in sorted(CORE_COUNTIES):
                        candidates.append((path, shared_county, f"{shared_county} County"))
                    continue
                candidates.append((path, county, municipality))
                key = normalized_key(municipality)
                municipality_counties[key].add(county)
                display_names[key] = municipality

    if TEMP_ROOT.is_dir():
        for path in TEMP_ROOT.iterdir():
            if not path.is_file() or path.suffix.casefold() not in SUPPORTED_EXTENSIONS or path.name in EXCLUDED_FILENAMES:
                continue
            exact = exact_manifest.get(normalized_key(path.name))
            if exact:
                candidates.append((path, exact[0], exact[1]))
                continue
            municipality = municipality_from_filename(path.name)
            key = normalized_key(municipality or "")
            counties = municipality_counties.get(key, set())
            if municipality and len(counties) == 1:
                county = next(iter(counties))
                candidates.append((path, county, display_names.get(key, municipality)))
            elif municipality and counties:
                override = TEMP_AMBIGUOUS_OVERRIDES.get(key)
                if override:
                    candidates.append((path, override, municipality))
                else:
                    unresolved.append({"filename": path.name, "reason": "ambiguous-municipality", "county": ",".join(sorted(counties))})

    return candidates, unresolved


def build(reuse_output: Path | None = None) -> dict[str, object]:
    candidates, unresolved = candidate_files()
    documents: list[dict[str, object]] = []
    chunks: list[dict[str, object]] = []
    by_hash: dict[str, dict[str, object]] = {}
    failures: list[dict[str, str]] = []
    cached_documents: dict[str, dict[str, object]] = {}
    cached_chunks: dict[str, dict[str, dict[str, object]]] = defaultdict(dict)
    if reuse_output and reuse_output.exists():
        cache_files = (
            sorted(reuse_output.glob("*.json"))
            if reuse_output.is_dir()
            else [reuse_output]
        )
        for cache_file in cache_files:
            cached = json.loads(cache_file.read_text(encoding="utf-8"))
            for document in cached.get("documents", []):
                cached_documents[document["sha256"]] = document
            for chunk in cached.get("chunks", []):
                cached_chunks[chunk["documentId"]][chunk["id"]] = chunk

    for index, (path, county, municipality) in enumerate(sorted(candidates, key=lambda item: (item[1], item[2].casefold(), item[0].name.casefold())), start=1):
        try:
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
        except OSError as error:
            failure_reason = f"read-error: {error.__class__.__name__}"
            failures.append({"filename": path.name, "reason": failure_reason})
            digest = hashlib.sha256(
                f"unreadable:{county}:{municipality}:{path.name}".encode("utf-8")
            ).hexdigest()
            document = {
                "id": f"ref-{digest[:20]}",
                "filename": path.name,
                "aliases": [],
                "kind": path.suffix[1:].upper(),
                "category": category_for(path.name),
                "sha256": digest,
                "bytes": 0,
                "pageCount": 0,
                "chunkCount": 0,
                "status": "unavailable",
                "failureReason": failure_reason,
                "audience": "ai-only",
                "source": "user-supplied municipal reference",
                "jurisdictions": [{"county": county, "municipality": municipality}],
                "extractionMode": "unreadable",
                "extractedCharacters": 0,
                "lowTextPages": [],
                "needsOcr": False,
            }
            documents.append(document)
            by_hash[digest] = document
            continue
        existing = by_hash.get(digest)
        association = {"county": county, "municipality": municipality}
        if existing:
            aliases = existing["aliases"]
            if path.name not in aliases and path.name != existing["filename"]:
                aliases.append(path.name)
            associations = existing["jurisdictions"]
            if association not in associations:
                associations.append(association)
            continue

        doc_id = f"ref-{digest[:20]}"
        cached_document = cached_documents.get(digest)
        has_new_ocr = bool(cached_document and cached_document.get("needsOcr")) and (
            OCR_SIDECAR_DIR / f"{digest}.json"
        ).exists()
        if cached_document and cached_document.get("extractionMode") != "failed" and not has_new_ocr:
            page_count = int(cached_document.get("pageCount") or 0)
            old_chunks = cached_chunks.get(str(cached_document["id"]), {}).values()
            extracted = [(chunk.get("page"), str(chunk["text"])) for chunk in old_chunks]
            quality = {
                key: cached_document[key]
                for key in ("extractionMode", "extractedCharacters", "lowTextPages", "needsOcr", "truncated")
                if key in cached_document
            }
            status = str(cached_document.get("status") or ("ready" if extracted else "unavailable"))
            failure_reason = cached_document.get("failureReason")
        else:
            try:
                page_count, extracted, quality = extract(path)
                status = "ready" if extracted else "unavailable"
                failure_reason = None if extracted else str(quality["extractionMode"])
            except Exception as error:  # keep corrupt/encrypted sources visible in the manifest
                page_count, extracted = 0, []
                quality = {
                    "extractionMode": "failed",
                    "extractedCharacters": 0,
                    "lowTextPages": [],
                    "needsOcr": False,
                }
                status = "unavailable"
                failure_reason = error.__class__.__name__
                failures.append({"filename": path.name, "reason": failure_reason})

        extracted = [
            (page_number, redact_sensitive_tokens(text))
            for page_number, text in extracted
        ]

        document = {
            "id": doc_id,
            "filename": path.name,
            "aliases": [],
            "kind": path.suffix[1:].upper(),
            "category": category_for(path.name),
            "sha256": digest,
            "bytes": path.stat().st_size,
            "pageCount": page_count,
            "chunkCount": len(extracted),
            "status": status,
            "failureReason": failure_reason,
            "audience": "ai-only",
            "source": "user-supplied municipal reference",
            "jurisdictions": [association],
            **quality,
        }
        documents.append(document)
        by_hash[digest] = document
        for chunk_index, (page_number, text) in enumerate(extracted, start=1):
            chunks.append(
                {
                    "id": f"{doc_id}-chunk-{chunk_index:05d}",
                    "documentId": doc_id,
                    "filename": path.name,
                    "category": document["category"],
                    "page": page_number,
                    "text": text,
                }
            )
        if index % 100 == 0:
            print(f"processed {index}/{len(candidates)} candidates")

    county_counts = {county: 0 for county in sorted(CORE_COUNTIES)}
    municipality_counts: dict[str, int] = defaultdict(int)
    for document in documents:
        for jurisdiction in document["jurisdictions"]:
            county_counts[jurisdiction["county"]] += 1
            municipality_counts[f"{jurisdiction['county']}::{jurisdiction['municipality']}"] += 1

    return {
        "schemaVersion": 2,
        "audience": "ai-only",
        "counties": sorted(CORE_COUNTIES),
        "documents": documents,
        "chunks": chunks,
        "coverage": {
            "candidateFiles": len(candidates),
            "uniqueDocuments": len(documents),
            "duplicateFiles": len(candidates) - len(documents) - len(failures),
            "countyDocumentAssociations": county_counts,
            "municipalityDocumentAssociations": dict(sorted(municipality_counts.items())),
            "unresolved": unresolved,
            "failures": failures,
        },
    }


def write_shards(corpus: dict[str, object], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    documents = corpus["documents"]
    chunks = corpus["chunks"]
    for county in sorted(CORE_COUNTIES):
        county_documents = [
            document
            for document in documents
            if any(jurisdiction["county"] == county for jurisdiction in document["jurisdictions"])
        ]
        document_ids = {document["id"] for document in county_documents}
        shard = {
            "schemaVersion": corpus["schemaVersion"],
            "audience": corpus["audience"],
            "county": county,
            "documents": county_documents,
            "chunks": [chunk for chunk in chunks if chunk["documentId"] in document_ids],
        }
        (output_dir / f"{county.casefold()}.json").write_text(
            json.dumps(shard, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
    summary = {
        "schemaVersion": corpus["schemaVersion"],
        "audience": corpus["audience"],
        "counties": corpus["counties"],
        "documentCount": len(documents),
        "chunkCount": len(chunks),
        "coverage": corpus["coverage"],
    }
    (output_dir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--reuse", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument(
        "--no-reuse",
        action="store_true",
        help="Ignore prior generated shards and extract every source document again.",
    )
    args = parser.parse_args()
    reuse_output = None if args.no_reuse else (args.reuse if args.reuse.exists() else None)
    corpus = build(reuse_output)
    write_shards(corpus, args.output_dir)
    print(
        f"wrote {len(corpus['documents'])} unique documents and "
        f"{len(corpus['chunks'])} chunks -> {args.output_dir}"
    )


if __name__ == "__main__":
    main()
