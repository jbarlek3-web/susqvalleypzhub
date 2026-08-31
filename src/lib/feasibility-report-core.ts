import { z } from "zod";

export const REPORT_SECTIONS = [
  "Zoning and entitlement",
  "Site constraints",
  "Utilities and infrastructure",
  "Market and comparables",
  "Development scenarios",
  "Financial feasibility",
] as const;

export const FeasibilityInputSchema = z.object({
  parcelId: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]{1,100}$/),
  intendedUse: z.string().trim().min(3).max(160),
  askingPrice: z.number().finite().min(0).max(1_000_000_000),
  targetLots: z.number().int().min(1).max(10_000),
  salePricePerLot: z.number().finite().min(0).max(100_000_000),
  siteworkPerLot: z.number().finite().min(0).max(10_000_000),
  softCostPercent: z.number().finite().min(0).max(100),
  carryPercent: z.number().finite().min(0).max(100),
  sellingCostPercent: z.number().finite().min(0).max(100),
  question: z.string().trim().max(600).optional(),
});

export type FeasibilityInput = z.infer<typeof FeasibilityInputSchema>;

export const EvidenceStatusSchema = z.enum(["verified", "assumption", "missing"]);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

export const ReportClaimSchema = z.object({
  id: z.string().min(1).max(80),
  section: z.enum(REPORT_SECTIONS),
  statement: z.string().trim().min(3).max(700),
  status: EvidenceStatusSchema,
  confidence: z.enum(["high", "medium", "low"]),
  sourceIds: z.array(z.string().min(1).max(160)).max(4),
});

export const ReportEvidenceSchema = z.object({
  id: z.string().min(1).max(160),
  sourceTitle: z.string().min(1).max(260),
  sourceType: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  jurisdiction: z.string().min(1).max(180),
  locator: z.string().max(80),
  officialSourceUrl: z.string().url().nullable(),
  accessedAt: z.string().datetime(),
});

const MoneyScenarioSchema = z.object({
  name: z.string(),
  lots: z.number().int(),
  revenue: z.number(),
  totalCost: z.number(),
  profit: z.number(),
  marginPercent: z.number(),
});

export const FinancialModelSchema = z.object({
  assumptions: z.object({
    askingPrice: z.number(),
    targetLots: z.number().int(),
    salePricePerLot: z.number(),
    siteworkPerLot: z.number(),
    softCostPercent: z.number(),
    carryPercent: z.number(),
    sellingCostPercent: z.number(),
  }),
  grossRevenue: z.number(),
  directSitework: z.number(),
  softCosts: z.number(),
  carryCosts: z.number(),
  sellingCosts: z.number(),
  totalCost: z.number(),
  projectedProfit: z.number(),
  marginPercent: z.number(),
  breakevenPerLot: z.number(),
  scenarios: z.array(MoneyScenarioSchema).length(3),
  lineage: z.array(z.string().max(300)).min(5).max(12),
});

export const FeasibilityReportSchema = z.object({
  schemaVersion: z.literal(1),
  reportId: z.string().regex(/^fr_[a-zA-Z0-9_-]+$/),
  generatedAt: z.string().datetime(),
  parcel: z.object({
    id: z.string(),
    address: z.string(),
    apn: z.string(),
    municipality: z.string(),
    county: z.string(),
    acres: z.number(),
    zoning: z.string(),
    zoningName: z.string(),
  }),
  intendedUse: z.string(),
  verdict: z.enum(["Proceed", "Proceed with conditions", "Hold", "Do not proceed"]),
  feasibilityScore: z.number().int().min(0).max(100),
  executiveSummary: z.string().min(10).max(1_600),
  conditions: z.array(z.string().max(300)).max(8),
  claims: z.array(ReportClaimSchema).min(1).max(30),
  evidence: z.array(ReportEvidenceSchema).max(20),
  diligenceItems: z.array(z.string().max(300)).min(1).max(12),
  killCriteria: z.array(z.string().max(300)).min(1).max(8),
  limitations: z.array(z.string().max(400)).min(1).max(10),
  financial: FinancialModelSchema,
});

export type FeasibilityReport = z.infer<typeof FeasibilityReportSchema>;

function scenario(
  name: string,
  assumptions: FeasibilityInput,
  lotsFactor: number,
  priceFactor: number,
  costFactor: number,
) {
  const lots = Math.max(1, Math.round(assumptions.targetLots * lotsFactor));
  const revenue = lots * assumptions.salePricePerLot * priceFactor;
  const sitework = lots * assumptions.siteworkPerLot * costFactor;
  const softCosts = (sitework + assumptions.askingPrice) * (assumptions.softCostPercent / 100);
  const carryCosts =
    (sitework + softCosts + assumptions.askingPrice) * (assumptions.carryPercent / 100);
  const sellingCosts = revenue * (assumptions.sellingCostPercent / 100);
  const totalCost = assumptions.askingPrice + sitework + softCosts + carryCosts + sellingCosts;
  const profit = revenue - totalCost;
  return {
    name,
    lots,
    revenue,
    totalCost,
    profit,
    marginPercent: revenue ? (profit / revenue) * 100 : 0,
  };
}

export function buildFinancialModel(input: FeasibilityInput) {
  const target = scenario("Target", input, 1, 1, 1);
  const grossRevenue = target.revenue;
  const directSitework = input.targetLots * input.siteworkPerLot;
  const softCosts = (directSitework + input.askingPrice) * (input.softCostPercent / 100);
  const carryCosts = (directSitework + softCosts + input.askingPrice) * (input.carryPercent / 100);
  const sellingCosts = grossRevenue * (input.sellingCostPercent / 100);
  const totalCost = input.askingPrice + directSitework + softCosts + carryCosts + sellingCosts;
  const projectedProfit = grossRevenue - totalCost;
  return {
    assumptions: {
      askingPrice: input.askingPrice,
      targetLots: input.targetLots,
      salePricePerLot: input.salePricePerLot,
      siteworkPerLot: input.siteworkPerLot,
      softCostPercent: input.softCostPercent,
      carryPercent: input.carryPercent,
      sellingCostPercent: input.sellingCostPercent,
    },
    grossRevenue,
    directSitework,
    softCosts,
    carryCosts,
    sellingCosts,
    totalCost,
    projectedProfit,
    marginPercent: grossRevenue ? (projectedProfit / grossRevenue) * 100 : 0,
    breakevenPerLot: input.targetLots ? totalCost / input.targetLots : 0,
    scenarios: [
      scenario("By-right / downside", input, 0.8, 0.92, 1.1),
      target,
      scenario("Upside", input, 1.15, 1.06, 0.97),
    ],
    lineage: [
      "Gross revenue = target lots x sale price per lot.",
      "Direct sitework = target lots x sitework cost per lot.",
      "Soft costs = (land price + direct sitework) x soft-cost percentage.",
      "Carry costs = (land price + direct sitework + soft costs) x carry percentage.",
      "Selling costs = gross revenue x selling-cost percentage.",
      "Projected profit = gross revenue - total cost.",
      "Breakeven per lot = total cost / target lots.",
      "Scenario changes are transparent factors, not forecasts or appraisals.",
    ],
  };
}

export function reportCoverage(report: FeasibilityReport) {
  return report.claims.reduce(
    (counts, claim) => ({ ...counts, [claim.status]: counts[claim.status] + 1 }),
    { verified: 0, assumption: 0, missing: 0 },
  );
}
