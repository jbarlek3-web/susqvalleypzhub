import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appShell = readFileSync(
  new URL("../src/components/layout/app-shell.tsx", import.meta.url),
  "utf8",
);
const accessGate = readFileSync(
  new URL("../src/components/auth/subscription-access-gate.tsx", import.meta.url),
  "utf8",
);

test("a signed-out visitor has an always-visible header and navigation sign-in path", () => {
  assert.match(appShell, /<Link to="\/login">\s*<Button[\s\S]*?>\s*Sign In/);
  assert.doesNotMatch(appShell, /hidden text-primary hover:bg-primary-fixed sm:inline-flex/);
  assert.match(
    appShell,
    /<Link to="\/login" onClick=\{\(\) => setOpen\(false\)\}>\s*Sign In/,
  );
});

test("the skipped access notice keeps a direct sign-in action", () => {
  assert.match(accessGate, /<Link to="\/login">Sign in<\/Link>/);
  assert.match(accessGate, /\{signedIn \? "Resume checkout" : "Start trial"\}/);
});
