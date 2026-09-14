import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookEvent } from "@clerk/backend/webhooks";

export type { WebhookEvent };

let resolvedVerifyWebhook:
  | ((req: Request, options: { signingSecret: string }) => Promise<WebhookEvent>)
  | null = null;

async function getVerifyWebhook(): Promise<
  (req: Request, options: { signingSecret: string }) => Promise<WebhookEvent>
> {
  if (resolvedVerifyWebhook) return resolvedVerifyWebhook;
  try {
    const backendWebhooks = await import("@clerk/backend/webhooks");
    if (backendWebhooks?.verifyWebhook) {
      const fn = backendWebhooks.verifyWebhook;
      resolvedVerifyWebhook = fn;
      return fn;
    }
  } catch {
    try {
      const { createRequire } = await import("node:module");
      const { pathToFileURL } = await import("node:url");
      const require = createRequire(import.meta.url);
      const resolved = require.resolve("@clerk/backend/webhooks");
      const backendWebhooks = await import(pathToFileURL(resolved).href);
      if (backendWebhooks?.verifyWebhook) {
        const fn = backendWebhooks.verifyWebhook;
        resolvedVerifyWebhook = fn;
        return fn;
      }
    } catch {
      // Fallback implementation using standard webhooks specification
    }
  }

  resolvedVerifyWebhook = async (
    request: Request,
    options: { signingSecret: string },
  ): Promise<WebhookEvent> => {
    const id = request.headers.get("svix-id")?.trim();
    const timestamp = request.headers.get("svix-timestamp")?.trim();
    const signature = request.headers.get("svix-signature")?.trim();
    if (!id || !timestamp || !signature) {
      throw new Error("Missing svix headers");
    }
    const bodyText = await request.text();
    const secret = options.signingSecret;
    const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const keyBytes = Buffer.from(secretKey, "base64");
    const toSign = `${id}.${timestamp}.${bodyText}`;
    const expectedSig = `v1,${createHmac("sha256", keyBytes).update(toSign).digest("base64")}`;

    const sigs = signature.split(" ");
    let matched = false;
    for (const s of sigs) {
      const bufS = Buffer.from(s);
      const bufExp = Buffer.from(expectedSig);
      if (bufS.length === bufExp.length && timingSafeEqual(bufS, bufExp)) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error("Invalid signature");
    }
    return JSON.parse(bodyText) as WebhookEvent;
  };
  return resolvedVerifyWebhook;
}

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

export type ClerkWebhookUserData = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ClerkWebhookUserSyncer = (userData: ClerkWebhookUserData) => Promise<void>;

async function syncUserData(userData: ClerkWebhookUserData): Promise<void> {
  const { getSql } = await import("./db.ts");
  const sql = await getSql();
  await sql`
    insert into "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
    values (
      ${userData.id},
      ${userData.name},
      ${userData.email},
      ${userData.emailVerified},
      ${userData.image},
      ${userData.createdAt},
      ${userData.updatedAt}
    )
    on conflict ("id") do update set
      "name" = excluded."name",
      "email" = excluded."email",
      "emailVerified" = excluded."emailVerified",
      "image" = excluded."image",
      "updatedAt" = excluded."updatedAt"
  `;
}

export type ClerkWebhookUserPurger = (userId: string) => Promise<void>;

async function purgeUserData(userId: string): Promise<void> {
  try {
    const { disconnectGoogleDrive } = await import("./google-drive.server.ts");
    await disconnectGoogleDrive(userId);
  } catch {
    // Best-effort external revocation failure does not abort local data deletion
  }

  const { getSql } = await import("./db.ts");
  const sql = await getSql();
  await sql`delete from google_drive_connections where user_id = ${userId}`;
  await sql`delete from google_drive_oauth_states where user_id = ${userId}`;
  await sql`delete from stripe_entitlements where user_id = ${userId}`;
  await sql`delete from ai_credit_accounts where user_id = ${userId}`;
  await sql`delete from ai_usage_periods where user_id = ${userId}`;
  await sql`delete from free_usage where user_id = ${userId}`;
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
  purgeUser: ClerkWebhookUserPurger = purgeUserData,
  syncUser: ClerkWebhookUserSyncer = syncUserData,
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
    const verify = await getVerifyWebhook();
    event = await verify(boundedRequest, { signingSecret });
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

  if (
    (event.type === "user.created" || event.type === "user.updated") &&
    typeof event.data?.id === "string" &&
    event.data.id.trim()
  ) {
    const d = event.data as unknown as Record<string, unknown>;
    const emailAddresses = Array.isArray(d.email_addresses)
      ? (d.email_addresses as Array<Record<string, unknown>>)
      : [];
    const primaryId = typeof d.primary_email_address_id === "string" ? d.primary_email_address_id : null;
    const primaryEmailObj = emailAddresses.find((e) => e.id === primaryId) ?? emailAddresses[0];
    const emailAddress = typeof primaryEmailObj?.email_address === "string" ? primaryEmailObj.email_address.trim() : "";
    const email = emailAddress || `${event.data.id.trim()}@user.clerk.internal`;

    const verificationObj = primaryEmailObj?.verification as Record<string, unknown> | undefined;
    const verificationStatus = typeof verificationObj?.status === "string" ? verificationObj.status : "";
    const emailVerified = verificationStatus === "verified" || verificationStatus === "transfer_verified";

    const firstName = typeof d.first_name === "string" ? d.first_name.trim() : "";
    const lastName = typeof d.last_name === "string" ? d.last_name.trim() : "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0] || "User";

    const image =
      typeof d.image_url === "string" && d.image_url.trim()
        ? d.image_url.trim()
        : typeof d.profile_image_url === "string" && d.profile_image_url.trim()
          ? d.profile_image_url.trim()
          : null;

    const createdAt = typeof d.created_at === "number" ? new Date(d.created_at) : new Date();
    const updatedAt = typeof d.updated_at === "number" ? new Date(d.updated_at) : new Date();

    try {
      await syncUser({
        id: event.data.id.trim(),
        name,
        email,
        emailVerified,
        image,
        createdAt,
        updatedAt,
      });
    } catch (err) {
      console.error("[clerk-webhook] failed to sync user data", {
        eventId,
        userId: event.data.id,
        err,
      });
      return json({ error: "User sync failed" }, 500);
    }
  }

  if (event.type === "user.deleted" && typeof event.data?.id === "string" && event.data.id.trim()) {
    try {
      await purgeUser(event.data.id.trim());
    } catch (err) {
      console.error("[clerk-webhook] failed to purge data for deleted user", {
        eventId,
        userId: event.data.id,
        err,
      });
      return json({ error: "User purge failed" }, 500);
    }
  }

  return json({ received: true, disposition }, 200);
}
