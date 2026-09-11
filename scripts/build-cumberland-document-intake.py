#!/usr/bin/env python3
"""Normalize the verified Cumberland intake selection into catalog source data.

The downloaded selection manifest is intentionally kept outside the app because it
contains the raw archive paths. This script produces a portable, link-based source
file that the catalog generator can check in and rebuild from.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


def load_catalog_helpers(script_dir: Path):
    spec = importlib.util.spec_from_file_location(
        "gen_doc_catalog", script_dir / "gen-doc-catalog.py"
    )
    if not spec or not spec.loader:
        raise RuntimeError("Could not load gen-doc-catalog.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.clean_name, module.categorize


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--selection", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--captured-on", default="2026-07-31")
    args = parser.parse_args()

    clean_name, categorize = load_catalog_helpers(Path(__file__).parent)
    selection = json.loads(args.selection.read_text(encoding="utf-8-sig"))
    documents: list[dict[str, object]] = []
    seen_hashes: set[str] = set()

    for group in selection["groups"]:
        name = group["canonical_name"]
        category = categorize(name)
        urls = group.get("urls") or []
        municipalities = group.get("municipalities") or []
        content_hash = group.get("sha256", "").lower()

        if not category or not urls or not municipalities or not content_hash:
            continue
        if content_hash in seen_hashes:
            continue
        seen_hashes.add(content_hash)

        documents.append(
            {
                "id": f"rec-cumb-{content_hash[:16]}",
                "contentHash": content_hash,
                "n": clean_name(name),
                "m": group.get("extension", "application/pdf"),
                "s": int(group.get("bytes") or 0),
                "d": args.captured_on,
                "c": "Cumberland",
                "muni": municipalities[0],
                "category": category,
                "url": urls[0],
                "source": "official",
            }
        )

    category_order = {"Zoning": 0, "SALDO": 1, "Builder": 2, "Codes": 3}
    documents.sort(
        key=lambda doc: (
            str(doc["c"]),
            str(doc["muni"]),
            category_order[str(doc["category"])],
            str(doc["n"]).lower(),
        )
    )
    args.output.write_text(json.dumps(documents, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(documents)} recovered Cumberland records -> {args.output}")


if __name__ == "__main__":
    main()
