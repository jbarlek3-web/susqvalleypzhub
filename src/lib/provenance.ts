/**
 * Appendix C data-truth labels. Sample/demo values must never enter generated decisions.
 */
export const PROVENANCE_STATUSES = [
  "authoritative-live",
  "authoritative-captured",
  "derived",
  "assumption",
  "missing",
  "sample-demo",
  "stale-degraded",
] as const;

export type ProvenanceStatus = (typeof PROVENANCE_STATUSES)[number];

export type DerivedLineage = {
  formula: string;
  units: string;
  rounding: string;
  inputVersions: string;
  calculatedAt: string;
};

export function isProvenanceStatus(value: unknown): value is ProvenanceStatus {
  return typeof value === "string" && (PROVENANCE_STATUSES as readonly string[]).includes(value);
}

export function isUsableInGeneratedDecisions(status: ProvenanceStatus): boolean {
  if (!isProvenanceStatus(status)) {
    throw new Error("isUsableInGeneratedDecisions requires a provenance status");
  }
  return status === "authoritative-live" || status === "authoritative-captured";
}

export function sampleDemoBlockMessage(): string {
  return "Sample/demo data is excluded from generated decisions.";
}

export function assertDerivedLineage(lineage: DerivedLineage): DerivedLineage {
  if (!lineage || typeof lineage !== "object") {
    throw new Error("Derived lineage is required");
  }
  for (const key of ["formula", "units", "rounding", "inputVersions", "calculatedAt"] as const) {
    const value = lineage[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Derived lineage missing ${key}`);
    }
  }
  return lineage;
}
