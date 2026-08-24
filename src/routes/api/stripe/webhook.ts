import { createFileRoute } from "@tanstack/react-router";
import { handleStripeWebhook, isStripeWebhookConfigured } from "@/lib/stripe-webhook.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          ok: true,
          endpoint: "stripe-webhook",
          configured: isStripeWebhookConfigured(),
        }),
      POST: async ({ request }) => handleStripeWebhook(request),
    },
  },
});
