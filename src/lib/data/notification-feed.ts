import { DOCUMENTS } from "@/lib/data/documents";
import type { AlertItem, County, PlanningDoc } from "@/lib/types";

/**
 * Increment when the catalog-to-watchlist rules change. The persisted-store
 * migration uses this to discard obsolete demo alerts from prior app versions.
 */
export const NOTIFICATION_FEED_VERSION = 2;

const WATCHED_COUNTIES: County[] = ["York", "Cumberland", "Dauphin", "Lancaster"];
const RECORDS_PER_COUNTY = 3;

function updatedAt(record: PlanningDoc) {
  const value = Date.parse(record.updated);
  return Number.isNaN(value) ? 0 : value;
}

function alertKind(record: PlanningDoc): AlertItem["kind"] {
  if (record.category === "Zoning") return "zoning";
  if (record.category === "SALDO") return "ordinance";
  return "document";
}

function sourceLabel(record: PlanningDoc) {
  if (record.linkType === "source-page") return "Official municipal source page";
  return record.source === "official" ? "Official municipal record" : "Recovered public record";
}

function alertTitle(record: PlanningDoc) {
  const name = record.name.replace(/\s*\(official source page\)$/i, "");
  return `${record.municipality}: ${name}`;
}

function mostRecentDistinctRecords(county: County) {
  const seen = new Set<string>();
  const records: PlanningDoc[] = [];

  for (const record of DOCUMENTS
    .filter((item) => item.county === county)
    .slice()
    .sort((a, b) => updatedAt(b) - updatedAt(a))) {
    const key = `${record.municipality}:${record.category}`;
    if (seen.has(key)) continue;
    seen.add(key);
    records.push(record);
    if (records.length === RECORDS_PER_COUNTY) break;
  }

  return records;
}

/**
 * A source-backed, in-app watchlist. `updated` means the catalog indexed or
 * re-verified the source record on that date; it is deliberately not presented
 * as an ordinance adoption or effective date.
 */
export const OPERATIONAL_ALERTS: AlertItem[] = WATCHED_COUNTIES.flatMap((county) =>
  mostRecentDistinctRecords(county).map((record) => ({
    id: `source-${record.id}`,
    kind: alertKind(record),
    title: alertTitle(record),
    body: `${record.category} record for ${record.municipality}. Indexed ${record.updated}; verify adoption and effective dates at the source before relying on it for a decision.`,
    at: `Indexed ${record.updated}`,
    unread: true,
    county,
    municipality: record.municipality,
    source: sourceLabel(record),
    actionUrl: record.url,
    actionLabel: record.linkType === "source-page" ? "Open official source page" : "Open source record",
    priority: "watch" as const,
  })),
).sort((a, b) => {
  const aDate = Date.parse(a.at.replace("Indexed ", ""));
  const bDate = Date.parse(b.at.replace("Indexed ", ""));
  return bDate - aDate;
});
