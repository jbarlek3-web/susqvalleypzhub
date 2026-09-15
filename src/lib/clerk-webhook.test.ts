import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";

class WebhookFallback {
  secret: string;
  constructor(secret: string) {
    this.secret = secret;
  }
  sign(id: string, timestamp: Date, body: string): string {
    const timestampSec = Math.floor(timestamp.getTime() / 1000);
    const toSign = `${id}.${timestampSec}.${body}`;
    const secretKey = this.secret.startsWith("whsec_") ? this.secret.slice(6) : this.secret;
    const keyBytes = Buffer.from(secretKey, "base64");
    const sig = createHmac("sha256", keyBytes).update(toSign).digest("base64");
    return `v1,${sig}`;
  }
}

let WebhookClass: any = WebhookFallback;
try {
  const mod = await import("standardwebhooks");
  if (mod?.Webhook) {
    WebhookClass = mod.Webhook;
  }
} catch {
  try {
    const { createRequire } = await import("node:module");
    const { pathToFileURL } = await import("node:url");
    const require = createRequire(import.meta.url);
    const resolved = require.resolve("standardwebhooks");
    const mod = await import(pathToFileURL(resolved).href);
    if (mod?.Webhook) {
      WebhookClass = mod.Webhook;
    }
  } catch {
    // Use WebhookFallback
  }
}
const Webhook = WebhookClass;
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

test("verified user.deleted events trigger user data purging", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  const receipts: ClerkWebhookReceipt[] = [];
  const purgedUsers: string[] = [];
  const response = await handleClerkWebhook(
    signedRequest("user.deleted"),
    async (r) => {
      receipts.push(r);
    },
    async (userId) => {
      purgedUsers.push(userId);
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, disposition: "processed" });
  assert.deepEqual(receipts, [
    {
      id: "msg_test_1",
      eventType: "user.deleted",
      disposition: "processed",
    },
  ]);
  assert.deepEqual(purgedUsers, ["user_test"]);
});

test("user.deleted events return 500 when purge fails to prompt webhook retry", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  const response = await handleClerkWebhook(
    signedRequest("user.deleted"),
    async () => undefined,
    async () => {
      throw new Error("Database connection lost during purge");
    },
  );

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "User purge failed" });
});

test("verified organization events are processed", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = signingSecret;
  const receipts: ClerkWebhookReceipt[] = [];
  const response = await handleClerkWebhook(signedRequest("organization.created"), async (r) => {
    receipts.push(r);
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true, disposition: "processed" });
  assert.equal(receipts[0]?.disposition, "processed");
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
