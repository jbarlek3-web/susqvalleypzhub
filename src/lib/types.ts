export type County = "York" | "Cumberland" | "Dauphin" | "Lancaster";

export type ZoneCode =
  | "C-1"
  | "C-2"
  | "R-1"
  | "R-2"
  | "I-1"
  | "I-2"
  | "A-1"
  | "MU"
  | "TOD";

export type ProjectStatus = "Lead" | "Due Diligence" | "Permitting" | "Approved";

export type FloodZone = "X" | "X500" | "AE" | "A" | "VE";

export type LayerId =
  | "zoning"
  | "flood"
  | "femaFlood"
  | "slopes"
  | "footprints"
  | "yorkParcels"
  | "yorkZoning"
  | "parcels"
  | "municipalities"
  | "hydro"
  | "soils"
  | "topo"
  | "yorkPasda"
  | "traffic"
  | "improvements"
  | "sewer"
  | "water"
  | "setbacks"
  | "inundation"
  | "ev"
  | "buggy"
  | "logistics"
  | "bridges";

export type Parcel = {
  id: string;
  apn: string;
  address: string;
  municipality: string;
  county: County;
  lat: number;
  lng: number;
  polygon: [number, number][];
  acres: number;
  sqft: number;
  zoning: ZoneCode;
  zoningName: string;
  zoningSummary: string;
  assessed: number;
  taxYear: number;
  owner: string;
  setbacks: { front: number; side: number; rear: number };
  maxHeight: number;
  maxCoverage: number;
  permittedUses: string[];
  footprintSf: number;
  lotCoveragePct: number;
  buildableSf: number;
  rowDedicationSf: number;
  envBufferSf: number;
  setbackSf: number;
  flood: Record<0 | 1 | 3 | 5, FloodZone>;
  slopePct: number;
  historic: boolean;
  utilities: {
    water: string;
    sewer: string;
    electric: string;
    gas: string;
  };
  aadt: number;
  roiPct: number;
  densityUa: number;
  potential: "High" | "Med" | "Low";
  constraints: string[];
  transfers: { date: string; party: string; price: number }[];
  docs: { title: string; kind: string }[];
};

export type Project = {
  id: string;
  name: string;
  county: County | "Multi";
  municipality: string;
  status: ProjectStatus;
  parcelIds: string[];
  acres: number;
  modified: string;
  constraints: string[];
};

export type PlanningDoc = {
  id: string;
  name: string;
  kind: "PDF" | "DOCX" | "XLSX" | "WEB";
  size: string;
  municipality: string;
  county: string;
  category: "Zoning" | "SALDO" | "Builder" | "Codes";
  updated: string;
  url: string;
  source: "drive" | "official";
  /** The official page hosts or describes the record but is not the file itself. */
  linkType?: "source-page";
};

export type CountyPlanningContact = {
  county: string;
  departmentName: string;
  departmentUrl: string;
};

export type CountyZoningSourceLinks = {
  county: string;
  municipalityListSourceUrl: string;
  zoningStatusSourceUrl: string;
  countySourceUrl: string;
};

export type MeetingRecord = {
  id: string;
  date: string;
  municipality: string;
  county: County;
  body: "City Council" | "Planning Commission" | "Zoning Hearing Board";
  status: "Approved" | "Draft";
  summary: string;
  tags: string[];
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Pending";
};

export type TeamComment = {
  id: string;
  parcelId: string;
  author: string;
  initials: string;
  body: string;
  at: string;
};

export type AlertItem = {
  id: string;
  kind: "zoning" | "document" | "ordinance" | "system" | "diligence";
  title: string;
  body: string;
  at: string;
  unread: boolean;
  county?: County;
  municipality?: string;
  /** Human-readable provenance for the source record. */
  source: string;
  /** Direct source record when the catalog has retained one. */
  actionUrl?: string;
  actionLabel: string;
  priority: "action" | "watch" | "info";
};

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  org: string;
};
