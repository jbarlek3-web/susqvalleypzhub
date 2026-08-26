import { auth } from "@clerk/tanstack-react-start/server";
import { PRO_PLAN_KEY } from "@/lib/billing-config";

export type EntitlementStatus = {
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
};

export async function currentEntitlement(): Promise<EntitlementStatus> {
  const session = await auth();
  const isPro = Boolean(session.userId && session.has({ plan: PRO_PLAN_KEY }));
  return {
    isPro,
    status: isPro ? "active" : "locked",
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
