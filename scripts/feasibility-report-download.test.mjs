import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = async (rel) => {
  try {
    return await readFile(rel, "utf8");
  } catch {
    return await readFile(new URL(`../${rel}`, import.meta.url), "utf8");
  }
};

test("feasibility PDF download is signed, user-bound, Pro-only, and same-site", async () => {
  const route = await readProjectFile("src/routes/api/feasibility-report/pdf.ts");
  const guard = await readProjectFile("src/lib/feasibility-report-route.server.ts");
  const signer = await readProjectFile("src/lib/feasibility-report.server.ts");
  assert.match(route, /authenticatedFeasibilityReport/);
  assert.match(route, /application\/pdf/);
  assert.match(route, /content-disposition/);
  assert.match(route, /private, no-store/);
  assert.match(guard, /assertSameSiteRequest\(\)/);
  assert.match(guard, /requireUserId\(\)/);
  assert.match(guard, /await requirePro\(\)/);
  assert.match(guard, /consumeRateLimit/);
  assert.match(signer, /createHmac\("sha256"/);
  assert.match(signer, /timingSafeEqual/);
  assert.match(signer, /parsed\.userId !== userId/);
});

test("download accepts only a signed report token and never imports the municipal catalog", async () => {
  const route = await readProjectFile("src/routes/api/feasibility-report/pdf.ts");
  const pdf = await readProjectFile("src/lib/feasibility-pdf.server.ts");
  assert.match(route, /typeof body\.token !== "string"/);
  assert.doesNotMatch(
    route + pdf,
    /data\/documents|regional-document-coverage|referenceContext|ai-reference\.server/,
  );
  assert.match(pdf, /Municipal and county reference documents are not attached or delivered/);
});

test("the legacy parcel brief now resolves parcel facts server-side and uses the AI allowance", async () => {
  const source = await readProjectFile("src/lib/grok-analyze.ts");
  assert.match(source, /parcelId/);
  assert.match(source, /getParcel\(data\.parcelId\)/);
  assert.match(source, /consumeAiQuestion\(context\)/);
  assert.match(source, /if \(!referenceContext\)/);
  assert.doesNotMatch(source, /address: z\.string|municipality: z\.string|xAI API error/);
});
