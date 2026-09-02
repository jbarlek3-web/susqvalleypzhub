import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) return sourceFiles(path);
      return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
    }),
  );
  return nested.flat();
}

test("map views do not render provenance or sample/demo overlays", async () => {
  const mapUiFiles = ["src/routes/map.tsx", ...(await sourceFiles("src/components/map"))];
  const sources = await Promise.all(mapUiFiles.map((path) => readFile(path, "utf8")));
  const mapUi = sources.join("\n");

  assert.doesNotMatch(
    mapUi,
    /ProvenanceBadge|data-provenance|sample[-/]demo|Not for generated decisions|SEEDED_PARCEL_BUILDABLE|DerivedLineage/i,
  );
});
