import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("projects are session-only, deletable, and cleared at sign-out", async () => {
  const store = await readFile("src/lib/store.ts", "utf8");
  const dashboard = await readFile("src/routes/dashboard.tsx", "utf8");

  assert.match(store, /projects: \[\]/);
  assert.match(store, /deleteProject: \(id: string\) => void/);
  assert.match(store, /projects: get\(\)\.projects\.filter/);
  assert.match(store, /signOut:.*projects: \[\]/);
  assert.match(store, /projects: current\.projects/);

  const persistedPreferences = store.slice(store.indexOf("partialize: (state)"));
  assert.doesNotMatch(persistedPreferences, /projects: state\.projects/);
  assert.doesNotMatch(persistedPreferences, /profile: state\.profile/);

  assert.match(dashboard, /Delete project\?/);
  assert.match(dashboard, /deleteProject\(deleting\.id\)/);
  assert.match(dashboard, /Projects are not stored after refresh or sign-out/);
});

test("the disabled organization workspace is not exposed", async () => {
  const shell = await readFile("src/components/layout/app-shell.tsx", "utf8");
  assert.equal(existsSync("src/routes/workspace.tsx"), false);
  assert.doesNotMatch(shell, /Team Workspace|to: "\/workspace"/);
});

test("retired map, supplier, and municipal-account wording is absent", async () => {
  const files = [
    "src/routes/index.tsx",
    "src/routes/acquire.tsx",
    "src/routes/guide.tsx",
    "src/routes/privacy.tsx",
    "src/routes/zoning.tsx",
    "src/lib/data/acquisition.ts",
    "src/lib/data/feasibility-data.ts",
    "src/lib/data/gis-layers.ts",
  ];
  const combined = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");

  for (const phrase of [
    "Launch GIS Map",
    "Official GIS",
    "County GIS",
    "HUD GIS Open Data",
    "Home Depot",
    "municipal officials",
    "Municipal accounts",
    "Direct links to municipal websites and documents",
  ]) {
    assert.equal(combined.toLowerCase().includes(phrase.toLowerCase()), false, phrase);
  }
});
