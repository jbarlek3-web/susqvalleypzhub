/**
 * Per-request CSP nonce helpers. Nonces are issued at the edge, never as a static meta tag.
 */
export function generateNonce(): string {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    throw new Error("generateNonce requires Web Crypto");
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function assertNonce(nonce: string): string {
  if (typeof nonce !== "string" || nonce.length < 16 || nonce.length > 64) {
    throw new Error("CSP nonce is invalid");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(nonce)) {
    throw new Error("CSP nonce is invalid");
  }
  return nonce;
}

export function clerkFrontendOrigin(publishableKey: string | undefined): string | null {
  const key = publishableKey?.trim();
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

export function buildContentSecurityPolicy(nonce: string, clerkOrigin: string | null): string {
  const n = assertNonce(nonce);
  const clerkSource = clerkOrigin ? ` ${clerkOrigin}` : "";
  const scriptSources = `'self' 'nonce-${n}'${clerkSource} https://js.stripe.com https://*.js.stripe.com https://grok.com/grok-app-builder/extensions.js https://challenges.cloudflare.com https://*.protect.clerk.com`;
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `script-src ${scriptSources}`,
    `script-src-elem ${scriptSources}`,
    `style-src 'self' 'nonce-${n}' https://fonts.googleapis.com`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self'${clerkSource} https://api.stripe.com https://*.protect.clerk.com:* https://arcweb1.ycpc.org https://services2.arcgis.com https://mapservices.pasda.psu.edu https://hydro.nationalmap.gov https://basemap.nationalmap.gov https://server.arcgisonline.com https://*.tile.openstreetmap.org`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://*.protect.clerk.com",
    "form-action 'self'",
  ].join("; ");
}

export function injectHtmlNonce(html: string, nonce: string): string {
  if (typeof html !== "string") {
    throw new Error("injectHtmlNonce requires html");
  }
  const n = assertNonce(nonce);
  return html
    .replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${n}"`)
    .replace(/<style(?![^>]*\bnonce=)/gi, `<style nonce="${n}"`);
}

export function applySecurityHeaders(
  headers: Headers,
  nonce: string,
  clerkOrigin: string | null,
  isHttps: boolean,
): void {
  if (!(headers instanceof Headers)) {
    throw new Error("applySecurityHeaders requires Headers");
  }
  headers.set("cache-control", "no-store");
  headers.set("content-security-policy", buildContentSecurityPolicy(nonce, clerkOrigin));
  headers.set("cross-origin-opener-policy", "same-origin-allow-popups");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "SAMEORIGIN");
  if (isHttps) headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
}

export function cspOmitsUnsafeInlineScripts(policy: string): boolean {
  if (typeof policy !== "string" || !policy) return false;
  const scriptSrc = policy.split(";").map((part) => part.trim()).find((part) => part.startsWith("script-src "));
  const scriptSrcElem = policy.split(";").map((part) => part.trim()).find((part) => part.startsWith("script-src-elem "));
  if (!scriptSrc || !scriptSrcElem) return false;
  return !scriptSrc.includes("'unsafe-inline'") && !scriptSrcElem.includes("'unsafe-inline'");
}
