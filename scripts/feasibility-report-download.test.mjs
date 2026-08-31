import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("feasibility PDF download is signed, user-bound, Pro-only, and same-site", async () => {
  const route = await readFile("src/routes/api/feasibility-report/pdf.ts", "utf8");
  const guard = await readFile("src/lib/feasibility-report-route.server.ts", "utf8");
  const signer = await readFile("src/lib/feasibility-report.server.ts", "utf8");
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
  const route = await readFile("src/routes/api/feasibility-report/pdf.ts", "utf8");
  const pdf = await readFile("src/lib/feasibility-pdf.server.ts", "utf8");
  assert.match(route, /typeof body\.token !== "string"/);
  assert.doesNotMatch(
    route + pdf,
    /data\/documents|regional-document-coverage|referenceContext|ai-reference\.server/,
  );
  assert.match(pdf, /Municipal and county reference documents are not attached or delivered/);
});

test("the legacy parcel brief now resolves parcel facts server-side and uses the AI allowance", async () => {
  const source = await readFile("src/lib/grok-analyze.ts", "utf8");
  assert.match(source, /parcelId/);
  assert.match(source, /getParcel\(data\.parcelId\)/);
  assert.match(source, /consumeAiQuestion\(context\.userId\)/);
  assert.match(source, /if \(!referenceContext\)/);
  assert.doesNotMatch(source, /address: z\.string|municipality: z\.string|xAI API error/);
});
