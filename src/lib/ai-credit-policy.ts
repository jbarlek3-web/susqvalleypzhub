export const DEFAULT_AI_MONTHLY_ALLOWANCE = 100;
export const MAX_CONFIGURED_AI_MONTHLY_ALLOWANCE = 10_000;

export function parseAiMonthlyAllowance(raw: string | undefined) {
  if (!raw?.trim()) return DEFAULT_AI_MONTHLY_ALLOWANCE;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > MAX_CONFIGURED_AI_MONTHLY_ALLOWANCE) {
    return DEFAULT_AI_MONTHLY_ALLOWANCE;
  }
  return value;
}

export function getAiUsagePeriod(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  return {
    periodStart: `${year.toString().padStart(4, "0")}-${(month + 1).toString().padStart(2, "0")}-01`,
    resetsAt: new Date(Date.UTC(year, month + 1, 1)).toISOString(),
  };
}
