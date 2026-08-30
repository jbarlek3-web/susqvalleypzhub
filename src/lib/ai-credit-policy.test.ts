import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_AI_MONTHLY_ALLOWANCE,
  getAiUsagePeriod,
  parseAiMonthlyAllowance,
} from "./ai-credit-policy.ts";

test("AI allowance defaults to 100 and accepts a bounded integer override", () => {
  assert.equal(parseAiMonthlyAllowance(undefined), DEFAULT_AI_MONTHLY_ALLOWANCE);
  assert.equal(parseAiMonthlyAllowance("250"), 250);
  for (const invalid of ["0", "-1", "1.5", "10001", "not-a-number"]) {
    assert.equal(parseAiMonthlyAllowance(invalid), DEFAULT_AI_MONTHLY_ALLOWANCE);
  }
});

test("AI allowance periods use calendar months in UTC", () => {
  assert.deepEqual(getAiUsagePeriod(new Date("2026-12-31T23:59:59.000Z")), {
    periodStart: "2026-12-01",
    resetsAt: "2027-01-01T00:00:00.000Z",
  });
});
