import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";
import Stripe from "stripe";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { entitlementForUser } from "@/lib/entitlement.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

function stripeClient() {
  const key = process.env.STRIPE_RESTRICTED_KEY?.trim();
  if (!key) throw new Error("Billing is not configured");
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
}

function appOrigin() {
  const configured = process.env.APP_URL?.trim();
  if (configured) return new URL(configured).origin;
  const request = getRequest();
  if (!request) throw new Error("Unable to determine application URL");
  return new URL(request.url).origin;
}

export const getEntitlement = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => entitlementForUser(context.userId));

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await consumeRateLimit({ action: "stripe-checkout", subject: context.userId, max: 5, windowSeconds: 600 });
    const current = await entitlementForUser(context.userId);
    if (current.isPro) throw new Error("This account already has Pro access");
    const priceId = process.env.STRIPE_PRICE_ID?.trim();
    if (!priceId) throw new Error("Subscription price is not configured");
    const checkoutWindow = Math.floor(Date.now() / 600_000);
    const idempotencyKey = `svph-checkout-${createHash("sha256")
      .update(`${context.userId}:${checkoutWindow}`)
      .digest("hex")}`;
    const session = await stripeClient().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: context.userId,
      metadata: { user_id: context.userId },
      subscription_data: { metadata: { user_id: context.userId } },
      success_url: `${appOrigin()}/subscription?checkout=success`,
      cancel_url: `${appOrigin()}/subscription?checkout=cancelled`,
    }, { idempotencyKey });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });

export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await consumeRateLimit({ action: "stripe-portal", subject: context.userId, max: 10, windowSeconds: 600 });
    const sql = await getSql();
    const rows = await sql<{ customer_id: string | null }>`select customer_id from stripe_entitlements where user_id = ${context.userId} limit 1`;
    const customer = rows[0]?.customer_id;
    if (!customer) throw new Error("No billing account was found");
    const portal = await stripeClient().billingPortal.sessions.create({ customer, return_url: `${appOrigin()}/subscription` });
    return { url: portal.url };
  });
