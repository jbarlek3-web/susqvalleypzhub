import type { DerivedLineage, ProvenanceStatus } from "../provenance.ts";
import { assertDerivedLineage } from "../provenance.ts";

export const SAMPLE_DEMO_SURFACES: Record<string, ProvenanceStatus> = {
  insights: "sample-demo",
  minutes: "sample-demo",
  seededParcels: "sample-demo",
};

const CALCULATED_AT = "2024-10-24T00:00:00.000Z";

export const INSIGHTS_DERIVED: Record<string, DerivedLineage> = {
  pricePerAcre: assertDerivedLineage({
    formula: "county_month_median_price_usd / acre",
    units: "USD / acre, displayed as thousands",
    rounding: "nearest 1k USD",
    inputVersions: "PRICE_SERIES catalog v2024-10-24 sample-demo",
    calculatedAt: CALCULATED_AT,
  }),
  permitVolume: assertDerivedLineage({
    formula: "count(issued_permits) and count(pending_permits) by county",
    units: "permit count",
    rounding: "integer",
    inputVersions: "PERMIT_VOLUME catalog v2024-10-24 sample-demo",
    calculatedAt: CALCULATED_AT,
  }),
  floodShare: assertDerivedLineage({
    formula: "count(parcels in zone) / count(active_parcels) * 100",
    units: "percent of inventory",
    rounding: "nearest 1 percent",
    inputVersions: "illustrative 4-county inventory v2024-10-24 sample-demo",
    calculatedAt: CALCULATED_AT,
  }),
};

export const SEEDED_PARCEL_BUILDABLE: DerivedLineage = assertDerivedLineage({
  formula: "gross_lot_sf - row_dedication_sf - env_buffer_sf - setback_sf",
  units: "square feet",
  rounding: "integer SF",
  inputVersions: "PARCELS seed catalog v2024-10-24 sample-demo",
  calculatedAt: CALCULATED_AT,
});
