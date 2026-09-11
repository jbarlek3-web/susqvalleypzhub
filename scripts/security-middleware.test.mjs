import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../server/middleware/security.ts", import.meta.url), "utf8");

function cspDirective(name) {
  const line = source.split(/\r?\n/).find((candidate) => candidate.includes(`${name} `));
  assert.ok(line, `${name} directive was not found`);
  return line;
}

test("dynamic responses override upstream caching with no-store", () => {
  const secureFunction = source.match(/function secure\([\s\S]*?\n}/)?.[0];
  assert.ok(secureFunction, "secure response function was not found");
  assert.match(secureFunction, /headers\.set\("cache-control", "no-store"\)/);
  assert.match(secureFunction, /headers\.set\("x-content-type-options", "nosniff"\)/);
  assert.match(secureFunction, /headers\.set\("strict-transport-security", "max-age=31536000; includeSubDomains"\)/);
});

test("CSP permits reviewed GIS and Clerk Billing origins without a broad connect allowlist", () => {
  const scriptSrc = cspDirective("script-src");
  const connectSrc = cspDirective("connect-src");
  const frameSrc = cspDirective("frame-src");

  for (const origin of [
    "https://arcweb1.ycpc.org",
    "https://services2.arcgis.com",
    "https://mapservices.pasda.psu.edu",
    "https://hydro.nationalmap.gov",
    "https://basemap.nationalmap.gov",
    "https://server.arcgisonline.com",
    "https://*.tile.openstreetmap.org",
  ]) {
    assert.match(connectSrc, new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const origin of ["https://js.stripe.com", "https://*.js.stripe.com"]) {
    assert.match(scriptSrc, new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const origin of ["https://api.stripe.com"]) {
    assert.match(connectSrc, new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const origin of [
    "https://js.stripe.com",
    "https://*.js.stripe.com",
    "https://hooks.stripe.com",
  ]) {
    assert.match(frameSrc, new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const grokExtension = "https://grok.com/grok-app-builder/extensions.js";
  assert.match(scriptSrc, new RegExp(grokExtension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(scriptSrc.replace(grokExtension, ""), /grok\.com/);
  assert.doesNotMatch(connectSrc, /grok\.com/);
  assert.doesNotMatch(frameSrc, /grok\.com/);
  assert.doesNotMatch(connectSrc, /\shttps:\s/);
});
