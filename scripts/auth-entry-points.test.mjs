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
const authEntryNav = readFileSync(
  new URL("../src/components/auth/auth-entry-nav.tsx", import.meta.url),
  "utf8",
);
const authProvider = readFileSync(new URL("../src/lib/auth/provider.tsx", import.meta.url), "utf8");
const loginRoute = readFileSync(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const subscriptionRoute = readFileSync(
  new URL("../src/routes/subscription.tsx", import.meta.url),
  "utf8",
);

test("a signed-out visitor has an always-visible header and navigation sign-in path", () => {
  assert.match(appShell, /<Link to="\/login">\s*<Button[\s\S]*?>\s*Sign In/);
  assert.doesNotMatch(appShell, /hidden text-primary hover:bg-primary-fixed sm:inline-flex/);
  assert.match(appShell, /<Link to="\/login" onClick=\{\(\) => setOpen\(false\)\}>\s*Sign In/);
});

test("the first-load access gate requires an explicit sign-in or sign-up choice", () => {
  assert.match(accessGate, /<Link to="\/login">Sign in<\/Link>/);
  assert.match(accessGate, /<Link to="\/sign-up">Sign up<\/Link>/);
  assert.doesNotMatch(accessGate, /Skip for now|setSkipped|onSkip/);
  assert.doesNotMatch(accessGate, /inert/);
});

test("login and signup expose the same account access switcher", () => {
  assert.match(authEntryNav, /aria-label="Account access"/);
  assert.match(authEntryNav, /to="\/login"/);
  assert.match(authEntryNav, /to="\/sign-up"/);
  assert.match(authEntryNav, /aria-current=/);
});

test("sign-out returns to sign-in instead of the product surface", () => {
  assert.match(authProvider, /afterSignOutUrl="\/login"/);
});

test("existing users are not forced from sign-in into checkout", () => {
  assert.match(loginRoute, /fallbackRedirectUrl="\/"/);
  assert.doesNotMatch(loginRoute, /forceRedirectUrl="\/subscription"/);
  assert.match(authProvider, /signInFallbackRedirectUrl="\/"/);
});

test("subscription checks active access before rendering checkout", () => {
  assert.match(subscriptionRoute, /entitlementWithTimeout\(getEntitlement\(\)\)/);
  assert.match(subscriptionRoute, /Your Pro access is active\./);
  assert.match(subscriptionRoute, /setAccess\(isPro \? "active" : "locked"\)/);
});

test("access checks expose a retry state instead of spinning forever", () => {
  assert.match(accessGate, /access === "error"/);
  assert.match(accessGate, /Try again/);
});
