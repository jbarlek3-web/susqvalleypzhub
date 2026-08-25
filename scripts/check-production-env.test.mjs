import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const checker = fileURLToPath(new URL("./check-production-env.mjs", import.meta.url));
const validProduction = {
  APP_URL: "https://planning.example.com",
  CLERK_SECRET_KEY: "sk_live_private",
  DATABASE_URL: "postgresql://private-database-value",
  RATE_LIMIT_SALT: "private-rate-limit-salt",
  STRIPE_PRICE_ID: "price_private",
  STRIPE_RESTRICTED_KEY: ["rk", "test", "private"].join("_"),
  STRIPE_WEBHOOK_SECRET: ["whsec", "private"].join("_"),
  VERCEL_ENV: "production",
  VITE_CLERK_PUBLISHABLE_KEY: "pk_live_private",
};

function run(overrides = {}) {
  return spawnSync(process.execPath, ["--experimental-strip-types", checker], {
    encoding: "utf8",
    env: { ...process.env, ...validProduction, ...overrides },
    shell: false,
  });
}

test("non-production builds skip deployment validation", () => {
  const result = run({ VERCEL_ENV: "preview", DATABASE_URL: "" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /skipped outside a production deployment/);
});

test("production builds pass with complete structurally valid configuration", () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /complete and structurally valid/);
});

test("production builds fail early with missing names but no secret values", () => {
  const result = run({ DATABASE_URL: "", STRIPE_WEBHOOK_SECRET: "" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /DATABASE_URL/);
  assert.match(result.stderr, /STRIPE_WEBHOOK_SECRET/);
  for (const value of Object.values(validProduction)) {
    if (value && value !== "production") assert.doesNotMatch(result.stderr, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
