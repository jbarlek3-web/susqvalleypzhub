import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  AI_REFERENCE_SUMMARY,
  REFERENCE_TOPICS,
  classifyDocumentDomain,
  getAiReferenceContext,
  getAiReferenceEvidence,
  getAiReferenceScope,
} from "./ai-reference.server.ts";

const FOUR_COUNTIES = ["Cumberland", "Dauphin", "Lancaster", "York"];

test("the complete regional corpus is private and explicitly attributed", () => {
  assert.equal(AI_REFERENCE_SUMMARY.audience, "ai-only");
  assert.deepEqual([...AI_REFERENCE_SUMMARY.counties].sort(), FOUR_COUNTIES);
  assert.ok(AI_REFERENCE_SUMMARY.documentCount >= 500);
  assert.ok(AI_REFERENCE_SUMMARY.chunkCount >= 1_000);
  for (const county of FOUR_COUNTIES) {
    assert.ok(
      (AI_REFERENCE_SUMMARY.coverage.countyDocumentAssociations[county] ?? 0) > 0,
      `${county} must have at least one attributable document`,
    );
  }

  const shardUrls = FOUR_COUNTIES.map(
    (county) => new URL(`./data/ai-reference/${county.toLowerCase()}.json`, import.meta.url),
  );
  const corpusSource = shardUrls.map((url) => readFileSync(url, "utf8")).join("\n");
  assert.doesNotMatch(corpusSource, /"url"\s*:/i);
  assert.doesNotMatch(corpusSource, /"localPath"\s*:/i);
  assert.doesNotMatch(corpusSource, /[A-Z]:\\Master Zoning Folder/i);
  assert.doesNotMatch(corpusSource, /AIza[0-9A-Za-z_-]{35}/);
  const parsedDocuments = shardUrls.flatMap((url) => {
    const parsed = JSON.parse(readFileSync(url, "utf8")) as {
      documents: Array<{
      id: string;
      jurisdictions: Array<{ county: string; municipality: string }>;
      status: string;
      failureReason: string | null;
      }>;
    };
    return parsed.documents;
  });
  for (const document of parsedDocuments) {
    assert.ok(document.jurisdictions.length > 0, document.id);
    if (document.status !== "ready") assert.ok(document.failureReason, document.id);
  }
});

test("the agent scope exposes jurisdictions and counts without document contents", () => {
  const scope = getAiReferenceScope();
  assert.deepEqual(
    scope.counties.map(({ county }) => county),
    FOUR_COUNTIES,
  );
  assert.equal(scope.documentCount, AI_REFERENCE_SUMMARY.documentCount);
  assert.equal(scope.chunkCount, AI_REFERENCE_SUMMARY.chunkCount);
  for (const { county, municipalities } of scope.counties) {
    assert.ok(municipalities.length > 0, `${county} must have a queryable jurisdiction`);
    assert.ok(municipalities.every((name) => /(township|borough|city|county)$/i.test(name)));
  }
});

test("retrieval is scoped by county and municipality before ranking", () => {
  const yorkContext = getAiReferenceContext({
    municipality: "York Township",
    county: "York",
    zoning: "R-1",
    constraints: ["stormwater"],
    question: "What zoning, setback, SALDO, fee, and stormwater requirements should I verify?",
  });
  assert.match(yorkContext, /York \/ (York Township|York County) reference:/);
  assert.doesNotMatch(yorkContext, /Lancaster \/|Cumberland \/|Dauphin \//);

  assert.equal(
    getAiReferenceContext({
      municipality: "York Township",
      county: "Lancaster",
      zoning: "R-1",
      constraints: [],
      question: "York Township zoning ordinance",
    }),
    "",
  );
  assert.equal(
    getAiReferenceContext({
      municipality: "Unknown Place",
      county: "Unknown",
      zoning: "R-1",
      constraints: [],
    }),
    "",
  );
});

test("the latest Cumberland municipal intake is fully searchable", () => {
  const parsed = JSON.parse(
    readFileSync(new URL("./data/ai-reference/cumberland.json", import.meta.url), "utf8"),
  ) as {
    documents: Array<{
      filename: string;
      aliases: string[];
      status: string;
      extractionMode: string;
      needsOcr: boolean;
      chunkCount: number;
    }>;
  };
  const prefixes = [
    "Upper Allen Township - ",
    "Upper Mifflin Township - ",
    "West Pennsboro Township - ",
    "Wormleysburg Borough - ",
  ];
  const records = parsed.documents.flatMap((document) =>
    [document.filename, ...document.aliases]
      .filter((filename) => prefixes.some((prefix) => filename.startsWith(prefix)))
      .map((filename) => ({ filename, document })),
  );

  assert.equal(records.length, 68);
  assert.equal(records.filter(({ document }) => document.status === "ready").length, 68);
  assert.equal(records.filter(({ document }) => document.extractionMode === "ocr-sidecar").length, 7);
  assert.equal(records.filter(({ document }) => document.needsOcr).length, 0);
  assert.ok(records.reduce((total, { document }) => total + document.chunkCount, 0) >= 588);
});

test("public routes and shared catalogs do not import the private AI corpus", () => {
  for (const relativePath of [
    "../routes/aide.tsx",
    "../routes/directory.tsx",
    "./data/notification-feed.ts",
    "./data/catalog.ts",
  ]) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    assert.doesNotMatch(source, /ai-reference/i, relativePath);
  }
});

test("classifyDocumentDomain accurately identifies all land-use pillars", () => {
  // 1. Fee schedules
  assert.equal(classifyDocumentDomain("Dickinson Township - 2026 Fee Schedule.pdf"), "fees");
  assert.equal(classifyDocumentDomain("York Township - Resolution 2025-04 Fee Schedule.pdf"), "fees");
  assert.equal(classifyDocumentDomain("Lower Allen Township - Schedule of Fees.pdf"), "fees");

  // 2. Permits and applications
  assert.equal(
    classifyDocumentDomain("Yoe Borough - Building_Zoning Permit Application.pdf"),
    "permits",
  );
  assert.equal(classifyDocumentDomain("Camp Hill Borough - Zoning Permits.html"), "permits");
  assert.equal(
    classifyDocumentDomain("Carlisle Borough - When Do I Need a Permit_.html"),
    "permits",
  );

  // 3. SALDO
  assert.equal(
    classifyDocumentDomain("Cumberland County Subdivision and Land Development Reviews.html"),
    "saldo",
  );
  assert.equal(
    classifyDocumentDomain("Codification-and-Various-Changes-SLDO-Review-Report.pdf"),
    "saldo",
  );
  assert.equal(
    classifyDocumentDomain("York County - SALDO Requirements.pdf", "SALDO"),
    "saldo",
  );

  // 4. Zoning
  assert.equal(
    classifyDocumentDomain("Codification-and-Various-Changes-Zoning-Review-Report.pdf"),
    "zoning",
  );
  assert.equal(classifyDocumentDomain("Camp Hill Borough - Zoning.html"), "zoning");
  assert.equal(classifyDocumentDomain("Carlisle Borough - Zoning Information.html"), "zoning");

  // 5. Codes and Stormwater
  assert.equal(
    classifyDocumentDomain("Cumberland County Stormwater Management Plan 2010.pdf"),
    "codes",
  );
  assert.equal(classifyDocumentDomain("Cooke Township - Stormwater.pdf"), "codes");
  assert.equal(classifyDocumentDomain("Carlisle Borough - Stormwater Management.html"), "codes");

  // 6. Comprehensive Plans
  assert.equal(
    classifyDocumentDomain("Cumberland County Comprehensive Plan 2024.pdf"),
    "comprehensive_plan",
  );
  assert.equal(classifyDocumentDomain("Carlisle Borough - Comprehensive Plan.html"), "comprehensive_plan");
});

test("getAiReferenceScope reports domain distributions", () => {
  const scope = getAiReferenceScope();
  assert.ok(scope.domains);
  assert.ok(scope.domains.all > 0);
  assert.ok(scope.domains.zoning > 0);
  assert.ok(scope.domains.codes > 0);
  assert.ok(scope.domains.saldo >= 0);
  assert.ok(scope.domains.fees >= 0);
  assert.ok(scope.domains.permits >= 0);
});

test("getAiReferenceEvidence attaches domain tags and respects topic filters", () => {
  const evidence = getAiReferenceEvidence({
    county: "York",
    municipality: "York Township",
    zoning: "R-1",
    constraints: [],
    question: "What are the zoning setbacks?",
    topic: "zoning",
  });
  assert.ok(evidence.length > 0);
  for (const item of evidence) {
    assert.ok(item.domain);
    assert.ok(typeof item.domain === "string");
  }

  const context = getAiReferenceContext({
    county: "York",
    municipality: "York Township",
    zoning: "R-1",
    constraints: [],
    question: "What are the zoning setbacks?",
    topic: "zoning",
  });
  assert.match(context, /York \/ (York Township|York County) reference: \[zoning\]/);
});

test("REFERENCE_TOPICS includes all land-use pillars", () => {
  assert.ok(REFERENCE_TOPICS.includes("fees"));
  assert.ok(REFERENCE_TOPICS.includes("saldo"));
  assert.ok(REFERENCE_TOPICS.includes("zoning"));
  assert.ok(REFERENCE_TOPICS.includes("permits"));
  assert.ok(REFERENCE_TOPICS.includes("codes"));
  assert.ok(REFERENCE_TOPICS.includes("comprehensive_plan"));
  assert.ok(REFERENCE_TOPICS.includes("all"));
});
