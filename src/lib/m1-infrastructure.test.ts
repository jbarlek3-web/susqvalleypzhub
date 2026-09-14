import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { getSql } from "./db.ts";
import {
  handleStripeWebhook,
  verifyStripeSignature,
  processStripeEvent,
  MAX_STRIPE_WEBHOOK_BYTES,
  type StripeEvent,
} from "./stripe-webhook.server.ts";
import { handleClerkWebhook } from "./clerk-webhook.server.ts";
import {
  StreamInputSchema,
  streamOrdinanceAide,
} from "./ordinance-agent.ts";

const STRIPE_SECRET = "whsec_test_m1_stripe_secret_1234567890";
const CLERK_SECRET = `whsec_${Buffer.from("field-acq-clerk-m1-secret-32b-key!").toString("base64")}`;

function createSignedStripeRequest(
  payload: Record<string, unknown>,
  timestamp = Math.floor(Date.now() / 1000),
  secret = STRIPE_SECRET,
): Request {
  const body = JSON.stringify(payload);
  const toSign = `${timestamp}.${body}`;
  const sig = createHmac("sha256", secret).update(toSign, "utf8").digest("hex");
  return new Request("https://www.fieldacq.org/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "stripe-signature": `t=${timestamp},v1=${sig}`,
    },
  });
}

function createSignedClerkRequest(
  bodyObj: Record<string, unknown>,
  type: string,
  id = "msg_m1_" + Math.random().toString(36).slice(2),
  timestamp = new Date(),
  secret = CLERK_SECRET,
): Request {
  const body = JSON.stringify({
    type,
    data: bodyObj,
    event_attributes: { http_request: null },
  });
  const timestampSec = Math.floor(timestamp.getTime() / 1000);
  const toSign = `${id}.${timestampSec}.${body}`;
  const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const keyBytes = Buffer.from(secretKey, "base64");
  const sig = createHmac("sha256", keyBytes).update(toSign).digest("base64");
  return new Request("https://www.fieldacq.org/api/webhooks/clerk", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "svix-id": id,
      "svix-timestamp": String(timestampSec),
      "svix-signature": `v1,${sig}`,
    },
  });
}

// ===========================================================================
// Test Group 1: Unified DB Connection Management & Atomic Transactions
// ===========================================================================

test("M1-DB-1: Sql interface supports .transaction(...) and commits successfully", async () => {
  const sql = await getSql();
  assert.equal(typeof sql.transaction, "function", "sql.transaction should be a function");

  await sql`create table if not exists test_m1_tx (id text primary key, value text)`;
  await sql`delete from test_m1_tx`;

  const result = await sql.transaction(async (tx) => {
    await tx`insert into test_m1_tx (id, value) values ('tx_1', 'committed_value')`;
    const rows = await tx<{ id: string; value: string }>`select * from test_m1_tx where id = 'tx_1'`;
    return rows[0]?.value;
  });

  assert.equal(result, "committed_value");

  const verifyRows = await sql<{ id: string; value: string }>`select * from test_m1_tx where id = 'tx_1'`;
  assert.equal(verifyRows.length, 1);
  assert.equal(verifyRows[0].value, "committed_value");
});

test("M1-DB-2: Sql transaction rolls back atomically when error is thrown", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_m1_tx (id text primary key, value text)`;

  let caught = false;
  try {
    await sql.transaction(async (tx) => {
      await tx`insert into test_m1_tx (id, value) values ('tx_fail', 'should_rollback')`;
      throw new Error("Simulated transaction failure");
    });
  } catch (err: unknown) {
    caught = true;
    assert.equal((err as Error).message, "Simulated transaction failure");
  }

  assert.equal(caught, true);

  const verifyRows = await sql<{ id: string }>`select * from test_m1_tx where id = 'tx_fail'`;
  assert.equal(verifyRows.length, 0, "Row should have rolled back");
});

test("M1-DB-3: Nested transactions execute safely without connection leaks", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_m1_tx (id text primary key, value text)`;

  const outerResult = await sql.transaction(async (outerTx) => {
    await outerTx`insert into test_m1_tx (id, value) values ('tx_nested_outer', 'outer')`;
    const innerResult = await outerTx.transaction(async (innerTx) => {
      await innerTx`insert into test_m1_tx (id, value) values ('tx_nested_inner', 'inner')`;
      return "inner_done";
    });
    return innerResult;
  });

  assert.equal(outerResult, "inner_done");
  const rows = await sql<{ id: string }>`select id from test_m1_tx where id in ('tx_nested_outer', 'tx_nested_inner')`;
  assert.equal(rows.length, 2);
});

test("M1-DB-4: Concurrent transactions execute without connection pool exhaustion", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_m1_tx (id text primary key, value text)`;

  const concurrentTasks = Array.from({ length: 8 }, (_, i) => {
    return sql.transaction(async (tx) => {
      const id = `tx_concurrent_${i}`;
      await tx`insert into test_m1_tx (id, value) values (${id}, ${'val_' + i})`;
      const rows = await tx<{ id: string }>`select id from test_m1_tx where id = ${id}`;
      return rows.length === 1;
    });
  });

  const results = await Promise.all(concurrentTasks);
  assert.ok(results.every((r) => r === true));
});

// ===========================================================================
// Test Group 2: Stripe Webhook Signature Verification
// ===========================================================================

test("M1-Stripe-1: Timing-safe HMAC verification succeeds for valid signature", () => {
  const body = JSON.stringify({ id: "evt_test", type: "payment_intent.succeeded" });
  const now = Math.floor(Date.now() / 1000);
  const toSign = `${now}.${body}`;
  const validSig = createHmac("sha256", STRIPE_SECRET).update(toSign, "utf8").digest("hex");
  const header = `t=${now},v1=${validSig}`;

  const isValid = verifyStripeSignature(body, header, STRIPE_SECRET, 300);
  assert.equal(isValid, true);
});

test("M1-Stripe-2: Verification fails closed for forged or tampered signature", () => {
  const body = JSON.stringify({ id: "evt_tampered", type: "customer.subscription.created" });
  const now = Math.floor(Date.now() / 1000);
  const header = `t=${now},v1=deadbeefcafebabe00112233445566778899aabbccddeeff0011223344556677`;

  const isValid = verifyStripeSignature(body, header, STRIPE_SECRET, 300);
  assert.equal(isValid, false);
});

test("M1-Stripe-3: Expired timestamp beyond tolerance window is rejected", () => {
  const body = JSON.stringify({ id: "evt_stale", type: "customer.subscription.created" });
  const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
  const toSign = `${oldTimestamp}.${body}`;
  const sig = createHmac("sha256", STRIPE_SECRET).update(toSign, "utf8").digest("hex");
  const header = `t=${oldTimestamp},v1=${sig}`;

  const isValid = verifyStripeSignature(body, header, STRIPE_SECRET, 300);
  assert.equal(isValid, false);
});

test("M1-Stripe-4: Missing secret returns HTTP 503", async () => {
  const req = createSignedStripeRequest({ id: "evt_nosecret", type: "customer.subscription.created" });
  const res = await handleStripeWebhook(req, { secret: "" });
  assert.equal(res.status, 503);
});

test("M1-Stripe-5: Oversized body exceeding 1MB returns HTTP 413", async () => {
  const oversizedPayload = "a".repeat(MAX_STRIPE_WEBHOOK_BYTES + 10);
  const req = new Request("https://www.fieldacq.org/api/webhooks/stripe", {
    method: "POST",
    body: oversizedPayload,
    headers: {
      "content-type": "application/json",
      "content-length": String(oversizedPayload.length),
      "stripe-signature": "t=12345,v1=abc",
    },
  });

  const res = await handleStripeWebhook(req, { secret: STRIPE_SECRET });
  assert.equal(res.status, 413);
});

// ===========================================================================
// Test Group 3: Stripe Subscription State Transitions & Idempotency
// ===========================================================================

test("M1-Stripe-6: customer.subscription.created synchronizes entitlement", async () => {
  const sql = await getSql();
  const subId = "sub_m1_test_" + Date.now();
  const userId = "user_m1_sub_" + Date.now();
  const periodEnd = Math.floor(Date.now() / 1000) + 30 * 86400;

  const event: StripeEvent = {
    id: "evt_sub_created_" + Date.now(),
    type: "customer.subscription.created",
    data: {
      object: {
        id: subId,
        customer: "cus_m1_test_99",
        status: "active",
        current_period_end: periodEnd,
        metadata: { userId },
      },
    },
  };

  const req = createSignedStripeRequest(event as unknown as Record<string, unknown>);
  const res = await handleStripeWebhook(req, { secret: STRIPE_SECRET });
  assert.equal(res.status, 200);

  const rows = await sql<{ subscription_id: string; status: string; user_id: string }>`
    select subscription_id, status, user_id from stripe_entitlements where subscription_id = ${subId}
  `;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "active");
  assert.equal(rows[0].user_id, userId);
});

test("M1-Stripe-7: Duplicate delivery with same event ID is idempotent", async () => {
  const sql = await getSql();
  const eventId = "evt_m1_dup_" + Date.now();
  const subId = "sub_m1_dup_" + Date.now();

  const event: StripeEvent = {
    id: eventId,
    type: "customer.subscription.created",
    data: {
      object: {
        id: subId,
        customer: "cus_dup",
        status: "active",
      },
    },
  };

  const res1 = await processStripeEvent(event);
  assert.equal(res1.processed, true);
  assert.equal(res1.duplicate, false);

  const res2 = await processStripeEvent(event);
  assert.equal(res2.processed, false);
  assert.equal(res2.duplicate, true);

  const eventRows = await sql<{ id: string }>`select id from stripe_events where id = ${eventId}`;
  assert.equal(eventRows.length, 1, "Only one event record should exist");
});

test("M1-Stripe-8: customer.subscription.deleted marks entitlement canceled", async () => {
  const sql = await getSql();
  const subId = "sub_m1_del_" + Date.now();

  // Seed active subscription
  await sql`
    insert into stripe_entitlements (subscription_id, customer_id, status, updated_at)
    values (${subId}, 'cus_to_del', 'active', now())
  `;

  const deleteEvent: StripeEvent = {
    id: "evt_del_" + Date.now(),
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: subId,
        customer: "cus_to_del",
        status: "canceled",
      },
    },
  };

  const res = await processStripeEvent(deleteEvent);
  assert.equal(res.processed, true);

  const rows = await sql<{ status: string }>`
    select status from stripe_entitlements where subscription_id = ${subId}
  `;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "canceled");
});

test("M1-Stripe-9: checkout.session.completed updates entitlement with user_id and session_id", async () => {
  const sql = await getSql();
  const sessionId = "cs_m1_checkout_" + Date.now();
  const userId = "user_m1_chk_" + Date.now();

  const checkoutEvent: StripeEvent = {
    id: "evt_chk_" + Date.now(),
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        customer: "cus_chk_1",
        client_reference_id: userId,
        payment_status: "paid",
      },
    },
  };

  const res = await processStripeEvent(checkoutEvent);
  assert.equal(res.processed, true);

  const rows = await sql<{ user_id: string; checkout_session_id: string; status: string }>`
    select user_id, checkout_session_id, status from stripe_entitlements where checkout_session_id = ${sessionId}
  `;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].user_id, userId);
  assert.equal(rows[0].status, "active");
});

// ===========================================================================
// Test Group 4: Clerk Webhook User Lifecycle Sync
// ===========================================================================

test("M1-Clerk-1: user.created syncs user profile into database", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = CLERK_SECRET;
  const sql = await getSql();
  const userId = "user_m1_sync_" + Date.now();

  const req = createSignedClerkRequest(
    {
      id: userId,
      first_name: "James",
      last_name: "Barlek",
      email_addresses: [
        { id: "email_1", email_address: "jbarlek@example.org", verification: { status: "verified" } },
      ],
      primary_email_address_id: "email_1",
    },
    "user.created",
  );

  const res = await handleClerkWebhook(req);
  assert.equal(res.status, 200);

  const users = await sql<{ id: string; name: string; email: string; emailVerified: boolean }>`
    select "id", "name", "email", "emailVerified" from "user" where "id" = ${userId}
  `;
  assert.equal(users.length, 1);
  assert.equal(users[0].name, "James Barlek");
  assert.equal(users[0].email, "jbarlek@example.org");
  assert.equal(users[0].emailVerified, true);
});

test("M1-Clerk-2: user.updated updates existing user record", async () => {
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = CLERK_SECRET;
  const sql = await getSql();
  const userId = "user_m1_update_" + Date.now();

  // Create initial user
  const reqCreate = createSignedClerkRequest(
    {
      id: userId,
      first_name: "Initial",
      last_name: "Name",
      email_addresses: [{ id: "em_init", email_address: "init@example.org", verification: { status: "verified" } }],
      primary_email_address_id: "em_init",
    },
    "user.created",
  );
  await handleClerkWebhook(reqCreate);

  // Update user
  const reqUpdate = createSignedClerkRequest(
    {
      id: userId,
      first_name: "Updated",
      last_name: "Name",
      email_addresses: [{ id: "em_up", email_address: "updated@example.org", verification: { status: "verified" } }],
      primary_email_address_id: "em_up",
    },
    "user.updated",
  );
  const res = await handleClerkWebhook(reqUpdate);
  assert.equal(res.status, 200);

  const updatedUsers = await sql<{ name: string; email: string }>`
    select "name", "email" from "user" where "id" = ${userId}
  `;
  assert.equal(updatedUsers.length, 1);
  assert.equal(updatedUsers[0].name, "Updated Name");
  assert.equal(updatedUsers[0].email, "updated@example.org");
});

// ===========================================================================
// Test Group 5: SSE Stream Pipeline & Input Validation
// ===========================================================================

test("M1-SSE-1: StreamInputSchema validates valid input and rejects invalid county", () => {
  const validInput = {
    county: "York",
    municipality: "York City",
    messages: [{ role: "user", content: "What are the zoning setbacks in C-1?" }],
    topic: "zoning",
  };
  const parsed = StreamInputSchema.safeParse(validInput);
  assert.equal(parsed.success, true);

  const invalidInput = {
    county: "InvalidCounty",
    municipality: "Town",
    messages: [{ role: "user", content: "Question?" }],
  };
  const parsedInvalid = StreamInputSchema.safeParse(invalidInput);
  assert.equal(parsedInvalid.success, false);
});

test("M1-SSE-2: streamOrdinanceAide rejects when XAI_API_KEY is missing", async () => {
  const oldKey = process.env.XAI_API_KEY;
  delete process.env.XAI_API_KEY;
  try {
    const res = await streamOrdinanceAide(
      {
        county: "York",
        municipality: "York City",
        messages: [{ role: "user", content: "What are the setbacks?" }],
      },
      "user_sse_test",
    );
    assert.equal(res.status, 503);
    const body = (await res.json()) as { ok: boolean; error: string };
    assert.equal(body.ok, false);
    assert.equal(body.error, "The Ordinance Aide is unavailable.");
  } finally {
    if (oldKey) process.env.XAI_API_KEY = oldKey;
  }
});
