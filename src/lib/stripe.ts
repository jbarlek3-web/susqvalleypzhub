export const STRIPE = {
  productId: "prod_V7yyCZVipuW3um",
  paymentLink: "https://buy.stripe.com/bJefZj3EH2zt9Kx2Bq8k80e",
  buyButtonId: "buy_btn_1U7j2TQ4V3kLu8HPC40RIzcr",
  publishableKey:
    "pk_live_51THbEKQ4V3kLu8HPv58FqkR8XIh8X93zFTG8R2zTgSgKHixSKgWgc8K5Yj4SkKLKeyYeZBbyYvnTvGW2kzUlZ3Ja00AT7MvGSK",
  scriptSrc: "https://js.stripe.com/v3/buy-button.js",
  webhookPath: "/api/stripe/webhook",
  webhookEvents: [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
  ],
} as const;

export function stripePaymentHref(email?: string) {
  if (!email) return STRIPE.paymentLink;
  const url = new URL(STRIPE.paymentLink);
  url.searchParams.set("prefilled_email", email);
  return url.toString();
}

export function stripeSessionIdFromSearch(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const session = params.get("session_id")?.trim() ?? "";
  return /^cs_[a-zA-Z0-9_]+$/.test(session) ? session : null;
}
