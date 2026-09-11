import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { PRO_PLAN_KEY } from "@/lib/billing-config";
import {
  assertProEntitlement,
  resolveEntitlement,
  type EntitlementStatus,
} from "@/lib/entitlement-policy";

export type { EntitlementStatus } from "@/lib/entitlement-policy";

export async function currentEntitlement(): Promise<EntitlementStatus> {
  const session = await auth();
  return resolveEntitlement(
    session,
    PRO_PLAN_KEY,
    process.env.ADMIN_CLERK_EMAIL,
    (userId) => clerkClient().users.getUser(userId),
  );
}

export async function requirePro() {
  return assertProEntitlement(await currentEntitlement());
}
