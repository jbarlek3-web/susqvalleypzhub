export const YORK_PARCELS = {
  title: "York County Parcel Boundaries",
  source: "York County Planning Commission",
  itemId: "803b4da39e7b457ab6e7a5eeb3410abb",
  layerUrl:
    "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Parcels/FeatureServer/0",
  hubUrl:
    "https://york-county-pa-gis-portal-yorkcountypa.hub.arcgis.com/datasets/803b4da39e7b457ab6e7a5eeb3410abb_0/explore",
  minZoom: 15,
  fields: "PIDN,PROPADR,OWNER_FULL,ACRES,DISTRICT,CLASS,SCHOOL_DIS,APRTOTAL",
} as const;

export function yorkParcelsQueryUrl(bounds: {
  west: number;
  south: number;
  east: number;
  north: number;
}, zoom: number) {
  const offset = Math.max(0, (18 - zoom) * 0.00002);
  const params = new URLSearchParams({
    where: "1=1",
    geometry: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: YORK_PARCELS.fields,
    returnGeometry: "true",
    outSR: "4326",
    maxAllowableOffset: String(offset),
    resultRecordCount: "1500",
    f: "geojson",
  });
  return `${YORK_PARCELS.layerUrl}/query?${params.toString()}`;
}
