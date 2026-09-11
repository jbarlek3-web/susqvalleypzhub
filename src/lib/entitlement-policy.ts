import {
  configuredAdminEmail,
  isConfiguredAdminClerkUser,
  type ClerkAdminCandidate,
} from "./admin-access.ts";

export type EntitlementStatus = {
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
};

type EntitlementSession = {
  userId: string | null;
  has: (permission: { plan: string }) => boolean;
};

export class AdminIdentityUnavailableError extends Error {
  readonly status = 503;

  constructor() {
    super("Administrator identity verification is temporarily unavailable");
    this.name = "AdminIdentityUnavailableError";
  }
}

const LOCKED: EntitlementStatus = {
  isPro: false,
  status: "locked",
  currentPeriodEnd: null,
};

export async function resolveEntitlement(
  session: EntitlementSession,
  planKey: string,
  rawAdminEmail: string | undefined,
  getUser: (userId: string) => Promise<ClerkAdminCandidate>,
): Promise<EntitlementStatus> {
  if (!session.userId) return LOCKED;

  try {
    if (typeof session.has === "function" && session.has({ plan: planKey })) {
      return { isPro: true, status: "active", currentPeriodEnd: null };
    }
  } catch {
    // If permission checking throws on malformed claims, fall through to admin check
  }

  if (!configuredAdminEmail(rawAdminEmail)) return LOCKED;

  let user: ClerkAdminCandidate;
  try {
    user = await getUser(session.userId);
  } catch {
    throw new AdminIdentityUnavailableError();
  }

  if (!isConfiguredAdminClerkUser(user, session.userId, rawAdminEmail)) return LOCKED;
  return { isPro: true, status: "admin", currentPeriodEnd: null };
}

export function assertProEntitlement(entitlement: EntitlementStatus) {
  if (!entitlement.isPro) {
    const error = new Error("A Pro subscription is required");
    error.name = "PaymentRequiredError";
    Object.assign(error, { status: 402 });
    throw error;
  }
  return entitlement;
}
