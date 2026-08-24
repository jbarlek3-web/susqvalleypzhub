import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { productionConfigIsValid } from "@/lib/env.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let database = false;
        try {
          const sql = await getSql();
          await sql`select 1 as ok`;
          database = true;
        } catch {
          database = false;
        }
        const configuration = productionConfigIsValid();
        const ok = database && configuration;
        return Response.json(
          { ok, checks: { database, configuration } },
          { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
