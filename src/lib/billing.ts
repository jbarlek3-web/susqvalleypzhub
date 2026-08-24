import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import Stripe from "stripe";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

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
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ status: string; current_period_end: string | null }>`
      select status, current_period_end from stripe_entitlements
      where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    return { isPro: row?.status === "active" || row?.status === "trialing", status: row?.status ?? "free", currentPeriodEnd: row?.current_period_end ?? null };
  });

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const priceId = process.env.STRIPE_PRICE_ID?.trim();
    if (!priceId) throw new Error("Subscription price is not configured");
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const session = await stripeClient().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: context.userId,
      metadata: { user_id: context.userId },
      subscription_data: { metadata: { user_id: context.userId } },
      success_url: `${appOrigin()}/subscription?checkout=success`,
      cancel_url: `${appOrigin()}/subscription?checkout=cancelled`,
      integration_identifier: `svph_web_${suffix}`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  });

export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ customer_id: string | null }>`select customer_id from stripe_entitlements where user_id = ${context.userId} limit 1`;
    const customer = rows[0]?.customer_id;
    if (!customer) throw new Error("No billing account was found");
    const portal = await stripeClient().billingPortal.sessions.create({ customer, return_url: `${appOrigin()}/subscription` });
    return { url: portal.url };
  });
