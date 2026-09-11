import { createFileRoute } from "@tanstack/react-router";
import { handleClerkWebhook } from "@/lib/clerk-webhook.server";

export const Route = createFileRoute("/api/webhooks/clerk")({
  server: {
    handlers: {
      POST: ({ request }) => handleClerkWebhook(request),
    },
  },
});
