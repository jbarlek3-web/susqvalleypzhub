#!/usr/bin/env node
import { assertProductionConfig } from "../src/lib/env.server.ts";

try {
  assertProductionConfig();
  if (process.env.VERCEL_ENV === "production") {
    console.log("[config] production environment is complete and structurally valid");
  } else {
    console.log("[config] production validation skipped outside a production deployment");
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Invalid production configuration";
  console.error(`[config] production build blocked: ${message}`);
  console.error("[config] add the named variables in Vercel Settings → Environment Variables, then redeploy");
  process.exit(1);
}
