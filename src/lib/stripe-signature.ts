import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  nowSeconds = Date.now() / 1000,
  toleranceSeconds = 300,
) {
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) throw new Error("Missing Stripe signature");

  const age = Math.abs(nowSeconds - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) throw new Error("Stripe timestamp expired");

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const valid = signatures.some((signature) => {
    const received = Buffer.from(signature, "utf8");
    return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
  });
  if (!valid) throw new Error("Stripe signature mismatch");
}
