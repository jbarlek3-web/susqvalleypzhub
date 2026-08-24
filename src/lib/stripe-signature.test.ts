import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyStripeSignature } from "./stripe-signature.ts";

const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
const secret = "test_webhook_signing_value";
const timestamp = 1_700_000_000;
const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

test("accepts a valid Stripe signature inside the replay window", () => {
  assert.doesNotThrow(() => verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, timestamp + 10));
});

test("rejects tampered webhook payloads", () => {
  assert.throws(() => verifyStripeSignature(`${payload}x`, `t=${timestamp},v1=${signature}`, secret, timestamp + 10), /mismatch/);
});

test("rejects replayed webhook signatures", () => {
  assert.throws(() => verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, timestamp + 301), /expired/);
});
