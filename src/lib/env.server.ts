import { configuredAdminEmail } from "./admin-access.ts";

const REQUIRED_PRODUCTION_ENV = [
  "APP_URL",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET",
  "DATABASE_URL",
  "RATE_LIMIT_SALT",
  "VITE_CLERK_PUBLISHABLE_KEY",
] as const;

export function missingProductionEnv() {
  return REQUIRED_PRODUCTION_ENV.filter((key) => !process.env[key]?.trim());
}

export function productionConfigIsValid() {
  return process.env.VERCEL_ENV !== "production" || missingProductionEnv().length === 0;
}

export function assertProductionConfig() {
  if (process.env.VERCEL_ENV !== "production") return;
  const missing = missingProductionEnv();
  if (missing.length)
    throw new Error(`Missing required production configuration: ${missing.join(", ")}`);

  const appUrl = new URL(process.env.APP_URL!);
  if (appUrl.protocol !== "https:") throw new Error("APP_URL must use HTTPS in production");
  if (!process.env.VITE_CLERK_PUBLISHABLE_KEY!.startsWith("pk_live_")) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY must be a Clerk live publishable key");
  }
  if (!process.env.CLERK_SECRET_KEY!.startsWith("sk_live_")) {
    throw new Error("CLERK_SECRET_KEY must be a Clerk live secret key");
  }
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET!.startsWith("whsec_")) {
    throw new Error("CLERK_WEBHOOK_SIGNING_SECRET must be a Clerk webhook signing secret");
  }
  if (
    process.env.ADMIN_CLERK_EMAIL?.trim() &&
    !configuredAdminEmail(process.env.ADMIN_CLERK_EMAIL)
  ) {
    throw new Error("ADMIN_CLERK_EMAIL must be one valid email address");
  }
}
