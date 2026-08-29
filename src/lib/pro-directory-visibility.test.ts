import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../routes/directory.tsx", import.meta.url), "utf8");
const serverFunction = readFileSync(new URL("./pro-directory.ts", import.meta.url), "utf8");
const serverData = readFileSync(new URL("./pro-directory.server.ts", import.meta.url), "utf8");
const counties = JSON.parse(
  readFileSync(new URL("./data/pro-directory/counties.json", import.meta.url), "utf8"),
) as { records: unknown[] };
const municipalities = JSON.parse(
  readFileSync(new URL("./data/pro-directory/municipalities.json", import.meta.url), "utf8"),
) as { records: unknown[] };

test("both supplied directories have their complete normalized record counts", () => {
  assert.equal(counties.records.length, 67);
  assert.equal(municipalities.records.length, 1_290);
});

test("directory data is loaded only after server-side Pro authorization", () => {
  assert.match(serverFunction, /middleware\(\[authMiddleware\]\)/);
  assert.match(serverFunction, /await requirePro\(\)/);
  assert.match(serverFunction, /await import\("@\/lib\/pro-directory\.server"\)/);
  assert.doesNotMatch(route, /data\/pro-directory|pro-directory\.server/);
  assert.match(serverData, /data\/pro-directory\/counties\.json/);
  assert.match(serverData, /data\/pro-directory\/municipalities\.json/);
});

test("the Pro directory page identifies both protected directories", () => {
  assert.match(route, /Pro only/);
  assert.match(route, /County P&amp;Z directory/);
  assert.match(route, /Municipal document directory/);
});
