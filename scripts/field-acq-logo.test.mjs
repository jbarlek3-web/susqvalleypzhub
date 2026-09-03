import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const WORKSPACE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_PATH = join(WORKSPACE_ROOT, "public/field-acq-ordinance-aide-logo-v2.png");
const COMPONENT_PATH = join(
  WORKSPACE_ROOT,
  "src/components/brand/field-acq-ordinance-aide-logo.tsx",
);

test("keeps the supplied Field ACQ Ordinance Aide artwork unchanged", () => {
  const digest = createHash("sha256").update(readFileSync(LOGO_PATH)).digest("hex");

  assert.equal(digest, "a69a58f129296d3451e372d2e7b3849a1d1d42a10cf7ae09f2f47aeee671d3a3");
});

test("crops only the transparent canvas when displaying the logo", () => {
  const component = readFileSync(COMPONENT_PATH, "utf8");

  assert.match(component, /src="\/field-acq-ordinance-aide-logo-v2\.png"/);
  assert.match(component, /relative block aspect-\[1749\/495\]/);
  assert.match(component, /overflow-hidden/);
  assert.match(component, /height: "163\.4343%"/);
  assert.match(component, /left: "-5\.8319%"/);
  assert.match(component, /top: "-27\.8788%"/);
  assert.match(component, /width: "111\.0349%"/);
});
