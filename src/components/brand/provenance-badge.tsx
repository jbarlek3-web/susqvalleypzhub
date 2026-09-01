import type { DerivedLineage, ProvenanceStatus } from "@/lib/provenance";
import { cn } from "@/lib/utils";

const LABELS: Record<ProvenanceStatus, string> = {
  "authoritative-live": "Authoritative live",
  "authoritative-captured": "Authoritative captured",
  derived: "Derived",
  assumption: "Assumption",
  missing: "Missing",
  "sample-demo": "Sample/demo",
  "stale-degraded": "Stale/degraded",
};

export function ProvenanceBadge({
  status,
  lineage,
  className,
}: {
  status: ProvenanceStatus;
  lineage?: DerivedLineage;
  className?: string;
}) {
  if (!status) {
    throw new Error("ProvenanceBadge requires a status");
  }
  return (
    <span
      role="status"
      data-provenance={status}
      className={cn(
        "inline-flex max-w-full flex-col rounded-sm border border-outline-variant bg-surface-container px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant",
        className,
      )}
    >
      <span>{LABELS[status]}</span>
      {status === "sample-demo" ? (
        <span className="font-medium normal-case tracking-normal text-muted-foreground">
          Not for generated decisions
        </span>
      ) : null}
      {status === "derived" && lineage ? (
        <span className="font-medium normal-case tracking-normal text-muted-foreground">
          {lineage.formula} · {lineage.units} · {lineage.rounding} · {lineage.inputVersions} ·{" "}
          {lineage.calculatedAt}
        </span>
      ) : null}
    </span>
  );
}
