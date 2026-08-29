import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AI_REFERENCE_SUMMARY, getAiReferenceContext } from "./ai-reference.server.ts";

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
    "../routes/documents.tsx",
    "../routes/directory.tsx",
    "./data/notification-feed.ts",
    "./data/catalog.ts",
  ]) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    assert.doesNotMatch(source, /ai-reference/i, relativePath);
  }
});
