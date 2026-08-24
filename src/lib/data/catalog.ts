import type {
  AlertItem,
  MeetingRecord,
  Project,
  TeamComment,
  TeamMember,
} from "@/lib/types";

export { DOCUMENTS } from "@/lib/data/documents";

export const SEED_PROJECTS: Project[] = [
  {
    id: "prj-market",
    name: "Market St Development",
    county: "Cumberland",
    municipality: "Camp Hill Borough",
    status: "Lead",
    parcelIds: ["p-1042", "p-1048", "p-1102"],
    acres: 2.04,
    modified: "Oct 24",
    constraints: [],
  },
  {
    id: "prj-camphill",
    name: "Camp Hill Mixed-Use",
    county: "Cumberland",
    municipality: "Camp Hill Borough",
    status: "Permitting",
    parcelIds: ["p-1042"],
    acres: 1.24,
    modified: "Sep 15",
    constraints: [],
  },
  {
    id: "prj-york",
    name: "York Logistics Hub",
    county: "York",
    municipality: "West Manchester Township",
    status: "Due Diligence",
    parcelIds: ["p-york-log-1", "p-york-log-2"],
    acres: 50.5,
    modified: "Aug 02",
    constraints: ["Flood Zone"],
  },
  {
    id: "prj-hershey",
    name: "Chocolate Ave Infill",
    county: "Dauphin",
    municipality: "Derry Township",
    status: "Lead",
    parcelIds: ["p-hershey"],
    acres: 2.1,
    modified: "Oct 08",
    constraints: [],
  },
  {
    id: "prj-queen",
    name: "Queen Street TOD",
    county: "Lancaster",
    municipality: "Lancaster City",
    status: "Approved",
    parcelIds: ["p-lanc-city"],
    acres: 0.12,
    modified: "Jul 22",
    constraints: ["Historic District"],
  },
];

export const MEETINGS: MeetingRecord[] = [
  {
    id: "m1",
    date: "2024-10-12",
    municipality: "Harrisburg City",
    county: "Dauphin",
    body: "City Council",
    status: "Approved",
    summary:
      "Council approved Resolution 42-2023 amending the commercial zoning overlay in the downtown corridor. Preliminary discussions held regarding the upcoming Market St. infrastructure improvement bond.",
    tags: ["Zoning Amendment", "Infrastructure"],
  },
  {
    id: "m2",
    date: "2024-10-10",
    municipality: "Camp Hill Borough",
    county: "Cumberland",
    body: "Planning Commission",
    status: "Approved",
    summary:
      "Review of land development plan for the proposed mixed-use facility on Market Street. Commissioners requested revised traffic impact studies before final approval recommendation.",
    tags: ["Land Development", "Study Required"],
  },
  {
    id: "m3",
    date: "2024-10-08",
    municipality: "West Manchester Township",
    county: "York",
    body: "Zoning Hearing Board",
    status: "Approved",
    summary:
      "Granted variance for setback requirements on the industrial park expansion project (Case #23-014). Scheduled next month's public hearing for the agricultural preservation ordinance.",
    tags: ["Variance Granted", "Public Hearing Set"],
  },
  {
    id: "m4",
    date: "2024-09-28",
    municipality: "Harrisburg City",
    county: "Dauphin",
    body: "City Council",
    status: "Approved",
    summary: "Adopted FY2025 capital budget including riverfront trail connections.",
    tags: ["Budget"],
  },
  {
    id: "m5",
    date: "2024-09-25",
    municipality: "York City",
    county: "York",
    body: "Planning Commission",
    status: "Draft",
    summary: "Sketch plan for 340 N George Street mixed-use infill. Parking reduction discussed.",
    tags: ["Sketch Plan"],
  },
  {
    id: "m6",
    date: "2024-09-21",
    municipality: "Derry Township",
    county: "Dauphin",
    body: "Zoning Hearing Board",
    status: "Approved",
    summary: "Special exception for hotel use on Chocolate Avenue corridor granted with conditions.",
    tags: ["Special Exception"],
  },
  {
    id: "m7",
    date: "2024-09-14",
    municipality: "Camp Hill Borough",
    county: "Cumberland",
    body: "City Council",
    status: "Approved",
    summary: "Authorized SALDO amendment for mixed-use lot coverage in the C-2 district.",
    tags: ["SALDO"],
  },
  {
    id: "m8",
    date: "2024-09-10",
    municipality: "Lancaster City",
    county: "Lancaster",
    body: "Planning Commission",
    status: "Approved",
    summary: "TOD overlay design standards forwarded to Council with a recommendation of approval.",
    tags: ["TOD"],
  },
];

export const TEAM: TeamMember[] = [
  {
    id: "t1",
    name: "Sarah Jenkins",
    email: "s.jenkins@county.gov",
    role: "Admin",
    status: "Active",
  },
  {
    id: "t2",
    name: "Marcus Reed",
    email: "m.reed@county.gov",
    role: "Editor",
    status: "Active",
  },
  {
    id: "t3",
    name: "Elena Patel",
    email: "e.patel@state.pa.us",
    role: "Viewer",
    status: "Pending",
  },
];

export const SEED_COMMENTS: TeamComment[] = [
  {
    id: "c1",
    parcelId: "p-1042",
    author: "Sarah Jenkins",
    initials: "SJ",
    body: "Verified the setback requirements with the borough planner. The 25 ft front setback is correct for this C-2 sub-district.",
    at: "2h ago",
  },
  {
    id: "c2",
    parcelId: "p-1042",
    author: "Marcus Chen",
    initials: "MC",
    body: "Does the environmental buffer account for the small stream on the eastern boundary?",
    at: "5h ago",
  },
  {
    id: "c3",
    parcelId: "p-york-log-1",
    author: "Marcus Reed",
    initials: "MR",
    body: "Setback requirements here look inconsistent with the 2021 municipal variance. Flagging for ZHB file #23-014.",
    at: "2 hrs ago",
  },
];

export const SEED_ALERTS: AlertItem[] = [
  {
    id: "a1",
    kind: "zoning",
    title: "Parcel 44-A3 Rezoned to C-2",
    body: "York County has approved a rezoning request for parcel 44-A3 from R-1 (Residential) to C-2 (Commercial). Effective immediately.",
    at: "2 hours ago",
    unread: true,
  },
  {
    id: "a2",
    kind: "document",
    title: "2024 Regional Transportation Plan",
    body: "The final draft of the 2024 regional transportation plan for Cumberland County is now available in the document library.",
    at: "Yesterday, 4:30 PM",
    unread: true,
  },
  {
    id: "a3",
    kind: "ordinance",
    title: "Industrial Setback Requirements Adjusted",
    body: "Dauphin County has updated setback requirements for all newly zoned industrial areas abutting residential zones.",
    at: "Oct 12, 2024",
    unread: false,
  },
  {
    id: "a4",
    kind: "system",
    title: "GIS Layer Sync Completed",
    body: "Monthly synchronization of Lancaster County municipal parcel boundaries has been completed successfully.",
    at: "Oct 10, 2024",
    unread: false,
  },
];

export const PRICE_SERIES = [
  { month: "Jan", York: 78, Cumberland: 82, Dauphin: 74, Lancaster: 88 },
  { month: "Feb", York: 79, Cumberland: 83, Dauphin: 75, Lancaster: 89 },
  { month: "Mar", York: 80, Cumberland: 84, Dauphin: 76, Lancaster: 90 },
  { month: "Apr", York: 81, Cumberland: 85, Dauphin: 78, Lancaster: 91 },
  { month: "May", York: 82, Cumberland: 86, Dauphin: 79, Lancaster: 92 },
  { month: "Jun", York: 83, Cumberland: 87, Dauphin: 80, Lancaster: 93 },
  { month: "Jul", York: 84, Cumberland: 86, Dauphin: 81, Lancaster: 94 },
  { month: "Aug", York: 85, Cumberland: 88, Dauphin: 82, Lancaster: 95 },
  { month: "Sep", York: 84, Cumberland: 89, Dauphin: 83, Lancaster: 96 },
  { month: "Oct", York: 86, Cumberland: 90, Dauphin: 84, Lancaster: 97 },
  { month: "Nov", York: 87, Cumberland: 91, Dauphin: 85, Lancaster: 98 },
  { month: "Dec", York: 88, Cumberland: 92, Dauphin: 86, Lancaster: 99 },
];

export const PERMIT_VOLUME = [
  { county: "York", issued: 425, pending: 225 },
  { county: "Cumberland", issued: 325, pending: 140 },
  { county: "Dauphin", issued: 280, pending: 160 },
  { county: "Lancaster", issued: 218, pending: 95 },
];

export const RENO_2026 = [
  { item: "Interior demolition", unit: "sf", low: 4.5, high: 8.25 },
  { item: "New residential construction (stick)", unit: "sf", low: 185, high: 245 },
  { item: "Commercial shell (tilt / masonry)", unit: "sf", low: 155, high: 210 },
  { item: "Site work & grading", unit: "acre", low: 18000, high: 42000 },
  { item: "Public water/sewer lateral", unit: "lf", low: 95, high: 160 },
  { item: "Asphalt parking", unit: "sf", low: 6.5, high: 11 },
  { item: "Stormwater BMP (surface)", unit: "sf treatment", low: 8, high: 18 },
  { item: "Townhouse vertical (finished)", unit: "sf", low: 155, high: 205 },
];

export const COUNTIES = ["York", "Cumberland", "Dauphin", "Lancaster"] as const;

export const COUNTY_LINKS: Record<(typeof COUNTIES)[number], string> = {
  York: "https://www.ycpc.org/",
  Cumberland: "https://www.cumberlandcountypa.gov/120/Planning-Department",
  Dauphin: "https://www.tcrpc-pa.org/dcpc-about",
  Lancaster: "https://lancastercountyplanning.org/",
};
