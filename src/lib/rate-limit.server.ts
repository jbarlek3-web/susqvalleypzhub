import { createHash } from "node:crypto";
import { getSql } from "@/lib/db";

export class RateLimitError extends Error {
  readonly status = 429;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests. Please try again later.");
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type Limit = {
  action: string;
  subject: string;
  max: number;
  windowSeconds: number;
};

function bucketKey(action: string, subject: string) {
  const salt = process.env.RATE_LIMIT_SALT?.trim();
  if (!salt && process.env.VERCEL_ENV === "production") {
    throw new Error("RATE_LIMIT_SALT is required in production");
  }
  return `${action}:${createHash("sha256").update(`${salt ?? "local"}:${subject}`).digest("hex")}`;
}

export async function consumeRateLimit(limit: Limit) {
  if (!Number.isSafeInteger(limit.max) || limit.max < 1) throw new Error("Invalid rate limit max");
  if (!Number.isSafeInteger(limit.windowSeconds) || limit.windowSeconds < 1) throw new Error("Invalid rate limit window");

  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowId = Math.floor(nowSeconds / limit.windowSeconds);
  const key = bucketKey(limit.action, limit.subject);
  const sql = await getSql();
  const rows = await sql<{ request_count: number }>`
    insert into rate_limits (bucket_key, window_id, request_count)
    values (${key}, ${windowId}, 1)
    on conflict (bucket_key, window_id)
    do update set request_count = rate_limits.request_count + 1, updated_at = now()
    returning request_count
  `;
  await sql`delete from rate_limits where bucket_key = ${key} and window_id < ${windowId - 2}`;
  const count = rows[0]?.request_count ?? limit.max + 1;
  if (count > limit.max) {
    const retryAfter = (windowId + 1) * limit.windowSeconds - nowSeconds;
    throw new RateLimitError(Math.max(1, retryAfter));
  }
  return { remaining: Math.max(0, limit.max - count) };
}

export async function pruneRateLimits() {
  const sql = await getSql();
  await sql`delete from rate_limits where updated_at < now() - interval '2 days'`;
}
