import assert from "node:assert/strict";
import test from "node:test";
import { EntitlementTimeoutError, entitlementWithTimeout } from "./entitlement-client.ts";

test("returns a completed entitlement", async () => {
  const entitlement = { isPro: true, status: "active", currentPeriodEnd: null };
  assert.deepEqual(await entitlementWithTimeout(Promise.resolve(entitlement), 50), entitlement);
});

test("rejects a stalled entitlement instead of spinning forever", async () => {
  await assert.rejects(
    entitlementWithTimeout(new Promise(() => undefined), 5),
    EntitlementTimeoutError,
  );
});
