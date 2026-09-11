import { createMiddleware } from "@tanstack/react-start";

/**
 * Auth middleware for server functions — the standard way to get the caller's
 * verified user id. When deployed the session cookie is same-origin and rides
 * along automatically. In the live preview the client also forwards the bearer
 * token (partitioned cookies) via the `.client` hook below — call sites do not
 * thread it themselves.
 *
 *   import { createServerFn } from "@tanstack/react-start";
 *   import { getSql } from "@/lib/db";
 *   import { authMiddleware } from "@/lib/auth/middleware";
 *
 *   export const listTodos = createServerFn({ method: "GET" })
 *     .middleware([authMiddleware])
 *     .handler(async ({ context }) => {
 *       const sql = await getSql();
 *       return sql`select * from todos where user_id = ${context.userId}`;
 *     });
 *
 * A signed-out request throws `UnauthorizedError` (see `verify.server.ts`).
 * Use this on every server function that touches
 * per-user data and scope every query by `context.userId`.
 */
export const authMiddleware = createMiddleware({ type: "function" })
  .server(async ({ next }) => {
    // ONLY import `*.server` modules here. This file is dual client/server
    // (bearer hook on the client). A plain `./isolation` path was renamed to
    // `isolation.server.ts` — keep this import in sync so image `tsc` resolves
    // it, and so Vite does not ship `@tanstack/react-start/server` to the browser.
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireUserId } = await import("./verify.server");
    // Reject scripted cross-site/sibling requests before touching per-user data.
    assertSameSiteRequest();
    const userId = await requireUserId();
    return next({ context: { userId } });
  });
