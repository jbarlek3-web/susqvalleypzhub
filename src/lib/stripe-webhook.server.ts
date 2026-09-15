import { createHmac, timingSafeEqual } from "node:crypto";
import type { Sql } from "./db.ts";

export const MAX_STRIPE_WEBHOOK_BYTES = 1_000_000;

export interface StripeEvent<T = Record<string, unknown>> {
  id: string;
  type: string;
  data: {
    object: T;
  };
  created?: number;
}

export function parseStripeSignature(header: string): { timestamp: number; signatures: string[] } {
  const parts = header.split(",");
  let timestamp = -1;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key === "t") {
      timestamp = parseInt(value, 10);
    } else if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  if (!signatureHeader || !secret) return false;
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (timestamp <= 0 || signatures.length === 0) return false;

  if (toleranceSeconds > 0) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return false;
    }
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  const expectedBuf = Buffer.from(expectedSignature, "utf8");

  for (const sig of signatures) {
    const sigBuf = Buffer.from(sig, "utf8");
    if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
      return true;
    }
  }

  return false;
}

export async function processStripeEvent(
  event: StripeEvent,
  sqlClient?: Sql,
): Promise<{ processed: boolean; duplicate: boolean }> {
  const { getSql } = await import("./db.ts");
  const sql = sqlClient ?? (await getSql());

  return await sql.transaction(async (tx) => {
    // Record event receipt idempotently with ON CONFLICT (id) DO NOTHING
    const inserted = await tx<{ id: string }>`
      insert into stripe_events (id, type)
      values (${event.id}, ${event.type})
      on conflict (id) do nothing
      returning id
    `;

    if (inserted.length === 0) {
      // Event already recorded
      return { processed: false, duplicate: true };
    }

    const obj = event.data?.object as Record<string, any> | undefined;
    if (!obj) return { processed: true, duplicate: false };

    if (event.type === "checkout.session.completed") {
      const sessionId = typeof obj.id === "string" ? obj.id : null;
      const customerId =
        typeof obj.customer === "string"
          ? obj.customer
          : typeof obj.customer?.id === "string"
            ? obj.customer.id
            : null;
      const subscriptionId =
        typeof obj.subscription === "string"
          ? obj.subscription
          : typeof obj.subscription?.id === "string"
            ? obj.subscription.id
            : null;
      const clientRefId = typeof obj.client_reference_id === "string" ? obj.client_reference_id.trim() : null;
      let organizationId = typeof obj.metadata?.organizationId === "string" && obj.metadata.organizationId.trim() ? obj.metadata.organizationId.trim() : null;
      let userId = typeof obj.metadata?.userId === "string" && obj.metadata.userId.trim() ? obj.metadata.userId.trim() : null;
      
      if (clientRefId) {
        if (clientRefId.startsWith("org_")) {
          organizationId = organizationId || clientRefId;
          userId = null;
        } else {
          userId = userId || clientRefId;
          organizationId = null;
        }
      }

      const status = obj.payment_status === "paid" ? "active" : (obj.status ?? "active");

      const existing = await tx<{ id: number }>`
        select id from stripe_entitlements
        where (${organizationId}::text is not null and organization_id = ${organizationId})
           or (${userId}::text is not null and user_id = ${userId})
           or (${subscriptionId}::text is not null and subscription_id = ${subscriptionId})
           or (${sessionId}::text is not null and checkout_session_id = ${sessionId})
        limit 1
      `;

      if (existing.length > 0) {
        await tx`
          update stripe_entitlements
          set organization_id = case when ${organizationId}::text is not null then ${organizationId} when ${userId}::text is not null then null else organization_id end,
              user_id = case when ${userId}::text is not null then ${userId} when ${organizationId}::text is not null then null else user_id end,
              subscription_id = coalesce(${subscriptionId}, subscription_id),
              customer_id = coalesce(${customerId}, customer_id),
              checkout_session_id = coalesce(${sessionId}, checkout_session_id),
              status = ${status},
              updated_at = now()
          where id = ${existing[0].id}
        `;
      } else {
        await tx`
          insert into stripe_entitlements
            (organization_id, user_id, subscription_id, customer_id, checkout_session_id, status, updated_at)
          values
            (${organizationId}, ${userId}, ${subscriptionId}, ${customerId}, ${sessionId}, ${status}, now())
        `;
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscriptionId = typeof obj.id === "string" ? obj.id : null;
      const customerId =
        typeof obj.customer === "string"
          ? obj.customer
          : typeof obj.customer?.id === "string"
            ? obj.customer.id
            : null;
      const organizationId =
        typeof obj.metadata?.organizationId === "string" && obj.metadata.organizationId.trim()
          ? obj.metadata.organizationId.trim()
          : null;
      let userId =
        typeof obj.metadata?.userId === "string" && obj.metadata.userId.trim()
          ? obj.metadata.userId.trim()
          : null;

      if (organizationId && userId) {
        // If both are present in metadata (which shouldn't normally happen unless tracking),
        // we fallback to ensuring we don't store both. In Clerk billing, the subscriber
        // type is usually indicated by which ID is primary.
        userId = null; // Default to org if both are passed
      }
      const status = typeof obj.status === "string" ? obj.status : "active";
      const currentPeriodEnd =
        typeof obj.current_period_end === "number"
          ? new Date(obj.current_period_end * 1000)
          : null;
      const productId =
        typeof obj.items?.data?.[0]?.price?.product === "string"
          ? obj.items.data[0].price.product
          : null;

      const existing = await tx<{ id: number }>`
        select id from stripe_entitlements
        where (${subscriptionId}::text is not null and subscription_id = ${subscriptionId})
           or (${organizationId}::text is not null and organization_id = ${organizationId})
           or (${userId}::text is not null and user_id = ${userId})
           or (${customerId}::text is not null and customer_id = ${customerId})
        limit 1
      `;

      if (existing.length > 0) {
        await tx`
          update stripe_entitlements
          set organization_id = case when ${organizationId}::text is not null then ${organizationId} when ${userId}::text is not null then null else organization_id end,
              user_id = case when ${userId}::text is not null then ${userId} when ${organizationId}::text is not null then null else user_id end,
              subscription_id = coalesce(${subscriptionId}, subscription_id),
              customer_id = coalesce(${customerId}, customer_id),
              product_id = coalesce(${productId}, product_id),
              status = ${status},
              current_period_end = coalesce(${currentPeriodEnd}, current_period_end),
              updated_at = now()
          where id = ${existing[0].id}
        `;
      } else {
        await tx`
          insert into stripe_entitlements
            (organization_id, user_id, subscription_id, customer_id, product_id, status, current_period_end, updated_at)
          values
            (${organizationId}, ${userId}, ${subscriptionId}, ${customerId}, ${productId}, ${status}, ${currentPeriodEnd}, now())
        `;
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscriptionId = typeof obj.id === "string" ? obj.id : null;
      const customerId =
        typeof obj.customer === "string"
          ? obj.customer
          : typeof obj.customer?.id === "string"
            ? obj.customer.id
            : null;
      const currentPeriodEnd =
        typeof obj.current_period_end === "number"
          ? new Date(obj.current_period_end * 1000)
          : null;

      const existing = await tx<{ id: number }>`
        select id from stripe_entitlements
        where (${subscriptionId}::text is not null and subscription_id = ${subscriptionId})
           or (${customerId}::text is not null and customer_id = ${customerId})
        limit 1
      `;

      if (existing.length > 0) {
        await tx`
          update stripe_entitlements
          set status = 'canceled',
              current_period_end = coalesce(${currentPeriodEnd}, current_period_end),
              updated_at = now()
          where id = ${existing[0].id}
        `;
      }
    }

    return { processed: true, duplicate: false };
  });
}

export async function handleStripeWebhook(
  request: Request,
  options?: {
    secret?: string;
    toleranceSeconds?: number;
    sqlClient?: Sql;
  },
): Promise<Response> {
  const secret = options?.secret ?? process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { error: "Stripe webhook receiver is not configured" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_STRIPE_WEBHOOK_BYTES) {
    return Response.json(
      { error: "Webhook payload is too large" },
      { status: 413, headers: { "cache-control": "no-store" } },
    );
  }

  let rawBody: string;
  try {
    if (!request.body) {
      rawBody = "";
    } else {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_STRIPE_WEBHOOK_BYTES) {
          void reader.cancel().catch(() => undefined);
          return Response.json(
            { error: "Webhook payload is too large" },
            { status: 413, headers: { "cache-control": "no-store" } },
          );
        }
        chunks.push(value);
      }
      const full = new Uint8Array(totalBytes);
      let offset = 0;
      for (const c of chunks) {
        full.set(c, offset);
        offset += c.byteLength;
      }
      rawBody = new TextDecoder().decode(full);
    }
  } catch {
    return Response.json(
      { error: "Failed to read request body" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const sigHeader = request.headers.get("stripe-signature");
  const isValid = verifyStripeSignature(
    rawBody,
    sigHeader,
    secret,
    options?.toleranceSeconds ?? 300,
  );

  if (!isValid) {
    return Response.json(
      { error: "Invalid stripe signature" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
    if (!event || typeof event.id !== "string" || typeof event.type !== "string") {
      throw new Error("Missing required event fields");
    }
  } catch {
    return Response.json(
      { error: "Malformed event payload" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const result = await processStripeEvent(event, options?.sqlClient);
    return Response.json(
      { received: true, ...result },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error("[stripe-webhook] processing error", { eventId: event.id, err });
    return Response.json(
      { error: "Stripe webhook processing failed" },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
