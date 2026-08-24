import { getSql } from "@/lib/db";
import { STRIPE } from "@/lib/stripe";
import { verifyStripeSignature } from "@/lib/stripe-signature";

type StripeObject = Record<string, unknown>;

type StripeEvent = {
  id: string;
  type: string;
  data: { object: StripeObject };
};

type Entitlement = {
  userId: string | null;
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
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
}

export function isStripeWebhookConfigured() {
  return webhookSecret().length > 0;
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

async function releaseEvent(id: string) {
  const sql = await getSql();
  await sql`delete from stripe_events where id = ${id}`;
}

async function upsertEntitlement(row: Entitlement) {
  const sql = await getSql();
  if (row.userId) {
    const updated = await sql<{ id: number }>`
      update stripe_entitlements set
        checkout_session_id = coalesce(${row.checkoutSessionId}, checkout_session_id),
        subscription_id = coalesce(${row.subscriptionId}, subscription_id),
        customer_id = coalesce(${row.customerId}, customer_id),
        product_id = coalesce(${row.productId}, product_id), status = ${row.status},
        current_period_end = coalesce(${row.currentPeriodEnd}, current_period_end), updated_at = now()
      where user_id = ${row.userId} returning id
    `;
    if (updated.length) return;
  }
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
  // Subscription and invoice events can arrive before their checkout event.
  // Never create an unowned entitlement; Stripe will retry and the checkout
  // event carries the verified app user metadata needed to establish ownership.
  if (!row.userId) return;
  await sql`
    insert into stripe_entitlements (
      user_id, checkout_session_id, subscription_id, customer_id, product_id, status, current_period_end
    ) values (
      ${row.userId}, ${row.checkoutSessionId}, ${row.subscriptionId}, ${row.customerId}, ${row.productId},
      ${row.status}, ${row.currentPeriodEnd}
    )
  `;
}

async function applyEvent(event: StripeEvent) {
  const obj = event.data.object;
  const metadata = obj.metadata && typeof obj.metadata === "object" ? obj.metadata as Record<string, unknown> : {};
  const userId = asString(metadata.user_id) ?? asString(obj.client_reference_id);
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const paid = obj.payment_status === "paid" || obj.status === "complete" || obj.mode === "subscription";
      if (!paid || !userId) return;
      await upsertEntitlement({
        userId,
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
        userId,
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
        userId,
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
        userId,
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
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }
  const payload = await readLimitedText(request, 1_000_000);
  if (payload === null) return Response.json({ error: "Payload too large" }, { status: 413 });
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
  if (fresh) {
    try {
      await applyEvent(event);
    } catch (error) {
      // Allow Stripe's retry to process the event if fulfillment failed after
      // the idempotency receipt was inserted.
      await releaseEvent(event.id);
      throw error;
    }
  }
  return Response.json({ received: true });
}

async function readLimitedText(request: Request, maxBytes: number) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

export async function lookupPaidSession(sessionId: string, userId: string) {
  const sql = await getSql();
  const rows = await sql<{ status: string }>`
    select status from stripe_entitlements
    where checkout_session_id = ${sessionId} and user_id = ${userId}
    limit 1
  `;
  return rows[0]?.status === "active";
}
