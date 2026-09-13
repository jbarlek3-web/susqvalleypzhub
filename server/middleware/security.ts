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
    // Clerk Billing embeds Stripe Elements for trial and paid checkout. Keep its
    // required endpoints explicit so the rest of the application remains on a
    // restrictive CSP. The App Builder branding script is scoped to its exact path.
    `script-src 'self' 'unsafe-inline'${clerkSource} https://js.stripe.com https://*.js.stripe.com https://grok.com/grok-app-builder/extensions.js https://challenges.cloudflare.com https://*.protect.clerk.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self'${clerkSource} https://api.stripe.com https://*.protect.clerk.com:* https://arcweb1.ycpc.org https://services2.arcgis.com https://mapservices.pasda.psu.edu https://hydro.nationalmap.gov https://basemap.nationalmap.gov https://server.arcgisonline.com https://*.tile.openstreetmap.org`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://*.protect.clerk.com",
    "form-action 'self'",
    "frame-ancestors 'self'",
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
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-dns-prefetch-control", "off");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("x-permitted-cross-domain-policies", "none");
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
  const proto = (
    event.req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    event.url.protocol.replace(":", "")
  ).toLowerCase();
  return secure(result, proto === "https");
}
