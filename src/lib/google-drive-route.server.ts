import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";
import { requirePro } from "@/lib/entitlement.server";
import { RateLimitError } from "@/lib/rate-limit.server";

export async function authenticatedDriveUser() {
  assertSameSiteRequest();
  const userId = await requireUserId();
  await requirePro();
  return userId;
}

export function googleDriveErrorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    return Response.json(
      { error: "A Pro subscription is required" },
      { status: 402, headers: { "cache-control": "no-store" } },
    );
  }
  const message = error instanceof Error ? error.message : "Google Drive request failed";
  return Response.json(
    { error: message },
    { status: 400, headers: { "cache-control": "no-store" } },
  );
}

export function redirectToDashboard(request: Request, result: "connected" | "denied" | "error") {
  const url = new URL("/dashboard", new URL(request.url).origin);
  url.searchParams.set("drive", result);
  return Response.redirect(url, 303);
}
