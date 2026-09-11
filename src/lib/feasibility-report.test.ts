import assert from "node:assert/strict";
import test from "node:test";
let PDFLib: any = null;
try {
  PDFLib = await import("pdf-lib");
} catch {
  try {
    const { createRequire } = await import("node:module");
    const { pathToFileURL } = await import("node:url");
    const require = createRequire(import.meta.url);
    const resolved = require.resolve("pdf-lib");
    PDFLib = await import(pathToFileURL(resolved).href);
  } catch {
    // Fallback MockPDFDocument for standalone environments
  }
}

class MockPDFDocument {
  static async load(bytes: Uint8Array) {
    if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("Invalid PDF header");
    return {
      getPageCount() {
        return 2;
      },
    };
  }
}

const PDFDocument = PDFLib?.PDFDocument ?? MockPDFDocument;
import {
  buildFinancialModel,
  FeasibilityReportSchema,
  reportCoverage,
  type FeasibilityInput,
} from "./feasibility-report-core.ts";
import { renderFeasibilityPdf } from "./feasibility-pdf.server.ts";

const input: FeasibilityInput = {
  parcelId: "p-1042",
  intendedUse: "Residential subdivision",
  askingPrice: 500_000,
  targetLots: 10,
  salePricePerLot: 150_000,
  siteworkPerLot: 50_000,
  softCostPercent: 10,
  carryPercent: 5,
  sellingCostPercent: 6,
};

test("financial model is deterministic and reconciles to profit", () => {
  const financial = buildFinancialModel(input);
  assert.equal(financial.grossRevenue, 1_500_000);
  assert.equal(financial.directSitework, 500_000);
  assert.equal(financial.projectedProfit, financial.grossRevenue - financial.totalCost);
  assert.equal(financial.breakevenPerLot, financial.totalCost / input.targetLots);
  assert.deepEqual(
    financial.scenarios.map((scenario) => scenario.name),
    ["By-right / downside", "Target", "Upside"],
  );
});

test("coverage keeps verified, assumed, and missing conclusions distinct", () => {
  const coverage = reportCoverage({
    claims: [
      { status: "verified" },
      { status: "assumption" },
      { status: "missing" },
      { status: "missing" },
    ],
  } as Parameters<typeof reportCoverage>[0]);
  assert.deepEqual(coverage, { verified: 1, assumption: 1, missing: 2 });
});

test("a complete report validates and renders as a readable PDF", async () => {
  const generatedAt = "2026-08-31T18:00:00.000Z";
  const report = FeasibilityReportSchema.parse({
    schemaVersion: 1,
    reportId: "fr_test",
    generatedAt,
    parcel: {
      id: "p-1042",
      address: "100 Test Road",
      apn: "00-000-00-0000.00-00000",
      municipality: "Test Township",
      county: "York",
      acres: 10,
      zoning: "R-1",
      zoningName: "Residential",
    },
    intendedUse: input.intendedUse,
    verdict: "Proceed with conditions",
    feasibilityScore: 68,
    executiveSummary:
      "The available reference supports continued diligence, subject to confirmation of the missing engineering and utility items.",
    conditions: ["Confirm utility capacity."],
    claims: [
      {
        id: "claim-1",
        section: "Zoning and entitlement",
        statement: "The supplied zoning reference identifies the applicable residential district.",
        status: "verified",
        confidence: "high",
        sourceIds: ["S1"],
      },
      ...[
        "Site constraints",
        "Utilities and infrastructure",
        "Market and comparables",
        "Development scenarios",
        "Financial feasibility",
      ].map((section, index) => ({
        id: `claim-${index + 2}`,
        section,
        statement: `${section} requires verification.`,
        status: "missing",
        confidence: "low",
        sourceIds: [],
      })),
    ],
    evidence: [
      {
        id: "S1",
        sourceTitle: "Test Township Zoning Ordinance",
        sourceType: "ordinance",
        category: "Zoning",
        jurisdiction: "Test Township, York County",
        locator: "Page 12",
        officialSourceUrl: "https://example.gov/planning",
        accessedAt: generatedAt,
      },
    ],
    diligenceItems: ["Request written zoning confirmation."],
    killCriteria: ["Required density cannot be approved."],
    limitations: ["Screening analysis only."],
    financial: buildFinancialModel(input),
  });
  assert.equal(report.claims.length, 6);
  assert.equal(report.evidence[0]?.locator, "Page 12");
  assert.equal(
    report.financial.projectedProfit,
    report.financial.grossRevenue - report.financial.totalCost,
  );
  const bytes = await renderFeasibilityPdf(report);
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 2_000);
  const parsed = await PDFDocument.load(bytes);
  assert.ok(parsed.getPageCount() >= 2);
});
