import { auth } from "@clerk/tanstack-react-start/server";

/**
 * Server-side session resolution (server-only).
 *
 * Clerk middleware verifies the signed session token before server functions
 * and SSR loaders access it. Never trust a client-supplied user id — only the
 * `userId` returned by Clerk's server-side `auth()` helper.
 */

/** True when a real database is configured server-side. */
const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
export const authConfigured = Boolean(
  process.env.CLERK_SECRET_KEY?.trim() && process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim(),
);

/** Re-export so callers can branch on it without importing `server.ts`. */
if (databaseConfigured && !authConfigured) {
  console.error(
    "[auth] DATABASE_URL is set but Clerk is not configured " +
      "— requireUserId() will reject every request (fail closed) rather than " +
      "share one dev user on a real database.",
  );
}

/** Dev fallback user id, used only when Clerk and a persistent DB are absent. */
export const DEV_USER_ID = "dev-user";

/**
 * Thrown by `requireUserId` when the caller has no valid session. Carries
 * `status: 401`; the message is a stable contract — match
 * `err.message === "Unauthorized"` client-side to send the visitor to sign-in.
 */
export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export type VerifiedUser = { id: string; email: string | null; orgId: string | null };

/**
 * Resolve the signed-in user from the current request, or `null` when auth isn't
 * configured / nobody is signed in. Safe to call from server functions and SSR
 * loaders.
 *
 */
export async function getSessionUser(): Promise<VerifiedUser | null> {
  if (!authConfigured) return null;
  const session = await auth();
  if (!session.userId) return null;
  return { id: session.userId, email: null, orgId: session.orgId ?? null };
}

/**
 * Resolve the current user id for a server function, or throw when unauthorized.
 * Prefer `authMiddleware` (`./middleware`), which calls this for you.
 */
export async function requireUser(): Promise<{ userId: string; orgId: string | null }> {
  if (!authConfigured) {
    if (databaseConfigured) {
      throw new Error(
        "Clerk is not configured but DATABASE_URL is set — " +
          "refusing to fall back to the shared dev user against a real database.",
      );
    }
    return { userId: DEV_USER_ID, orgId: null };
  }
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return { userId: user.id, orgId: user.orgId };
}

export async function requireUserId(): Promise<string> {
  const { userId } = await requireUser();
  return userId;
}
