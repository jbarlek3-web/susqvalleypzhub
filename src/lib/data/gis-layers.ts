import type { County } from "@/lib/types";

export type LatLngBoundsLike = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type ParcelService = {
  county: County;
  title: string;
  source: string;
  url: string;
  fields: string;
  maxRecords: number;
  extent: LatLngBoundsLike;
  popup: (props: Record<string, string | number | null>) => string;
};

const amp = "\u0026";

export function esc(value: unknown) {
  return String(value ?? "\u2014")
    .replaceAll("&", `${amp}amp;`)
    .replaceAll("<", `${amp}lt;`)
    .replaceAll(">", `${amp}gt;`)
    .replaceAll('"', `${amp}quot;`);
}

function money(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
  return esc(value);
}

function acres(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(3);
  const n = Number(value);
  if (Number.isFinite(n)) return n.toFixed(3);
  return esc(value);
}

export const PARCEL_MIN_ZOOM = 15;

export const PARCEL_SERVICES: ParcelService[] = [
  {
    county: "York",
    title: "York County Parcel",
    source: "York County Planning Commission",
    url: "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Parcels/FeatureServer/0",
    fields: "PIDN,PROPADR,OWNER_FULL,ACRES,DISTRICT,CLASS,SCHOOL_DIS,APRTOTAL",
    maxRecords: 1500,
    extent: { west: -77.15, south: 39.71, east: -76.22, north: 40.23 },
    popup: (p) => `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">York County Parcel</div>
        <div class="font-semibold">${esc(p.PROPADR)}</div>
        <div class="text-xs">PIDN ${esc(p.PIDN)}</div>
        <div class="mt-1 text-xs">${esc(p.OWNER_FULL)}</div>
        <div class="mt-1 text-xs">${acres(p.ACRES)} ac · Class ${esc(p.CLASS)} · Dist ${esc(p.DISTRICT)}</div>
        <div class="text-xs">Appraised ${money(p.APRTOTAL)}</div>
      </div>`,
  },
  {
    county: "Dauphin",
    title: "Dauphin County Parcel",
    source: "Dauphin County GIS",
    url: "https://services2.arcgis.com/EEtiX55QzkHKYQKY/arcgis/rest/services/DC_Parcels/FeatureServer/0",
    fields: "PID,MUNICIPALI,house_numb,street_nam,street_suf,last_name,first_name,acres,land,building,cleangrn",
    maxRecords: 1500,
    extent: { west: -77.04, south: 40.11, east: -76.52, north: 40.67 },
    popup: (p) => {
      const addr = [p.house_numb, p.street_nam, p.street_suf].filter(Boolean).join(" ");
      const owner = [p.first_name, p.last_name].filter(Boolean).join(" ");
      return `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">Dauphin County Parcel</div>
        <div class="font-semibold">${esc(addr || p.PID)}</div>
        <div class="text-xs">PID ${esc(p.PID)} · ${esc(p.MUNICIPALI)}</div>
        <div class="mt-1 text-xs">${esc(owner)}</div>
        <div class="mt-1 text-xs">${acres(p.acres)} ac${p.cleangrn === "Y" ? " · Clean and Green" : ""}</div>
        <div class="text-xs">Land ${money(p.land)} · Bldg ${money(p.building)}</div>
      </div>`;
    },
  },
  {
    county: "Cumberland",
    title: "Cumberland County Parcel",
    source: "Cumberland County GIS / PASDA",
    url: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/CumberlandCounty/MapServer/4",
    fields: "PID,SCHOOL_DIS,TOTALTAX,COUNTYTAX,MUNICIPALT,SCHOOLTAX,SITUS_ZIP,VISION_URL",
    maxRecords: 1000,
    extent: { west: -77.48, south: 39.98, east: -76.93, north: 40.38 },
    popup: (p) => `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">Cumberland County Parcel</div>
        <div class="font-semibold">PID ${esc(p.PID)}</div>
        <div class="text-xs">School ${esc(p.SCHOOL_DIS)} · ZIP ${esc(p.SITUS_ZIP)}</div>
        <div class="mt-1 text-xs">Total tax ${money(p.TOTALTAX)}</div>
        ${p.VISION_URL ? `<div class="mt-1 text-xs"><a href="${esc(p.VISION_URL)}" target="_blank" rel="noreferrer">Assessment record</a></div>` : ""}
      </div>`,
  },
  {
    county: "Lancaster",
    title: "Lancaster County Parcel",
    source: "Lancaster County GIS / PASDA",
    url: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/LancasterCounty/MapServer/21",
    fields: "ACCOUNT",
    maxRecords: 1000,
    extent: { west: -76.61, south: 39.71, east: -75.87, north: 40.26 },
    popup: (p) => `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">Lancaster County Parcel</div>
        <div class="font-semibold">Account ${esc(p.ACCOUNT)}</div>
        <div class="text-xs">Lancaster County tax parcel boundary</div>
      </div>`,
  },
];

export const MUNICIPALITIES = {
  title: "PA Municipality Boundaries",
  source: "PennDOT / PASDA",
  url:
    "https://mapservices.pasda.psu.edu/server/rest/services/pasda/PennDOT/MapServer/10/query?" +
    new URLSearchParams({
      where: "FIPS_COUNT in('133','041','043','071')",
      outFields: "MUNICIPAL1,CLASS_OF_M,COUNTY_NAM,FIPS_COUNT",
      returnGeometry: "true",
      outSR: "4326",
      maxAllowableOffset: "0.0004",
      resultRecordCount: "1000",
      f: "geojson",
    }).toString(),
  fipsCounty: {
    "041": "Cumberland",
    "043": "Dauphin",
    "071": "Lancaster",
    "133": "York",
  } as Record<string, County>,
};

export const HYDRO = {
  title: "NHD Hydrography",
  source: "USGS National Hydrography Dataset",
  serviceUrl: "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer",
  layerIds: [6, 9, 12],
  minZoom: 10,
};

export const SOILS = {
  title: "PA Soils (SSURGO)",
  source: "USDA NRCS / PASDA",
  serviceUrl: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/Soils_PA/MapServer",
  layerIds: [0],
  minZoom: 12,
};

export const USGS_TOPO = {
  title: "USGS US Topo",
  source: "USGS National Map",
  url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
  maxNativeZoom: 16,
};

export const YORK_PASDA = {
  title: "York County PASDA overlays",
  source: "PASDA / York County",
  serviceUrl: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/YorkCounty/MapServer",
  // streams, ag security, easements, municipal, parks, soils, zoning, lakes
  layerIds: [16, 21, 22, 30, 32, 33, 36, 41],
  minZoom: 11,
};

export function boundsOverlap(a: LatLngBoundsLike, b: LatLngBoundsLike) {
  return a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south;
}

export function esriQueryUrl(
  layerUrl: string,
  bounds: LatLngBoundsLike,
  zoom: number,
  fields: string,
  maxRecords: number,
) {
  const offset = Math.max(0, (18 - zoom) * 0.00002);
  const params = new URLSearchParams({
    where: "1=1",
    geometry: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: fields,
    returnGeometry: "true",
    outSR: "4326",
    maxAllowableOffset: String(offset),
    resultRecordCount: String(maxRecords),
    f: "geojson",
  });
  return `${layerUrl}/query?${params.toString()}`;
}

export function esriExportUrl(
  serviceUrl: string,
  bounds3857: { xmin: number; ymin: number; xmax: number; ymax: number },
  size: { w: number; h: number },
  layerIds: number[],
) {
  const params = new URLSearchParams({
    bbox: `${bounds3857.xmin},${bounds3857.ymin},${bounds3857.xmax},${bounds3857.ymax}`,
    bboxSR: "3857",
    imageSR: "3857",
    size: `${size.w},${size.h}`,
    dpi: "96",
    format: "png32",
    transparent: "true",
    layers: `show:${layerIds.join(",")}`,
    f: "image",
  });
  return `${serviceUrl}/export?${params.toString()}`;
}
