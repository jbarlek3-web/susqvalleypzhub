import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("AI usage atomically stops at the included limit then consumes purchased balance", async () => {
  const db = new PGlite();
  await db.waitReady;
  await db.exec(await readFile("migrations/0006_ai_usage_credits.sql", "utf8"));

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
  const usage = await db.query(
    "select included_used, purchased_used from ai_usage_periods where user_id = $1",
    ["user_test"],
  );
  assert.deepEqual(usage.rows[0], { included_used: 2, purchased_used: 1 });
  await db.close();
});
