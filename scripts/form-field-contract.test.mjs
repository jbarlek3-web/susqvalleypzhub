import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appShell = readFileSync(
  new URL("../src/components/layout/app-shell.tsx", import.meta.url),
  "utf8",
);
const homeRoute = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");

test("global parcel search has stable form and accessibility identifiers", () => {
  assert.match(
    appShell,
    /<input\s+[\s\S]*?id="global-parcel-search"[\s\S]*?name="globalParcelSearch"[\s\S]*?aria-label="Search by address, APN, or owner"/,
  );
});

test("home address search has stable form and accessibility identifiers", () => {
  assert.match(
    homeRoute,
    /<Input\s+[\s\S]*?id="home-address-search"[\s\S]*?name="address"[\s\S]*?aria-label="Search a York County address"/,
  );
});
