import { assertProductionConfig } from "../../src/lib/env.server";
import {
  applySecurityHeaders,
  clerkFrontendOrigin,
  generateNonce,
  injectHtmlNonce,
} from "../../src/lib/csp";

interface SecurityEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

async function secure(response: Response, isHttps: boolean) {
  const nonce = generateNonce();
  const clerkOrigin = clerkFrontendOrigin(process.env.VITE_CLERK_PUBLISHABLE_KEY);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    applySecurityHeaders(headers, nonce, clerkOrigin, isHttps);
    return new Response(injectHtmlNonce(html, nonce), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers, nonce, clerkOrigin, isHttps);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default async function securityMiddleware(
  event: SecurityEvent,
  next: () => unknown | Promise<unknown>,
) {
  try {
    assertProductionConfig();
  } catch (error) {
    console.error("[config] production configuration rejected", error);
    return secure(Response.json({ error: "Service configuration is incomplete" }, { status: 503 }), true);
  }

  const result = await next();
  if (!(result instanceof Response)) return result;
  const proto = event.req.headers.get("x-forwarded-proto") ?? event.url.protocol.replace(":", "");
  return secure(result, proto === "https");
}
