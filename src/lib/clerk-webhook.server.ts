import { verifyWebhook, type WebhookEvent } from "@clerk/backend/webhooks";

export const MAX_CLERK_WEBHOOK_BYTES = 1_000_000;

class WebhookPayloadTooLargeError extends Error {}

async function requestWithBoundedBody(request: Request): Promise<Request> {
  if (!request.body) return request;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_CLERK_WEBHOOK_BYTES) {
      void reader.cancel().catch(() => undefined);
      throw new WebhookPayloadTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body,
  });
}

/**
 * Field ACQ bills individual users only. These are the Clerk events that are
 * useful for solo-account and Billing delivery auditing. Organization events
 * are accepted after signature verification but marked ignored.
 */
export const SOLO_USER_WEBHOOK_EVENTS = new Set<WebhookEvent["type"]>([
  "user.created",
  "user.updated",
  "user.deleted",
  "session.created",
  "session.ended",
  "session.removed",
  "session.revoked",
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.pastDue",
  "subscriptionItem.created",
  "subscriptionItem.updated",
  "subscriptionItem.active",
  "subscriptionItem.canceled",
  "subscriptionItem.upcoming",
  "subscriptionItem.ended",
  "subscriptionItem.abandoned",
  "subscriptionItem.incomplete",
  "subscriptionItem.pastDue",
  "subscriptionItem.freeTrialEnding",
  "paymentAttempt.created",
  "paymentAttempt.updated",
]);

export type ClerkWebhookReceipt = {
  id: string;
  eventType: WebhookEvent["type"];
  disposition: "processed" | "ignored";
};

export type ClerkWebhookReceiptStore = (receipt: ClerkWebhookReceipt) => Promise<void>;

async function recordReceipt(receipt: ClerkWebhookReceipt): Promise<void> {
  const { getSql } = await import("./db.ts");
  const sql = await getSql();
  await sql`
    insert into clerk_webhook_events (id, event_type, disposition)
    values (${receipt.id}, ${receipt.eventType}, ${receipt.disposition})
    on conflict (id) do nothing
  `;
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function handleClerkWebhook(
  request: Request,
  storeReceipt: ClerkWebhookReceiptStore = recordReceipt,
): Promise<Response> {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
  if (!signingSecret) return json({ error: "Webhook receiver is not configured" }, 503);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_CLERK_WEBHOOK_BYTES) {
    return json({ error: "Webhook payload is too large" }, 413);
  }

  let event: WebhookEvent;
  try {
    const boundedRequest = await requestWithBoundedBody(request);
    event = await verifyWebhook(boundedRequest, { signingSecret });
  } catch (error) {
    if (error instanceof WebhookPayloadTooLargeError) {
      return json({ error: "Webhook payload is too large" }, 413);
    }
    return json({ error: "Webhook verification failed" }, 400);
  }

  const eventId = request.headers.get("svix-id")?.trim();
  if (!eventId) return json({ error: "Webhook verification failed" }, 400);

  const disposition = SOLO_USER_WEBHOOK_EVENTS.has(event.type) ? "processed" : "ignored";
  try {
    await storeReceipt({ id: eventId, eventType: event.type, disposition });
  } catch {
    console.error("[clerk-webhook] failed to persist verified receipt", {
      eventId,
      eventType: event.type,
    });
    return json({ error: "Webhook processing failed" }, 500);
  }

  return json({ received: true, disposition }, 200);
}
