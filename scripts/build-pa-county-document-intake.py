#!/usr/bin/env python3
"""Create safe source-page catalog records for recovered Pennsylvania county PDFs."""
from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.util
import json
from datetime import datetime
from pathlib import Path
import re



def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def load_catalog_helpers(script_dir: Path):
    spec = importlib.util.spec_from_file_location(
        "gen_doc_catalog", script_dir / "gen-doc-catalog.py"
    )
    if not spec or not spec.loader:
        raise RuntimeError("Could not load gen-doc-catalog.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.clean_name, module.categorize


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def jurisdiction_from_directory(name: str) -> tuple[str, str] | None:
    """Return county and display municipality for canonical recovery directories."""
    if name.startswith("county-pa-"):
        county = name.removeprefix("county-pa-").replace("-", " ").title()
        return county, f"{county} County"
    if name.startswith("municipality-pa-"):
        parts = name.split("-")
        # municipality-pa-{county}-{place...}
        if len(parts) >= 5:
            county = parts[2].title()
            municipality = " ".join(parts[3:]).title()
            return county, municipality
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--department-csv", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--unresolved-output", type=Path)
    args = parser.parse_args()

    clean_name, categorize = load_catalog_helpers(Path(__file__).parent)
    with args.department_csv.open(encoding="utf-8-sig", newline="") as stream:
        departments = {
            normalize(row["County"]): row["Website URL"].strip()
            for row in csv.DictReader(stream)
            if row.get("County") and row.get("Website URL")
        }

    records: list[dict[str, object]] = []
    unresolved: list[str] = []
    seen_hashes: set[str] = set()
    for county_dir in sorted(args.source_root.iterdir()):
        if not county_dir.is_dir():
            continue
        jurisdiction = jurisdiction_from_directory(county_dir.name)
        if not jurisdiction:
            continue
        county, municipality = jurisdiction
        url = departments.get(normalize(county))
        for path in sorted(county_dir.rglob("*.pdf")):
            category = categorize(path.name)
            if not category:
                continue
            if not url:
                unresolved.append(str(path))
                continue
            digest = sha256(path)
            if digest in seen_hashes:
                continue
            seen_hashes.add(digest)
            title = clean_name(path.name)
            title_prefix = municipality
            if not normalize(title).startswith(normalize(title_prefix)):
                title = f"{title_prefix} - {title}"
            records.append(
                {
                    "id": f"rec-pa-{digest[:16]}",
                    "contentHash": digest,
                    "n": f"{title} (official source page)",
                    "m": "WEB",
                    "kind": "WEB",
                    "size": "Online",
                    "s": 0,
                    "d": datetime.fromtimestamp(path.stat().st_mtime).date().isoformat(),
                    "c": county,
                    "muni": municipality,
                    "category": category,
                    "url": url,
                    "source": "official",
                    "linkType": "source-page",
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
    args.output.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    if args.unresolved_output:
        args.unresolved_output.write_text(
            json.dumps(unresolved, indent=2) + "\n", encoding="utf-8"
        )
    print(f"wrote {len(records)} recovered Pennsylvania county records -> {args.output}")
    print(f"unresolved county-department mappings: {len(unresolved)}")


if __name__ == "__main__":
    main()
