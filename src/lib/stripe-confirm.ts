import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  sessionId: z.string().regex(/^cs_[a-zA-Z0-9_]+$/).max(255),
});

export const confirmCheckout = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const { lookupPaidSession } = await import("@/lib/stripe-webhook.server");
    const paid = await lookupPaidSession(data.sessionId);
    return { paid };
  });
