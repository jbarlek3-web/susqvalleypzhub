import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const surfaceFiles = [
  "src/routes/index.tsx",
  "src/routes/dashboard.tsx",
  "src/components/map/map-panel.tsx",
  "src/routes/parcels.$id.tsx",
  "src/lib/store.ts",
];

const forbidden = [
  "API & Data Export",
  "Export comprehensive parcel reports",
  "Guided Pro print and export workflow",
  "Print Summary",
  "Print selected summary",
  "Print View",
  "window.print(",
  "canExport",
  "guided downloads",
];

test("Field ACQ exposes no generated print or export surface", async () => {
  const sources = await Promise.all(
    surfaceFiles.map(async (file) => [file, await readFile(file, "utf8")]),
  );

  for (const [file, source] of sources) {
    for (const phrase of forbidden) {
      assert.equal(
        source.includes(phrase),
        false,
        `${file} must not contain the retired export surface: ${phrase}`,
      );
    }
  }
});

test("the document catalog stays stored but has no website route", async () => {
  assert.equal(existsSync("src/routes/documents.tsx"), false);
  const catalog = await readFile("src/lib/data/catalog.ts", "utf8");
  assert.match(catalog, /DOCUMENTS/);
});
