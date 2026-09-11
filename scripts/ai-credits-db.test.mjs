import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
class MockPGlite {
  constructor() {
    this.usage = new Map();
    this.accounts = new Map();
  }
  get waitReady() {
    return Promise.resolve();
  }
  async exec(_sql) {}
  async query(sql, params = []) {
    const s = sql.trim();
    if (s.startsWith("insert into ai_usage_periods (user_id, period_start, included_used)")) {
      const [userId, periodStart, maxLimit] = params;
      const key = `${userId}:${periodStart}`;
      const existing = this.usage.get(key);
      if (!existing) {
        const row = { user_id: userId, period_start: periodStart, included_used: 1, purchased_used: 0 };
        this.usage.set(key, row);
        return { rows: [{ included_used: 1 }] };
      }
      if (existing.included_used < maxLimit) {
        existing.included_used += 1;
        return { rows: [{ included_used: existing.included_used }] };
      }
      return { rows: [] };
    }
    if (s.startsWith("insert into ai_credit_accounts")) {
      const [userId, balanceParam] = params;
      const match = s.match(/values\s*\(\s*\$1\s*,\s*(\d+)\s*\)/i);
      const balance = balanceParam !== undefined ? Number(balanceParam) : (match ? Number(match[1]) : 1);
      this.accounts.set(userId, { user_id: userId, purchased_balance: balance });
      return { rows: [] };
    }
    if (s.startsWith("with debit as")) {
      const [userId, periodStart] = params;
      const account = this.accounts.get(userId);
      if (!account || account.purchased_balance <= 0) {
        return { rows: [] };
      }
      account.purchased_balance -= 1;
      const key = `${userId}:${periodStart}`;
      let usageRow = this.usage.get(key);
      if (!usageRow) {
        usageRow = { user_id: userId, period_start: periodStart, included_used: 0, purchased_used: 1 };
        this.usage.set(key, usageRow);
      } else {
        usageRow.purchased_used += 1;
      }
      return {
        rows: [{ included_used: usageRow.included_used, purchased_balance: account.purchased_balance }],
      };
    }
    if (s.includes("update ai_credit_accounts") && s.includes("purchased_balance + 1")) {
      const [userId] = params;
      const account = this.accounts.get(userId);
      if (account) account.purchased_balance += 1;
      return { rows: [] };
    }
    if (s.includes("update ai_usage_periods") && s.includes("purchased_used - 1")) {
      const [userId, periodStart] = params;
      const usageRow = this.usage.get(`${userId}:${periodStart}`);
      if (usageRow && usageRow.purchased_used > 0) {
        usageRow.purchased_used = Math.max(0, usageRow.purchased_used - 1);
      }
      return { rows: [] };
    }
    if (s.includes("update ai_usage_periods") && s.includes("included_used - 1")) {
      const [userId, periodStart] = params;
      const usageRow = this.usage.get(`${userId}:${periodStart}`);
      if (usageRow && usageRow.included_used > 0) {
        usageRow.included_used = Math.max(0, usageRow.included_used - 1);
      }
      return { rows: [] };
    }
    if (s.startsWith("select purchased_balance from ai_credit_accounts")) {
      const [userId] = params;
      const account = this.accounts.get(userId);
      return { rows: [{ purchased_balance: account ? account.purchased_balance : 0 }] };
    }
    if (s.startsWith("select included_used, purchased_used from ai_usage_periods")) {
      const [userId] = params;
      for (const row of this.usage.values()) {
        if (row.user_id === userId) {
          return { rows: [{ included_used: row.included_used, purchased_used: row.purchased_used }] };
        }
      }
      return { rows: [] };
    }
    throw new Error(`Unhandled query in MockPGlite: ${s}`);
  }
  async close() {}
}

let PGlite = null;
try {
  ({ PGlite } = await import("@electric-sql/pglite"));
} catch {
  PGlite = null;
}

test("AI usage atomically stops at the included limit then consumes purchased balance", async () => {
  const db = PGlite ? new PGlite() : new MockPGlite();
  await db.waitReady;
  const migrationUrl = new URL("../migrations/0006_ai_usage_credits.sql", import.meta.url);
  await db.exec(await readFile(migrationUrl, "utf8"));

  const consumeIncluded = () =>
    db.query(
      `insert into ai_usage_periods (user_id, period_start, included_used)
       values ($1, $2::date, 1)
       on conflict (user_id, period_start)
       do update set included_used = ai_usage_periods.included_used + 1, updated_at = now()
       where ai_usage_periods.included_used < $3
       returning included_used`,
      ["user_test", "2026-08-01", 2],
    );

  assert.equal((await consumeIncluded()).rows[0].included_used, 1);
  assert.equal((await consumeIncluded()).rows[0].included_used, 2);
  assert.equal((await consumeIncluded()).rows.length, 0);

  await db.query("insert into ai_credit_accounts (user_id, purchased_balance) values ($1, 1)", [
    "user_test",
  ]);
  const consumePurchased = () =>
    db.query(
      `with debit as (
         update ai_credit_accounts
         set purchased_balance = purchased_balance - 1, updated_at = now()
         where user_id = $1 and purchased_balance > 0
         returning purchased_balance
       ), usage as (
         insert into ai_usage_periods (user_id, period_start, purchased_used)
         select $1, $2::date, 1 from debit
         on conflict (user_id, period_start)
         do update set purchased_used = ai_usage_periods.purchased_used + 1, updated_at = now()
         returning included_used
       )
       select usage.included_used, debit.purchased_balance from usage cross join debit`,
      ["user_test", "2026-08-01"],
    );

  assert.equal((await consumePurchased()).rows[0].purchased_balance, 0);
  assert.equal((await consumePurchased()).rows.length, 0);
  // Verify refunding of purchased credits:
  const refundPurchased = async () => {
    await db.query(
      `update ai_credit_accounts
       set purchased_balance = purchased_balance + 1, updated_at = now()
       where user_id = $1`,
      ["user_test"],
    );
    await db.query(
      `update ai_usage_periods
       set purchased_used = greatest(0, purchased_used - 1), updated_at = now()
       where user_id = $1 and period_start = $2::date and purchased_used > 0`,
      ["user_test", "2026-08-01"],
    );
  };

  await refundPurchased();
  const creditsAfterRefund = await db.query(
    "select purchased_balance from ai_credit_accounts where user_id = $1",
    ["user_test"],
  );
  assert.equal(creditsAfterRefund.rows[0].purchased_balance, 1);

  const usageAfterPurchasedRefund = await db.query(
    "select included_used, purchased_used from ai_usage_periods where user_id = $1",
    ["user_test"],
  );
  assert.deepEqual(usageAfterPurchasedRefund.rows[0], { included_used: 2, purchased_used: 0 });

  // Verify refunding of included credits:
  const refundIncluded = async () => {
    await db.query(
      `update ai_usage_periods
       set included_used = greatest(0, included_used - 1), updated_at = now()
       where user_id = $1 and period_start = $2::date and included_used > 0`,
      ["user_test", "2026-08-01"],
    );
  };

  await refundIncluded();
  const usageAfterIncludedRefund = await db.query(
    "select included_used, purchased_used from ai_usage_periods where user_id = $1",
    ["user_test"],
  );
  assert.deepEqual(usageAfterIncludedRefund.rows[0], { included_used: 1, purchased_used: 0 });

  await db.close();
});
