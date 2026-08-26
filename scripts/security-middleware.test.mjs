import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../server/middleware/security.ts", import.meta.url), "utf8");

test("dynamic responses override upstream caching with no-store", () => {
  const secureFunction = source.match(/function secure\([\s\S]*?\n}/)?.[0];
  assert.ok(secureFunction, "secure response function was not found");
  assert.match(secureFunction, /headers\.set\("cache-control", "no-store"\)/);
  assert.match(secureFunction, /headers\.set\("x-content-type-options", "nosniff"\)/);
  assert.match(secureFunction, /headers\.set\("strict-transport-security", "max-age=31536000; includeSubDomains"\)/);
});

test("CSP permits only the GIS origins used by browser map layers", () => {
  for (const origin of [
    "https://arcweb1.ycpc.org",
    "https://services2.arcgis.com",
    "https://mapservices.pasda.psu.edu",
    "https://hydro.nationalmap.gov",
    "https://basemap.nationalmap.gov",
    "https://server.arcgisonline.com",
    "https://*.tile.openstreetmap.org",
  ]) {
    assert.match(source, new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(source, /connect-src[^`\n]*\shttps:\s/);
});
