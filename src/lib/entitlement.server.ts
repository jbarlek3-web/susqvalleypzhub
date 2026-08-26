import { auth } from "@clerk/tanstack-react-start/server";

export type EntitlementStatus = {
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
};

export async function currentEntitlement(): Promise<EntitlementStatus> {
  const session = await auth();
  const ownerUserId = process.env.OWNER_CLERK_USER_ID?.trim();
  const isOwner = Boolean(ownerUserId && session.userId === ownerUserId);
  const isPro = Boolean(session.userId && (isOwner || session.has({ plan: "pro" })));
  return {
    isPro,
    status: isPro ? "active" : "free",
    currentPeriodEnd: null,
  };
}

export async function requirePro() {
  const entitlement = await currentEntitlement();
  if (!entitlement.isPro) {
    const error = new Error("A Pro subscription is required");
    error.name = "PaymentRequiredError";
    Object.assign(error, { status: 402 });
    throw error;
  }
  return entitlement;
}
