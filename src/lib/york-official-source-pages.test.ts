import assert from "node:assert/strict";
import test from "node:test";
import sourceRows from "../../scripts/recovered-york-official-documents.json" with { type: "json" };
import { DOCUMENTS } from "./data/documents.ts";

test("York intake is URL-only and contains no temporary or local paths", () => {
  assert.equal(sourceRows.length, 73);
  assert.equal(new Set(sourceRows.map((entry) => entry.id)).size, sourceRows.length);
  assert.equal(new Set(sourceRows.map((entry) => entry.url)).size, sourceRows.length);

  for (const entry of sourceRows) {
    assert.match(entry.url, /^https?:\/\//);
    assert.doesNotMatch(entry.url, /(?:AppData|Local[\\/]Temp|^[A-Za-z]:)/i);
    assert.equal(entry.source, "official");
    if (entry.kind === "WEB") assert.equal(entry.linkType, "source-page");
  }
});

test("every York official source row is present in the generated document catalog", () => {
  const catalogIds = new Set(DOCUMENTS.map((entry) => entry.id));
  for (const entry of sourceRows) assert.ok(catalogIds.has(entry.id), entry.id);
});
