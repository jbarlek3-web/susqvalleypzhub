import districts from "@/lib/data/york-zoning-districts.json";

export type YorkZoningDistrict = {
  muni: string;
  district: string;
  zcode: string;
  zname: string;
  ztype: string;
  gcode: string;
  gname: string;
  join: string;
  color: string;
  front: number | null;
  side: number | null;
  lot: number | null;
  height: number | null;
  cov: number | null;
  useAg: boolean | null;
  useSf: boolean | null;
  use2f: boolean | null;
  useMf: boolean | null;
  useRet: boolean | null;
  useInd: boolean | null;
  useOth: boolean | null;
};

export const YORK_ZONING_DISTRICTS = districts as YorkZoningDistrict[];

export const YORK_ZONING = {
  title: "York County Zoning Districts",
  source: "York County Planning Commission",
  layerUrl: "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Zoning/FeatureServer/0",
  mapUrl: "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Zoning/MapServer/0",
  pasdaUrl:
    "https://mapservices.pasda.psu.edu/server/rest/services/pasda/YorkCounty/MapServer/36",
  hubUrl: "https://york-county-pa-gis-portal-yorkcountypa.hub.arcgis.com/",
  minZoom: 12,
  fields: "MUNI_NAME,DISTRICT,ZCODE,ZNAME,ZTYPE,GEN_ZCODE,GEN_ZNAME,JOIN_FIELD,HTML_COLOR",
} as const;

export const GEN_ZONE_COLORS: Record<string, string> = {
  LDR: "#3e7e00",
  MDR: "#ff7e00",
  HDR: "#c62828",
  HC: "#7e001e",
  NC: "#c62828",
  I: "#6a1b9a",
  MU: "#007eff",
  RP: "#018100",
  "Cv/OS": "#2e7d32",
  R: "#7cb342",
};

export function prettyMuni(name: string) {
  return name
    .replace(/\bTWP\b/gi, "Township")
    .replace(/\bBORO\b/gi, "Borough")
    .replace(/\bCITY\b/gi, "City")
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export function dimLabel(value: number | null | undefined, unit: string) {
  if (value == null || value === 0) return "See ordinance";
  if (unit === "sf") return `${Math.round(value).toLocaleString()} sf`;
  if (unit === "ac") return `${(value / 43560).toFixed(2)} ac`;
  if (unit === "%") return `${value}%`;
  return `${value} ${unit}`;
}

export function useFlags(d: YorkZoningDistrict) {
  const items: { label: string; ok: boolean | null }[] = [
    { label: "Ag", ok: d.useAg },
    { label: "Single-family", ok: d.useSf },
    { label: "Two-family", ok: d.use2f },
    { label: "Multifamily", ok: d.useMf },
    { label: "Retail", ok: d.useRet },
    { label: "Industrial", ok: d.useInd },
    { label: "Other", ok: d.useOth },
  ];
  return items;
}

export const YORK_MUNICIPALITIES = Array.from(
  new Set(YORK_ZONING_DISTRICTS.map((d) => d.muni)),
).sort();

const byJoin = new Map(YORK_ZONING_DISTRICTS.map((d) => [d.join, d]));
const byMuniCode = new Map(YORK_ZONING_DISTRICTS.map((d) => [`${d.muni}|${d.zcode}`, d]));

export function findDistrict(muni?: string | null, zcode?: string | null, join?: string | null) {
  if (join && byJoin.has(join)) return byJoin.get(join)!;
  if (muni && zcode) {
    const hit = byMuniCode.get(`${muni}|${zcode}`);
    if (hit) return hit;
  }
  return null;
}

export function yorkZoningQueryUrl(
  bounds: { west: number; south: number; east: number; north: number },
  zoom: number,
) {
  const offset = Math.max(0, (16 - zoom) * 0.00004);
  const params = new URLSearchParams({
    where: "1=1",
    geometry: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: YORK_ZONING.fields,
    returnGeometry: "true",
    outSR: "4326",
    maxAllowableOffset: String(offset),
    resultRecordCount: "1200",
    f: "geojson",
  });
  return `${YORK_ZONING.layerUrl}/query?${params.toString()}`;
}

export function zoneFill(props: Record<string, string | number | null>) {
  const html = String(props.HTML_COLOR ?? "");
  if (html.startsWith("#") && (html.length === 7 || html.length === 9)) return html.slice(0, 7);
  const g = String(props.GEN_ZCODE ?? "");
  return GEN_ZONE_COLORS[g] ?? "#466649";
}
