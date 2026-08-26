import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entitlement = readFileSync(new URL("../src/lib/entitlement.server.ts", import.meta.url), "utf8");
const lookup = readFileSync(new URL("../src/lib/york-lookup.ts", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/components/layout/app-shell.tsx", import.meta.url), "utf8");

test("paid access is based on Clerk Pro or one exact server-side owner id", () => {
  assert.match(entitlement, /session\.has\(\{ plan: "pro" \}\)/);
  assert.match(entitlement, /session\.userId === ownerUserId/);
  assert.match(entitlement, /process\.env\.OWNER_CLERK_USER_ID/);
});

test("live parcel lookup has no free allowance", () => {
  assert.match(lookup, /await requirePro\(\)/);
  assert.doesNotMatch(lookup, /isPro\s*\?\s*120\s*:\s*3/);
});

test("tool routes redirect unpaid users to subscription", () => {
  assert.match(shell, /const requiresPaidAccess = !PUBLIC_PATHS\.has\(pathname\)/);
  assert.match(shell, /requiresPaidAccess && !isPro/);
  assert.match(shell, /<Navigate to="\/subscription" replace/);
});
