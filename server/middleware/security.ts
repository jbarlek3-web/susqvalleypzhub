import { assertProductionConfig } from "../../src/lib/env.server";

interface SecurityEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

function clerkFrontendOrigin() {
  const key = process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  const encoded = key?.replace(/^pk_(?:test|live)_/, "");
  if (!encoded) return null;
  try {
    const host = Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
    const url = new URL(`https://${host}`);
    return url.protocol === "https:" && url.hostname === host ? url.origin : null;
  } catch {
    return null;
  }
}

function contentSecurityPolicy() {
  const clerkOrigin = clerkFrontendOrigin();
  const clerkSource = clerkOrigin ? ` ${clerkOrigin}` : "";
  return [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${clerkSource} https://challenges.cloudflare.com https://*.protect.clerk.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self'${clerkSource} https://*.protect.clerk.com:*`,
  "worker-src 'self' blob:",
  "frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com",
  "form-action 'self'",
  ].join("; ");
}

function secure(response: Response, isHttps: boolean) {
  const headers = new Headers(response.headers);
  // Every response reaching this middleware is dynamically generated and may
  // contain account state. Static assets bypass the server through Vercel's
  // filesystem route and keep their immutable cache policy.
  headers.set("cache-control", "no-store");
  headers.set("content-security-policy", contentSecurityPolicy());
  headers.set("cross-origin-opener-policy", "same-origin-allow-popups");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "SAMEORIGIN");
  if (isHttps) headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
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
