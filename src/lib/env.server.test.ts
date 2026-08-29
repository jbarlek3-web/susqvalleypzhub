import assert from "node:assert/strict";
import test from "node:test";
import { assertProductionConfig, missingProductionEnv } from "./env.server.ts";

const required = {
  APP_URL: "https://planning.example.com",
  CLERK_SECRET_KEY: ["sk", "live", "placeholder"].join("_"),
  CLERK_WEBHOOK_SIGNING_SECRET: ["whsec", "placeholder"].join("_"),
  DATABASE_URL: "postgresql://example.invalid/database",
  RATE_LIMIT_SALT: "a-long-independent-rate-limit-salt",
  VERCEL_ENV: "production",
  VITE_CLERK_PUBLISHABLE_KEY: ["pk", "live", "placeholder"].join("_"),
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

test("production configuration accepts live Clerk keys", () => {
  withEnv(required, () => {
    assert.deepEqual(missingProductionEnv(), []);
    assert.doesNotThrow(assertProductionConfig);
  });
});

test("production configuration rejects Clerk test keys", () => {
  withEnv({ ...required, CLERK_SECRET_KEY: ["sk", "test", "placeholder"].join("_") }, () => {
    assert.throws(assertProductionConfig, /live secret key/);
  });
});

test("production configuration rejects a malformed Clerk webhook signing secret", () => {
  withEnv({ ...required, CLERK_WEBHOOK_SIGNING_SECRET: "wrong" }, () => {
    assert.throws(assertProductionConfig, /webhook signing secret/);
  });
});

test("production configuration reports missing secrets without their values", () => {
  withEnv({ ...required, CLERK_SECRET_KEY: undefined }, () => {
    assert.deepEqual(missingProductionEnv(), ["CLERK_SECRET_KEY"]);
  });
});
