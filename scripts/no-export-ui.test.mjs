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

test("the private document catalog has no website route or client catalog import", async () => {
  assert.equal(existsSync("src/routes/documents.tsx"), false);
  const catalog = await readFile("src/lib/data/catalog.ts", "utf8");
  const notifications = await readFile("src/lib/data/notification-feed.ts", "utf8");
  assert.doesNotMatch(catalog, /DOCUMENTS/);
  assert.doesNotMatch(notifications, /data\/documents|DOCUMENTS|record\.url/);
});

test("municipal and county surfaces point to source websites only", async () => {
  const files = [
    "src/routes/index.tsx",
    "src/routes/acquire.tsx",
    "src/routes/directory.tsx",
    "src/routes/notifications.tsx",
    "src/lib/data/notification-feed.ts",
    "src/lib/pro-directory.ts",
    "src/lib/pro-directory.server.ts",
  ];
  const sources = await Promise.all(files.map((file) => readFile(file, "utf8")));
  const combined = sources.join("\n");

  for (const phrase of [
    "builder documentation",
    "Regional source records",
    "SALDO records",
    "Municipal document directory",
    "Open source record",
    "guided downloads",
  ]) {
    assert.equal(combined.includes(phrase), false, `retired municipal delivery copy: ${phrase}`);
  }

  assert.doesNotMatch(combined, /https?:\/\/[^\s"']+\.pdf(?:\?[^\s"']*)?/i);
  assert.doesNotMatch(
    combined,
    /DocumentCenter\/View|drive\.google\.com\/file|wp-content\/uploads/i,
  );
});

test("the market report remains the explicit document download exception", async () => {
  const acquire = await readFile("src/routes/acquire.tsx", "utf8");
  const sources = await readFile("src/lib/data/feasibility-data.ts", "utf8");
  assert.match(acquire, /Download market report/);
  assert.match(sources, /central-pa-land-development-investment-market-report-august-2026\.pdf/);
  assert.equal(
    existsSync(
      "public/reports/central-pa-land-development-investment-market-report-august-2026.pdf",
    ),
    true,
  );
});
