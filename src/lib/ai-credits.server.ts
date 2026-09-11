import { getAiUsagePeriod, parseAiMonthlyAllowance } from "@/lib/ai-credit-policy";
import { getSql } from "@/lib/db";

export type AiDebitSource = "included" | "purchased";

export type AiUsage = {
  includedLimit: number;
  includedUsed: number;
  purchasedRemaining: number;
  remaining: number;
  exhausted: boolean;
  resetsAt: string;
  debitedSource?: AiDebitSource;
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

export async function getAiUsage(userId: string): Promise<AiUsage> {
  const { periodStart, resetsAt } = getAiUsagePeriod();
  const sql = await getSql();
  const rows = await sql<UsageRow>`
    select
      coalesce((select included_used from ai_usage_periods where user_id = ${userId} and period_start = ${periodStart}::date), 0)::integer as included_used,
      coalesce((select purchased_balance from ai_credit_accounts where user_id = ${userId}), 0)::integer as purchased_balance
  `;
  return usageView(rows[0] ?? { included_used: 0, purchased_balance: 0 }, resetsAt);
}

export async function consumeAiQuestion(userId: string): Promise<AiUsage | null> {
  const { periodStart, resetsAt } = getAiUsagePeriod();
  const includedLimit = monthlyLimit();
  const sql = await getSql();

  const included = await sql<{ included_used: number }>`
    insert into ai_usage_periods (user_id, period_start, included_used)
    values (${userId}, ${periodStart}::date, 1)
    on conflict (user_id, period_start)
    do update set included_used = ai_usage_periods.included_used + 1, updated_at = now()
    where ai_usage_periods.included_used < ${includedLimit}
    returning included_used
  `;
  if (included[0]) {
    const credits = await sql<{ purchased_balance: number }>`
      select purchased_balance from ai_credit_accounts where user_id = ${userId}
    `;
    return usageView(
      {
        included_used: included[0].included_used,
        purchased_balance: credits[0]?.purchased_balance ?? 0,
      },
      resetsAt,
      "included",
    );
  }

  // Purchased credits are not sold yet. This atomic debit path is ready for a
  // future signed billing webhook to grant durable, non-expiring balances.
  const purchased = await sql<UsageRow>`
    with debit as (
      update ai_credit_accounts
      set purchased_balance = purchased_balance - 1, updated_at = now()
      where user_id = ${userId} and purchased_balance > 0
      returning purchased_balance
    ), usage as (
      insert into ai_usage_periods (user_id, period_start, purchased_used)
      select ${userId}, ${periodStart}::date, 1 from debit
      on conflict (user_id, period_start)
      do update set purchased_used = ai_usage_periods.purchased_used + 1, updated_at = now()
      returning included_used
    )
    select usage.included_used, debit.purchased_balance from usage cross join debit
  `;
  return purchased[0] ? usageView(purchased[0], resetsAt, "purchased") : null;
}

export async function refundAiQuestion(
  userId: string,
  debitedSource?: AiDebitSource,
): Promise<void> {
  const { periodStart } = getAiUsagePeriod();
  const sql = await getSql();

  if (debitedSource === "purchased") {
    await sql`
      update ai_credit_accounts
      set purchased_balance = purchased_balance + 1, updated_at = now()
      where user_id = ${userId}
    `;
    await sql`
      update ai_usage_periods
      set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
      where user_id = ${userId} and period_start = ${periodStart}::date and purchased_used > 0
    `;
    return;
  }

  if (debitedSource === "included") {
    await sql`
      update ai_usage_periods
      set included_used = greatest(0, included_used - 1), updated_at = now()
      where user_id = ${userId} and period_start = ${periodStart}::date and included_used > 0
    `;
    return;
  }

  // Fallback when debitedSource is not supplied: determine whether purchased was consumed
  const rows = await sql<{ included_used: number; purchased_used: number }>`
    select included_used, purchased_used from ai_usage_periods
    where user_id = ${userId} and period_start = ${periodStart}::date
  `;
  const row = rows[0];
  const includedLimit = monthlyLimit();
  if (row && row.purchased_used > 0 && row.included_used >= includedLimit) {
    await sql`
      update ai_credit_accounts
      set purchased_balance = purchased_balance + 1, updated_at = now()
      where user_id = ${userId}
    `;
    await sql`
      update ai_usage_periods
      set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
      where user_id = ${userId} and period_start = ${periodStart}::date and purchased_used > 0
    `;
  } else {
    await sql`
      update ai_usage_periods
      set included_used = greatest(0, included_used - 1), updated_at = now()
      where user_id = ${userId} and period_start = ${periodStart}::date and included_used > 0
    `;
  }
}
