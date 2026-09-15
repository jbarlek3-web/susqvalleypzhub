import { getAiUsagePeriod, parseAiMonthlyAllowance } from "@/lib/ai-credit-policy";
import { getSql } from "@/lib/db";

export type AiDebitSource = "included" | "purchased" | "org-included" | "org-purchased" | "user-included" | "user-purchased";

export type AiUsage = {
  includedLimit: number;
  includedUsed: number;
  purchasedRemaining: number;
  remaining: number;
  exhausted: boolean;
  resetsAt: string;
  debitedSource?: AiDebitSource;
};

export type AccountId = {
  userId: string;
  organizationId?: string;
};

type UsageRow = { included_used: number; purchased_balance: number };

function monthlyLimit() {
  return parseAiMonthlyAllowance(process.env.AI_MONTHLY_QUESTION_LIMIT);
}

function usageView(row: UsageRow, resetsAt: string, debitedSource?: AiDebitSource): AiUsage {
  const includedLimit = monthlyLimit();
  const includedUsed = Math.min(includedLimit, Math.max(0, row.included_used));
  const purchasedRemaining = Math.max(0, row.purchased_balance);
  const remaining = includedLimit - includedUsed + purchasedRemaining;
  return {
    includedLimit,
    includedUsed,
    purchasedRemaining,
    remaining,
    exhausted: remaining === 0,
    resetsAt,
    ...(debitedSource ? { debitedSource } : {}),
  };
}

async function getUsageForId(id: string, isOrg: boolean, periodStart: string, resetsAt: string): Promise<AiUsage> {
  const sql = await getSql();
  const rows = isOrg ? await sql<UsageRow>`
    select
      coalesce((select included_used from ai_usage_periods where organization_id = ${id} and period_start = ${periodStart}::date), 0)::integer as included_used,
      coalesce((select purchased_balance from ai_credit_accounts where organization_id = ${id}), 0)::integer as purchased_balance
  ` : await sql<UsageRow>`
    select
      coalesce((select included_used from ai_usage_periods where user_id = ${id} and period_start = ${periodStart}::date), 0)::integer as included_used,
      coalesce((select purchased_balance from ai_credit_accounts where user_id = ${id}), 0)::integer as purchased_balance
  `;
  return usageView(rows[0] ?? { included_used: 0, purchased_balance: 0 }, resetsAt);
}

export async function getAiUsage(account: AccountId): Promise<AiUsage> {
  const { periodStart, resetsAt } = getAiUsagePeriod();

  if (account.organizationId) {
    const orgUsage = await getUsageForId(account.organizationId, true, periodStart, resetsAt);
    if (!orgUsage.exhausted) {
      return orgUsage;
    }
    const userUsage = await getUsageForId(account.userId, false, periodStart, resetsAt);
    return userUsage;
  }
  return getUsageForId(account.userId, false, periodStart, resetsAt);
}

async function consumeSingle(id: string, isOrg: boolean, periodStart: string, resetsAt: string): Promise<AiUsage | null> {
  const includedLimit = monthlyLimit();
  const sql = await getSql();

  const included = isOrg ? await sql<{ included_used: number }>`
    insert into ai_usage_periods (organization_id, period_start, included_used)
    values (${id}, ${periodStart}::date, 1)
    on conflict (organization_id, period_start)
    do update set included_used = ai_usage_periods.included_used + 1, updated_at = now()
    where ai_usage_periods.included_used < ${includedLimit}
    returning included_used
  ` : await sql<{ included_used: number }>`
    insert into ai_usage_periods (user_id, period_start, included_used)
    values (${id}, ${periodStart}::date, 1)
    on conflict (user_id, period_start)
    do update set included_used = ai_usage_periods.included_used + 1, updated_at = now()
    where ai_usage_periods.included_used < ${includedLimit}
    returning included_used
  `;
  if (included[0]) {
    const credits = isOrg ? await sql<{ purchased_balance: number }>`
      select purchased_balance from ai_credit_accounts where organization_id = ${id}
    ` : await sql<{ purchased_balance: number }>`
      select purchased_balance from ai_credit_accounts where user_id = ${id}
    `;
    return usageView(
      {
        included_used: included[0].included_used,
        purchased_balance: credits[0]?.purchased_balance ?? 0,
      },
      resetsAt,
      isOrg ? "org-included" : "user-included",
    );
  }

  const purchased = isOrg ? await sql<UsageRow>`
    with debit as (
      update ai_credit_accounts
      set purchased_balance = purchased_balance - 1, updated_at = now()
      where organization_id = ${id} and purchased_balance > 0
      returning purchased_balance
    ), usage as (
      insert into ai_usage_periods (organization_id, period_start, purchased_used)
      select ${id}, ${periodStart}::date, 1 from debit
      on conflict (organization_id, period_start)
      do update set purchased_used = ai_usage_periods.purchased_used + 1, updated_at = now()
      returning included_used
    )
    select usage.included_used, debit.purchased_balance from usage cross join debit
  ` : await sql<UsageRow>`
    with debit as (
      update ai_credit_accounts
      set purchased_balance = purchased_balance - 1, updated_at = now()
      where user_id = ${id} and purchased_balance > 0
      returning purchased_balance
    ), usage as (
      insert into ai_usage_periods (user_id, period_start, purchased_used)
      select ${id}, ${periodStart}::date, 1 from debit
      on conflict (user_id, period_start)
      do update set purchased_used = ai_usage_periods.purchased_used + 1, updated_at = now()
      returning included_used
    )
    select usage.included_used, debit.purchased_balance from usage cross join debit
  `;
  return purchased[0] ? usageView(purchased[0], resetsAt, isOrg ? "org-purchased" : "user-purchased") : null;
}

export async function consumeAiQuestion(account: AccountId): Promise<AiUsage | null> {
  const { periodStart, resetsAt } = getAiUsagePeriod();

  if (account.organizationId) {
    const orgResult = await consumeSingle(account.organizationId, true, periodStart, resetsAt);
    if (orgResult) return orgResult;
  }
  
  return consumeSingle(account.userId, false, periodStart, resetsAt);
}

export async function refundAiQuestion(
  account: AccountId,
  debitedSource?: AiDebitSource,
): Promise<void> {
  const { periodStart } = getAiUsagePeriod();
  const sql = await getSql();

  let id = account.userId;
  let isOrg = false;

  if (debitedSource === "org-included" || debitedSource === "org-purchased") {
    id = account.organizationId || account.userId;
    isOrg = !!account.organizationId;
  } else if (debitedSource === "user-included" || debitedSource === "user-purchased") {
    id = account.userId;
    isOrg = false;
  } else {
    id = account.organizationId || account.userId;
    isOrg = !!account.organizationId;
  }

  const isPurchased = debitedSource === "purchased" || debitedSource === "org-purchased" || debitedSource === "user-purchased";
  const isIncluded = debitedSource === "included" || debitedSource === "org-included" || debitedSource === "user-included";

  if (isPurchased) {
    if (isOrg) {
      await sql`
        update ai_credit_accounts
        set purchased_balance = purchased_balance + 1, updated_at = now()
        where organization_id = ${id}
      `;
      await sql`
        update ai_usage_periods
        set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
        where organization_id = ${id} and period_start = ${periodStart}::date and purchased_used > 0
      `;
    } else {
      await sql`
        update ai_credit_accounts
        set purchased_balance = purchased_balance + 1, updated_at = now()
        where user_id = ${id}
      `;
      await sql`
        update ai_usage_periods
        set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
        where user_id = ${id} and period_start = ${periodStart}::date and purchased_used > 0
      `;
    }
    return;
  }

  if (isIncluded) {
    if (isOrg) {
      await sql`
        update ai_usage_periods
        set included_used = greatest(0, included_used - 1), updated_at = now()
        where organization_id = ${id} and period_start = ${periodStart}::date and included_used > 0
      `;
    } else {
      await sql`
        update ai_usage_periods
        set included_used = greatest(0, included_used - 1), updated_at = now()
        where user_id = ${id} and period_start = ${periodStart}::date and included_used > 0
      `;
    }
    return;
  }

  // Fallback when debitedSource is not supplied: determine whether purchased was consumed
  const rows = isOrg ? await sql<{ included_used: number; purchased_used: number }>`
    select included_used, purchased_used from ai_usage_periods
    where organization_id = ${id} and period_start = ${periodStart}::date
  ` : await sql<{ included_used: number; purchased_used: number }>`
    select included_used, purchased_used from ai_usage_periods
    where user_id = ${id} and period_start = ${periodStart}::date
  `;
  const row = rows[0];
  const includedLimit = monthlyLimit();
  if (row && row.purchased_used > 0 && row.included_used >= includedLimit) {
    if (isOrg) {
      await sql`
        update ai_credit_accounts
        set purchased_balance = purchased_balance + 1, updated_at = now()
        where organization_id = ${id}
      `;
      await sql`
        update ai_usage_periods
        set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
        where organization_id = ${id} and period_start = ${periodStart}::date and purchased_used > 0
      `;
    } else {
      await sql`
        update ai_credit_accounts
        set purchased_balance = purchased_balance + 1, updated_at = now()
        where user_id = ${id}
      `;
      await sql`
        update ai_usage_periods
        set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
        where user_id = ${id} and period_start = ${periodStart}::date and purchased_used > 0
      `;
    }
  } else {
    if (isOrg) {
      await sql`
        update ai_usage_periods
        set included_used = greatest(0, included_used - 1), updated_at = now()
        where organization_id = ${id} and period_start = ${periodStart}::date and included_used > 0
      `;
    } else {
      await sql`
        update ai_usage_periods
        set included_used = greatest(0, included_used - 1), updated_at = now()
        where user_id = ${id} and period_start = ${periodStart}::date and included_used > 0
      `;
    }
  }
}
