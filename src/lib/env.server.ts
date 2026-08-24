const REQUIRED_PRODUCTION_ENV = [
  "APP_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "DATABASE_URL",
  "GROK_AUTH_CLIENT_ID",
  "GROK_AUTH_CLIENT_SECRET",
  "GROK_AUTH_ISSUER",
  "RATE_LIMIT_SALT",
  "STRIPE_PRICE_ID",
  "STRIPE_RESTRICTED_KEY",
  "STRIPE_WEBHOOK_SECRET",
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
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(", ")}`);

  const appUrl = new URL(process.env.APP_URL!);
  const authUrl = new URL(process.env.BETTER_AUTH_URL!);
  if (appUrl.protocol !== "https:" || authUrl.protocol !== "https:") {
    throw new Error("APP_URL and BETTER_AUTH_URL must use HTTPS in production");
  }
  if (appUrl.origin !== authUrl.origin) {
    throw new Error("APP_URL and BETTER_AUTH_URL must use the same origin");
  }
  if (!process.env.STRIPE_RESTRICTED_KEY!.startsWith("rk_")) {
    throw new Error("STRIPE_RESTRICTED_KEY must be a least-privilege restricted key");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET!.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET has an invalid format");
  }
}
