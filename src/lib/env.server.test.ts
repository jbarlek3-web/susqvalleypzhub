import assert from "node:assert/strict";
import test from "node:test";
import { assertProductionConfig, missingProductionEnv } from "./env.server.ts";

const required = {
  APP_URL: "https://planning.example.com",
  BETTER_AUTH_SECRET: "a-secure-random-auth-secret",
  BETTER_AUTH_URL: "https://planning.example.com",
  DATABASE_URL: "postgresql://example.invalid/database",
  GROK_AUTH_CLIENT_ID: "client-id",
  GROK_AUTH_CLIENT_SECRET: "client-secret",
  GROK_AUTH_ISSUER: "https://issuer.example.com",
  RATE_LIMIT_SALT: "a-long-independent-rate-limit-salt",
  STRIPE_PRICE_ID: "price_test",
  STRIPE_RESTRICTED_KEY: "rk_" + "test_placeholder",
  STRIPE_WEBHOOK_SECRET: "whsec_" + "placeholder",
  VERCEL_ENV: "production",
};

function withEnv(values: Record<string, string | undefined>, run: () => void) {
  const original = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    run();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("production configuration accepts HTTPS same-origin auth and restricted Stripe keys", () => {
  withEnv(required, () => {
    assert.deepEqual(missingProductionEnv(), []);
    assert.doesNotThrow(assertProductionConfig);
  });
});

test("production configuration rejects broad Stripe secret keys", () => {
  withEnv({ ...required, STRIPE_RESTRICTED_KEY: "sk_" + "test_placeholder" }, () => {
    assert.throws(assertProductionConfig, /restricted key/);
  });
});

test("production configuration reports missing secrets without their values", () => {
  withEnv({ ...required, STRIPE_WEBHOOK_SECRET: undefined }, () => {
    assert.deepEqual(missingProductionEnv(), ["STRIPE_WEBHOOK_SECRET"]);
  });
});
