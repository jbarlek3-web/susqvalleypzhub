import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { requirePro } from "@/lib/entitlement.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

/** Revalidate the paid entitlement immediately before a guided client action. */
export const authorizeProAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await consumeRateLimit({
      action: "pro-action",
      subject: context.userId,
      max: 60,
      windowSeconds: 60,
    });
    await requirePro(context.userId);
    return { authorized: true as const };
  });
