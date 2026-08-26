export type FeasibilityDataMode = "live-map" | "download" | "underwriting" | "reference";

export type FeasibilityDataSource = {
  id: string;
  title: string;
  provider: string;
  mode: FeasibilityDataMode;
  use: string;
  detail: string;
  url: string;
  status: "Live in map" | "Official download" | "Research source" | "Reference only";
};

/**
 * Curated public-source registry for acquisition, feasibility, and underwriting work.
 * Heavy downloads and licensed products stay at their authoritative source; this app never
 * republishes them or treats a planning screen as a survey, appraisal, engineering, or lender decision.
 */
export const FEASIBILITY_DATA_SOURCES: FeasibilityDataSource[] = [
  {
    id: "york-parcels",
    title: "York County parcel boundaries and assessment attributes",
    provider: "York County Planning Commission",
    mode: "live-map",
    use: "Parcel screening, site acreage, address/APN matching, and assessment context.",
    detail: "The live map queries the official feature service only after a user zooms in.",
    url: "https://york-county-pa-gis-portal-yorkcountypa.hub.arcgis.com/datasets/803b4da39e7b457ab6e7a5eeb3410abb_0/explore",
    status: "Live in map",
  },
  {
    id: "pa-municipalities",
    title: "PA municipality boundaries",
    provider: "PennDOT via Pennsylvania Open Data",
    mode: "live-map",
    use: "Jurisdiction assignment, municipal zoning checks, and county/municipality filtering.",
    detail:
      "The map reads the supplied Pennsylvania Open Data dataset for the four active counties.",
    url: "https://data.pa.gov/d/ednf-5bi6",
    status: "Live in map",
  },
  {
    id: "pasda-york",
    title: "York County PASDA downloads",
    provider: "PASDA / York County",
    mode: "live-map",
    use: "Local roads, zoning, floodplains, streams, wetlands, conservation easements, contours, and growth areas.",
    detail:
      "Use the official download index for bulk GIS extracts and the live map for the selected York overlays.",
    url: "https://www.pasda.psu.edu/download/yorkcounty/",
    status: "Live in map",
  },
  {
    id: "pa-hydrography",
    title: "Pennsylvania hydrography",
    provider: "USGS National Hydrography Dataset / PASDA",
    mode: "live-map",
    use: "Streams, waterbodies, watershed constraints, and early environmental screening.",
    detail:
      "Hydrography is available as a live map overlay; use the PASDA index for downloadable data packages.",
    url: "https://www.pasda.psu.edu/download/PAHydrographyDataset/",
    status: "Live in map",
  },
  {
    id: "pa-soils",
    title: "Pennsylvania SSURGO soils",
    provider: "USDA NRCS / PASDA",
    mode: "live-map",
    use: "Preliminary soil constraints, suitability review, and civil/geotechnical scoping.",
    detail:
      "This is an early-screening layer, not a substitute for a site-specific soil investigation or sewage test.",
    url: "https://www.pasda.psu.edu/download/soils/",
    status: "Live in map",
  },
  {
    id: "usgs-topo",
    title: "USGS topographic maps",
    provider: "USGS National Map / PASDA",
    mode: "live-map",
    use: "Terrain orientation, drainage reconnaissance, and preliminary access review.",
    detail:
      "US Topo is available as a live basemap; PASDA supplies Pennsylvania GeoPDF packages for offline review.",
    url: "https://www.pasda.psu.edu/download/US_Topo_GeoPDFs/PA_30x60_minute/",
    status: "Live in map",
  },
  {
    id: "fema-nfhl",
    title: "FEMA National Flood Hazard Layer",
    provider: "FEMA Flood Map Service Center",
    mode: "live-map",
    use: "Official flood-hazard screening before site control, entitlement, or lender review.",
    detail:
      "The map displays FEMA Flood Hazard Zones. Confirm the effective map panel and community products in FEMA’s service center.",
    url: "https://msc.fema.gov/portal/home",
    status: "Live in map",
  },
  {
    id: "pasda-downloads",
    title: "PASDA statewide download catalog",
    provider: "Pennsylvania Spatial Data Access",
    mode: "download",
    use: "Authoritative Pennsylvania GIS source discovery and bulk downloads.",
    detail:
      "Use this when a project needs a full extract rather than a viewport-sized live map layer.",
    url: "https://www.pasda.psu.edu/download/",
    status: "Official download",
  },
  {
    id: "pasda-transportation",
    title: "PASDA transportation catalog",
    provider: "Pennsylvania Spatial Data Access",
    mode: "download",
    use: "Road, rail, transit, airport, and access-corridor due diligence.",
    detail:
      "Review currency, ownership, and PennDOT permitting separately before design decisions.",
    url: "https://www.pasda.psu.edu/uci/SearchResults.aspx?Shortcut=transportation",
    status: "Official download",
  },
  {
    id: "pasda-hydrology",
    title: "PASDA hydrology catalog",
    provider: "Pennsylvania Spatial Data Access",
    mode: "download",
    use: "Floodplain, wetlands, streams, watersheds, and water-resource due diligence.",
    detail: "Use together with the FEMA overlay and local stormwater/floodplain ordinance review.",
    url: "https://www.pasda.psu.edu/uci/SearchResults.aspx?Shortcut=hydrology",
    status: "Official download",
  },
  {
    id: "usgs-earth-explorer",
    title: "USGS EarthExplorer imagery and elevation search",
    provider: "USGS EROS",
    mode: "download",
    use: "Historical imagery, elevation products, and change reconnaissance.",
    detail:
      "Search and download at the source; dataset availability and licensing vary by collection.",
    url: "https://earthexplorer.usgs.gov/",
    status: "Official download",
  },
  {
    id: "central-pa-market-report-2026-08",
    title: "Central PA Land Development & Investment Market Report (August 2026)",
    provider: "Field ACQ Market Intelligence",
    mode: "underwriting",
    use: "Four-county market context for residential demand, land values, industrial activity, and entitlement-risk underwriting.",
    detail:
      "Supplied market-intelligence report for York, Lancaster, Dauphin, and Cumberland. Verify cited data and municipal requirements before underwriting; the Act 52 discussion is not legal advice.",
    url: "/reports/central-pa-land-development-investment-market-report-august-2026.pdf",
    status: "Research source",
  },
  {
    id: "hud-open-data",
    title: "HUD GIS Open Data",
    provider: "U.S. Department of Housing and Urban Development",
    mode: "underwriting",
    use: "Affordable-housing, neighborhood, and program-eligibility research.",
    detail:
      "Use official HUD layers as a program-screening input; confirm eligibility and underwriting requirements with the administering program.",
    url: "https://hudgis-hud.opendata.arcgis.com/",
    status: "Research source",
  },
  {
    id: "fhfa-pudb",
    title: "FHFA Public Use Database",
    provider: "Federal Housing Finance Agency",
    mode: "underwriting",
    use: "Census-tract mortgage acquisition, affordability, LTV, DTI, and multifamily credit-flow research.",
    detail:
      "Annual public-use data supports market context and sensitivity analysis; it is not property-level credit approval data.",
    url: "https://www.fhfa.gov/data/pudb",
    status: "Research source",
  },
  {
    id: "fred-mortgage-rate",
    title: "FRED 30-year fixed mortgage rate",
    provider: "Federal Reserve Bank of St. Louis / Freddie Mac",
    mode: "underwriting",
    use: "Debt-rate sensitivity, absorption assumptions, and capital-market context.",
    detail:
      "The source series is published weekly. Cite the source and refresh it for each underwriting or investment-committee package.",
    url: "https://fred.stlouisfed.org/series/MORTGAGE30US",
    status: "Research source",
  },
  {
    id: "deal-scale-reference",
    title: "Awesome Real Estate Investing reference list",
    provider: "Deal Scale community repository",
    mode: "reference",
    use: "Discover potential investor, operator, and prop-tech resources.",
    detail:
      "This is a third-party discovery list, not an authoritative source and not a data feed imported into reports.",
    url: "https://github.com/Deal-Scale/awesome-real-estate-investing",
    status: "Reference only",
  },
];

export const FEASIBILITY_DATA_GROUPS: Array<{
  mode: FeasibilityDataMode;
  title: string;
  description: string;
}> = [
  {
    mode: "live-map",
    title: "Live map inputs",
    description: "Viewport-based public layers already available from the Map workspace.",
  },
  {
    mode: "download",
    title: "Official downloads",
    description: "Bulk packages for engineering, GIS, or offline desktop analysis.",
  },
  {
    mode: "underwriting",
    title: "Underwriting research",
    description: "Public market and housing-finance context—refresh and cite for each report.",
  },
  {
    mode: "reference",
    title: "Discovery reference",
    description:
      "Third-party resource discovery only; verify any source before it informs a decision.",
  },
];
