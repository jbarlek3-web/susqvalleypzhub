import assert from "node:assert/strict";
import test from "node:test";
import {
  assertDerivedLineage,
  isUsableInGeneratedDecisions,
  sampleDemoBlockMessage,
} from "./provenance.ts";
import { INSIGHTS_DERIVED, SAMPLE_DEMO_SURFACES } from "./data/derived-layers.ts";

test("sample-demo is excluded from generated decisions", () => {
  assert.equal(isUsableInGeneratedDecisions("sample-demo"), false);
  assert.equal(isUsableInGeneratedDecisions("derived"), false);
  assert.equal(isUsableInGeneratedDecisions("authoritative-live"), true);
  assert.match(sampleDemoBlockMessage(), /Sample\/demo/);
});

test("insights and minutes are labeled sample-demo", () => {
  assert.equal(SAMPLE_DEMO_SURFACES.insights, "sample-demo");
  assert.equal(SAMPLE_DEMO_SURFACES.minutes, "sample-demo");
  assert.equal(SAMPLE_DEMO_SURFACES.seededParcels, "sample-demo");
});

test("derived insight series include formula, units, rounding, input versions, and timestamp", () => {
  for (const layer of Object.values(INSIGHTS_DERIVED)) {
    const lineage = assertDerivedLineage(layer);
    assert.ok(lineage.formula.length > 0);
    assert.ok(lineage.calculatedAt.includes("T"));
  }
});
