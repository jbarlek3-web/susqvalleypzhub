import { getSql } from "@/lib/db";

export type EntitlementStatus = {
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
};

export async function entitlementForUser(userId: string): Promise<EntitlementStatus> {
  const sql = await getSql();
  const rows = await sql<{ status: string; current_period_end: string | null }>`
    select status, current_period_end from stripe_entitlements
    where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  return {
    isPro: row?.status === "active" || row?.status === "trialing",
    status: row?.status ?? "free",
    currentPeriodEnd: row?.current_period_end ?? null,
  };
}

export async function requirePro(userId: string) {
  const entitlement = await entitlementForUser(userId);
  if (!entitlement.isPro) {
    const error = new Error("A Pro subscription is required");
    error.name = "PaymentRequiredError";
    Object.assign(error, { status: 402 });
    throw error;
  }
  return entitlement;
}
