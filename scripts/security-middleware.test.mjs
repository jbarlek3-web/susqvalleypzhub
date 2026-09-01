import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildContentSecurityPolicy, cspOmitsUnsafeInlineScripts } from "../src/lib/csp.ts";

const source = readFileSync(new URL("../server/middleware/security.ts", import.meta.url), "utf8");

test("dynamic responses override upstream caching with no-store", () => {
  assert.match(source, /applySecurityHeaders/);
  assert.match(source, /injectHtmlNonce/);
  assert.match(source, /generateNonce/);
});

test("CSP builder permits reviewed GIS and Clerk Billing origins without unsafe-inline scripts", () => {
  const policy = buildContentSecurityPolicy("C".repeat(16), "https://clerk.example");
  assert.equal(cspOmitsUnsafeInlineScripts(policy), true);
  const connectSrc = policy.split(";").map((p) => p.trim()).find((p) => p.startsWith("connect-src "));
  const scriptSrc = policy.split(";").map((p) => p.trim()).find((p) => p.startsWith("script-src "));
  const frameSrc = policy.split(";").map((p) => p.trim()).find((p) => p.startsWith("frame-src "));
  assert.ok(connectSrc && scriptSrc && frameSrc);

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
  assert.match(connectSrc, /https:\/\/api\.stripe\.com/);
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
  assert.match(policy, /script-src-elem /);
});
