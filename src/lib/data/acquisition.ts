/** Land acquisition toolkit — sourced from DRB analyst skill, Land Acquisition
 *  Valuation Guide, York County SALDO (2012), and York permit-tracking notes. */

export const SCREENING_CHECKS = [
  {
    id: "acres",
    label: "Acreage meets strategy",
    hint: "Raw land typically ≥ 10 acres; finished-lot deals ≥ 20 lots. York southern I-83 corridor often 20–25 acres.",
  },
  {
    id: "zoning",
    label: "Residential-compatible zoning (or rezoning < 18 months)",
    hint: "Confirm district + use matrix. PA zoning is municipal, not county.",
  },
  {
    id: "flood",
    label: "Flood / wetlands under 20% of site after mitigation",
    hint: "FEMA AE/VE is a fatal-flaw trigger unless a LOMA or engineered fill path exists.",
  },
  {
    id: "utils",
    label: "Water / sewer within 1,000 ft or viable on-lot",
    hint: "Act 537 sewage planning module required if public sewer is not available.",
  },
  {
    id: "road",
    label: "Public road frontage or feasible ROW",
    hint: "PennDOT HOP needed on state routes; municipal driveway permit on local roads.",
  },
  {
    id: "slope",
    label: "Slopes over 15% are limited / engineerable",
    hint: "Steep-slope overlays and SALDO grading standards can kill yield.",
  },
  {
    id: "saldo",
    label: "SALDO path is known (municipal vs county)",
    hint: "York County SALDO (2012) governs only where the municipality has not adopted its own.",
  },
  {
    id: "margin",
    label: "Gross margin on finished product ≥ 20%",
    hint: "Homebuilder threshold. Land residual must still pencil after all-in lot cost.",
  },
] as const;

export const DD_GROUPS = [
  {
    title: "Title & legal",
    items: [
      "Preliminary title / ALTA survey",
      "Deed, chain of title, easements, CC&Rs",
      "Liens, mortgages, tax status",
      "Clean & Green (Act 319) rollback exposure",
      "Ag security / preservation easement",
    ],
  },
  {
    title: "Environmental",
    items: [
      "Phase I ESA (ASTM E1527)",
      "Wetlands delineation / USACE 404",
      "FEMA flood zone + LOMA if challenging",
      "DEP NPDES if > 1 acre disturbance",
      "York County Conservation District E&S",
    ],
  },
  {
    title: "Engineering & utilities",
    items: [
      "Boundary / topo survey",
      "Geotech borings (bearing, rock, groundwater)",
      "Water and sewer availability letters",
      "On-lot SEO if no public sewer",
      "Traffic impact study if SALDO §405 triggers",
    ],
  },
  {
    title: "Entitlement (PA / York)",
    items: [
      "Municipal zoning district + use table",
      "Comprehensive plan / future land use",
      "Sketch → preliminary → final plat path",
      "YCPC review (county SALDO or MPC referral)",
      "Impact fees, Act 167 stormwater, bonds",
    ],
  },
] as const;

export const SALDO_STEPS = [
  {
    id: "preapp",
    title: "Pre-application consultation",
    section: "§ 301",
    body: "Meet municipal staff (and YCPC if county SALDO applies) before drawing a lotting plan. Confirm zoning approvals first (§ 303).",
  },
  {
    id: "sketch",
    title: "Sketch plan",
    section: "§ 302 / § 401",
    body: "Optional but recommended. Tests yield, street layout, and environmental constraints without a formal clock.",
  },
  {
    id: "prelim",
    title: "Preliminary plan",
    section: "§ 305–306 / § 402",
    body: "Full engineering: lots, streets, water, sewer, E&S, stormwater, and a traffic study when required (§ 405). Some small plans are exempt from preliminary (§ 304).",
  },
  {
    id: "final",
    title: "Final plan + recording",
    section: "§ 307–311 / § 406",
    body: "Improvements installed or bonded (§ 607). Record the final plan; resubdivision and revisions have their own tracks (§ 312–313).",
  },
] as const;

export const SALDO_DESIGN = [
  { label: "Flood hazard areas", value: "Special standards in SFHA (§ 502)" },
  { label: "Streets", value: "System, arterial abutting, design, intersections (§ 503–509)" },
  { label: "Access / driveways", value: "Minimum site access + driveway standards (§ 510–511)" },
  { label: "Lots", value: "Lot size and configuration per § 514 and municipal zoning" },
  { label: "Sewage", value: "Public or on-lot with planning module (§ 515)" },
  { label: "Water", value: "Feasibility report on water facilities (§ 403 / § 516)" },
  { label: "MH parks", value: "Separate Article VII if that is the product" },
];

export const YCPC_CONTACT = {
  name: "York County Planning Commission",
  url: "https://www.ycpc.org/",
  phone: "(717) 771-9870",
  email: "ycpc@ycpc.org",
  address: "28 E Market Street, 3rd Floor, York, PA 17401",
  director: "Mike Pritchard",
  note: "YCPC does not issue building permits. Zoning and UCC permits are municipal. County SALDO applies only where a municipality has not adopted its own.",
};

export const PERMIT_PATHS = [
  {
    title: "Identify the municipality first",
    body: "York County has 72 municipalities (35 townships, 36 boroughs, 1 city). A “York, PA” mailing address is often Springettsbury, West Manchester, or York Township — not the City.",
  },
  {
    title: "Parcel ID, then local BCO",
    body: "Use the YCPC Property Viewer + Assessment (iasWorld) for PIN / PIDN and owner. Then track the permit at that municipality’s portal, third-party agency (CCIS / MDIA), or in-house BCO.",
  },
  {
    title: "Do not use York County, VA tools",
    body: "Web search often surfaces Virginia’s countywide permit dashboard. York County, PA has no live countywide residential permit clearinghouse.",
  },
];

export const HBU_QUESTIONS = [
  {
    n: 1,
    q: "What is the highest and best use?",
    a: "Legal possibility + physical capability + market demand. Zoning district and SALDO yield come first.",
  },
  {
    n: 2,
    q: "Who is the end buyer?",
    a: "Farmer, timber buyer, hunter, homebuilder, or MH operator — each uses a different valuation language.",
  },
  {
    n: 3,
    q: "How does that buyer price it?",
    a: "Income cap (farm), cruise + DCF (timber), comps (recreational), residual land value (development).",
  },
  {
    n: 4,
    q: "What physical factors help or hurt?",
    a: "Soils, flood, slope, frontage, utilities, shape, Clean & Green, ag preservation.",
  },
] as const;

export const LOT_TO_BASE = 0.22;
export const TARGET_MARGIN = 0.2;
export const DEFAULT_ROW = 0.2;
export const DEFAULT_OPEN = 0.1;
export const DEFAULT_UNDEV = 0.05;
export const DEFAULT_STORM = 0.05;
