import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

const Input = z.object({
  sessionId: z.string().regex(/^cs_[a-zA-Z0-9_]+$/).max(255),
});

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { lookupPaidSession } = await import("@/lib/stripe-webhook.server");
    const paid = await lookupPaidSession(data.sessionId, context.userId);
    return { paid };
  });
