import assert from "node:assert/strict";
import test from "node:test";
import { Webhook } from "standardwebhooks";
import {
  handleClerkWebhook,
  MAX_CLERK_WEBHOOK_BYTES,
  type ClerkWebhookReceipt,
} from "./clerk-webhook.server.ts";

const signingSecret = `whsec_${Buffer.from("field-acq-webhook-test-secret-32b").toString("base64")}`;

function signedRequest(type: string, id = "msg_test_1"): Request {
  const body = JSON.stringify({
    type,
    data: { id: "user_test" },
    event_attributes: { http_request: null },
  });
  const timestamp = new Date();
  const signature = new Webhook(signingSecret).sign(id, timestamp, body);
  return new Request("https://www.fieldacq.org/api/webhooks/clerk", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "svix-id": id,
      "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "svix-signature": signature,
    },
  });
}

test("verified solo-user events are processed and recorded", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  const receipts: ClerkWebhookReceipt[] = [];
  const response = await handleClerkWebhook(signedRequest("subscriptionItem.active"), async (r) => {
    receipts.push(r);
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, disposition: "processed" });
  assert.deepEqual(receipts, [
    {
      id: "msg_test_1",
      eventType: "subscriptionItem.active",
      disposition: "processed",
    },
  ]);
});

test("verified organization events are acknowledged but ignored", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  const receipts: ClerkWebhookReceipt[] = [];
  const response = await handleClerkWebhook(signedRequest("organization.created"), async (r) => {
    receipts.push(r);
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, disposition: "ignored" });
  assert.equal(receipts[0]?.disposition, "ignored");
});

test("invalid signatures fail closed before persistence", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  let persisted = false;
  const request = signedRequest("user.created");
  request.headers.set("svix-signature", "v1,invalid");
  const response = await handleClerkWebhook(request, async () => {
    persisted = true;
  });

  assert.equal(response.status, 400);
  assert.equal(persisted, false);
});

test("actual webhook bytes are limited when Content-Length is absent", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  let persisted = false;
  const response = await handleClerkWebhook(
    new Request("https://www.fieldacq.org/api/webhooks/clerk", {
      method: "POST",
      body: "x".repeat(MAX_CLERK_WEBHOOK_BYTES + 1),
    }),
    async () => {
      persisted = true;
    },
  );

  assert.equal(response.status, 413);
  assert.equal(persisted, false);
});

test("actual webhook bytes override understated or malformed Content-Length", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  for (const contentLength of ["1", "not-a-number", "-1"]) {
    const response = await handleClerkWebhook(
      new Request("https://www.fieldacq.org/api/webhooks/clerk", {
        method: "POST",
        body: "x".repeat(MAX_CLERK_WEBHOOK_BYTES + 1),
        headers: { "content-length": contentLength },
      }),
      async () => assert.fail("oversized webhook must not be persisted"),
    );
    assert.equal(response.status, 413, contentLength);
  }
});

test("a body exactly at the webhook limit reaches signature verification", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  const response = await handleClerkWebhook(
    new Request("https://www.fieldacq.org/api/webhooks/clerk", {
      method: "POST",
      body: "x".repeat(MAX_CLERK_WEBHOOK_BYTES),
    }),
    async () => assert.fail("invalid webhook must not be persisted"),
  );

  assert.equal(response.status, 400);
});

test("a missing signing secret makes the receiver unavailable", async () => {
  delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  const response = await handleClerkWebhook(signedRequest("user.created"), async () => undefined);
  assert.equal(response.status, 503);
});
