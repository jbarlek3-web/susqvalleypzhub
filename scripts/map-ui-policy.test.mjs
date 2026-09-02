import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const MAP_UI_FILES = [
  "src/routes/map.tsx",
  "src/components/map/esri-dynamic-layer.tsx",
  "src/components/map/gis-overlays.tsx",
  "src/components/map/leaflet-map.tsx",
  "src/components/map/map-panel.tsx",
  "src/components/map/parcel-map.tsx",
  "src/components/map/york-parcels-layer.tsx",
  "src/components/map/york-zoning-layer.tsx",
];

test("map views do not render provenance or sample/demo overlays", async () => {
  const sources = await Promise.all(MAP_UI_FILES.map((path) => readFile(path, "utf8")));
  const mapUi = sources.join("\n");

  assert.doesNotMatch(mapUi, /ProvenanceBadge|data-provenance/);
  assert.doesNotMatch(mapUi, /SAMPLE\/DEMO|Not for generated decisions/i);
});
