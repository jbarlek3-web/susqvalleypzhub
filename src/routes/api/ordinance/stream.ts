import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId } from "@/lib/auth/verify.server";
import { requirePro } from "@/lib/entitlement.server";
import { StreamInputSchema, streamOrdinanceAide } from "@/lib/ordinance-agent";

export const Route = createFileRoute("/api/ordinance/stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest(request);
          const userId = await requireUserId();
          await requirePro();

          const rawBody = (await request.json()) as unknown;
          const parsed = StreamInputSchema.safeParse(rawBody);
          if (!parsed.success) {
            return Response.json(
              { ok: false, error: "Invalid request payload", details: parsed.error.format() },
              { status: 400, headers: { "Cache-Control": "no-store" } },
            );
          }

          return await streamOrdinanceAide(parsed.data, userId);
        } catch (error: unknown) {
          const err = error as { status?: number; name?: string; message?: string; retryAfterSeconds?: number };
          if (err?.status === 401 || err?.name === "UnauthorizedError") {
            return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
          }
          if (err?.status === 402 || err?.name === "ProRequiredError") {
            return Response.json({ ok: false, error: "A Pro subscription is required" }, { status: 402 });
          }
          if (err?.status === 403 || err?.name === "CrossSiteRequestError") {
            return Response.json({ ok: false, error: "Forbidden: cross-site request blocked" }, { status: 403 });
          }
          if (err?.status === 429 || err?.name === "RateLimitError") {
            return Response.json(
              { ok: false, error: err.message ?? "Too many requests" },
              {
                status: 429,
                headers: {
                  "Retry-After": String(err.retryAfterSeconds ?? 60),
                  "Cache-Control": "no-store",
                },
              },
            );
          }
          return Response.json(
            { ok: false, error: err?.message || "Internal server error" },
            { status: 500, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
