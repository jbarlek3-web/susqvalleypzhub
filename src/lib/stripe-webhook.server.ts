import { createHmac, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";
import { STRIPE } from "@/lib/stripe";

const SIGN_TOLERANCE_SEC = 300;

type StripeObject = Record<string, unknown>;

type StripeEvent = {
  id: string;
  type: string;
  data: { object: StripeObject };
};

type Entitlement = {
  checkoutSessionId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  productId: string | null;
  status: string;
  currentPeriodEnd: string | null;
};

function asString(value: unknown) {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") {
    return value.id;
  }
  return null;
}

function asUnixIso(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

function webhookSecret() {
  return (
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
    "whsec_ztXDedEXH0ZLYXlI7ymsddNkWRqvKNeU"
  );
}

export function isStripeWebhookConfigured() {
  return webhookSecret().length > 0;
}

function parseSignatureHeader(header: string) {
  const timestamp = header
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = header
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  return { timestamp, signatures };
}

export function verifyStripeSignature(payload: string, header: string, secret: string) {
  const { timestamp, signatures } = parseSignatureHeader(header);
  if (!timestamp || signatures.length === 0) throw new Error("Missing Stripe signature");
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGN_TOLERANCE_SEC) throw new Error("Stripe timestamp expired");
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const match = signatures.some((sig) => {
    const got = Buffer.from(sig, "utf8");
    return got.length === expectedBuf.length && timingSafeEqual(got, expectedBuf);
  });
  if (!match) throw new Error("Stripe signature mismatch");
}

function subscriptionStatus(raw: string | null) {
  if (raw === "active" || raw === "trialing") return "active";
  if (raw === "past_due") return "past_due";
  if (raw === "canceled" || raw === "unpaid" || raw === "incomplete_expired") return "canceled";
  return raw || "active";
}

async function recordEvent(id: string, type: string) {
  const sql = await getSql();
  const inserted = await sql<{ id: string }>`
    insert into stripe_events (id, type) values (${id}, ${type})
    on conflict (id) do nothing
    returning id
  `;
  return inserted.length > 0;
}

async function upsertEntitlement(row: Entitlement) {
  const sql = await getSql();
  if (row.checkoutSessionId) {
    const updated = await sql<{ id: number }>`
      update stripe_entitlements
      set
        subscription_id = coalesce(${row.subscriptionId}, subscription_id),
        customer_id = coalesce(${row.customerId}, customer_id),
        product_id = coalesce(${row.productId}, product_id),
        status = ${row.status},
        current_period_end = coalesce(${row.currentPeriodEnd}, current_period_end),
        updated_at = now()
      where checkout_session_id = ${row.checkoutSessionId}
      returning id
    `;
    if (updated.length) return;
  }
  if (row.subscriptionId) {
    const updated = await sql<{ id: number }>`
      update stripe_entitlements
      set
        checkout_session_id = coalesce(checkout_session_id, ${row.checkoutSessionId}),
        customer_id = coalesce(${row.customerId}, customer_id),
        product_id = coalesce(${row.productId}, product_id),
        status = ${row.status},
        current_period_end = coalesce(${row.currentPeriodEnd}, current_period_end),
        updated_at = now()
      where subscription_id = ${row.subscriptionId}
      returning id
    `;
    if (updated.length) return;
  }
  await sql`
    insert into stripe_entitlements (
      checkout_session_id, subscription_id, customer_id, product_id, status, current_period_end
    ) values (
      ${row.checkoutSessionId}, ${row.subscriptionId}, ${row.customerId}, ${row.productId},
      ${row.status}, ${row.currentPeriodEnd}
    )
  `;
}

async function applyEvent(event: StripeEvent) {
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const paid = obj.payment_status === "paid" || obj.status === "complete" || obj.mode === "subscription";
      if (!paid) return;
      await upsertEntitlement({
        checkoutSessionId: asString(obj.id),
        subscriptionId: asString(obj.subscription),
        customerId: asString(obj.customer),
        productId: STRIPE.productId,
        status: "active",
        currentPeriodEnd: null,
      });
      return;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertEntitlement({
        checkoutSessionId: null,
        subscriptionId: asString(obj.id),
        customerId: asString(obj.customer),
        productId: STRIPE.productId,
        status: subscriptionStatus(asString(obj.status)),
        currentPeriodEnd: asUnixIso(obj.current_period_end),
      });
      return;
    }
    case "invoice.paid": {
      await upsertEntitlement({
        checkoutSessionId: asString(obj.checkout_session),
        subscriptionId: asString(obj.subscription),
        customerId: asString(obj.customer),
        productId: STRIPE.productId,
        status: "active",
        currentPeriodEnd: asUnixIso(obj.period_end),
      });
      return;
    }
    case "invoice.payment_failed": {
      await upsertEntitlement({
        checkoutSessionId: asString(obj.checkout_session),
        subscriptionId: asString(obj.subscription),
        customerId: asString(obj.customer),
        productId: STRIPE.productId,
        status: "past_due",
        currentPeriodEnd: asUnixIso(obj.period_end),
      });
      return;
    }
    default:
      return;
  }
}

export async function handleStripeWebhook(request: Request) {
  const secret = webhookSecret();
  if (!secret) {
    return Response.json({ error: "Webhook secret is not configured" }, { status: 503 });
  }
  const payload = await request.text();
  const header = request.headers.get("stripe-signature") ?? "";
  try {
    verifyStripeSignature(payload, header, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!event?.id || !event.type) {
    return Response.json({ error: "Invalid event" }, { status: 400 });
  }
  const fresh = await recordEvent(event.id, event.type);
  if (fresh) await applyEvent(event);
  return Response.json({ received: true });
}

export async function lookupPaidSession(sessionId: string) {
  const sql = await getSql();
  const rows = await sql<{ status: string }>`
    select status from stripe_entitlements
    where checkout_session_id = ${sessionId}
    limit 1
  `;
  return rows[0]?.status === "active";
}
