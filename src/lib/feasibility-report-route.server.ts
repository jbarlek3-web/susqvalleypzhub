import { assertSameSiteRequest, CrossSiteRequestError } from "@/lib/auth/isolation.server";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";
import { requirePro } from "@/lib/entitlement.server";
import { verifyFeasibilityReportToken } from "@/lib/feasibility-report.server";
import { RateLimitError, consumeRateLimit } from "@/lib/rate-limit.server";

export async function authenticatedFeasibilityReport(token: string, request?: Request) {
  assertSameSiteRequest();
  if (request) assertSameSiteRequest(request);
  const userId = await requireUserId();
  await requirePro();
  await consumeRateLimit({
    action: "feasibility-report-download",
    subject: userId,
    max: 30,
    windowSeconds: 3_600,
  });
  return verifyFeasibilityReportToken(token, userId);
}

export function feasibilityReportError(error: unknown) {
  if (error instanceof UnauthorizedError)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (error instanceof CrossSiteRequestError)
    return Response.json({ error: "Forbidden" }, { status: 403 });
  if (error instanceof RateLimitError) {
    return Response.json(
      { error: error.message },
      {
        status: 429,
        headers: { "retry-after": String(error.retryAfterSeconds), "cache-control": "no-store" },
      },
    );
  }
  if (error instanceof Error && "status" in error && error.status === 402) {
    return Response.json({ error: "A Pro subscription is required" }, { status: 402 });
  }
  return Response.json(
    { error: "The report could not be downloaded." },
    { status: 400, headers: { "cache-control": "no-store" } },
  );
}
