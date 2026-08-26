import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findDistrict, prettyMuni, type YorkZoningDistrict } from "@/lib/data/york-zoning";
import { authMiddleware } from "@/lib/auth/middleware";
import { requirePro } from "@/lib/entitlement.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

const CENSUS = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const PARCELS = "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Parcels/FeatureServer/0/query";
const ZONING = "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Zoning/MapServer/0/query";

export type YorkLookup = {
  matchedAddress: string;
  lat: number;
  lng: number;
  parcel: {
    pidn: string | null;
    address: string | null;
    owner: string | null;
    acres: number | null;
    class: string | null;
    school: string | null;
    landUse: string | null;
  } | null;
  zoning: {
    municipality: string | null;
    municipalityPretty: string | null;
    zcode: string | null;
    zname: string | null;
    ztype: string | null;
    gcode: string | null;
    gname: string | null;
    join: string | null;
  } | null;
  district: YorkZoningDistrict | null;
};

async function jsonOrNull(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function attrs(json: Record<string, unknown> | null): Record<string, unknown> | null {
  const features = json?.features as Array<{ attributes?: Record<string, unknown> }> | undefined;
  return features?.[0]?.attributes ?? null;
}

function pointGeom(lng: number, lat: number) {
  return encodeURIComponent(
    JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
  );
}

export const lookupYorkAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ q: z.string().min(4).max(160) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ ok: true; result: YorkLookup } | { ok: false; error: string }> => {
    await requirePro();
    await consumeRateLimit({
      action: "parcel-lookup",
      subject: context.userId,
      max: 120,
      windowSeconds: 60,
    });
    const q = data.q.trim();
    const withState = /,\s*PA\b/i.test(q) || /\bPennsylvania\b/i.test(q) ? q : `${q}, PA`;
    const geoUrl = `${CENSUS}?address=${encodeURIComponent(withState)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
    const geo = await jsonOrNull(geoUrl);
    const matches = (geo as { result?: { addressMatches?: Array<{
      matchedAddress?: string;
      coordinates?: { x: number; y: number };
      addressComponents?: { city?: string; state?: string };
    }> } })?.result?.addressMatches;
    const match = matches?.[0];
    if (!match?.coordinates) {
      return { ok: false, error: "No Census match. Try a full street address in York County, PA." };
    }
    const city = (match.addressComponents?.city ?? "").toUpperCase();
    const state = (match.addressComponents?.state ?? "").toUpperCase();
    if (state && state !== "PA") {
      return { ok: false, error: "That address is outside Pennsylvania." };
    }

    const lat = match.coordinates.y;
    const lng = match.coordinates.x;
    const geom = pointGeom(lng, lat);
    const parcelUrl = `${PARCELS}?geometry=${geom}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=PIDN,PROPADR,OWNER_FULL,ACRES,CLASS,SCHOOL_DIS,LUC,DISTRICT&returnGeometry=false&f=json`;
    const zoningUrl = `${ZONING}?geometry=${geom}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=MUNI_NAME,DISTRICT,ZCODE,ZNAME,ZTYPE,GEN_ZCODE,GEN_ZNAME,JOIN_FIELD&returnGeometry=false&f=json`;
    const [parcelJson, zoningJson] = await Promise.all([jsonOrNull(parcelUrl), jsonOrNull(zoningUrl)]);
    const parcel = attrs(parcelJson);
    const zoning = attrs(zoningJson);
    if (!parcel && !zoning) {
      return {
        ok: false,
        error: city
          ? `Geocoded to ${match.matchedAddress}, but YCPC has no parcel/zoning at that point. Confirm it is inside York County.`
          : "No York County parcel or zoning at that point.",
      };
    }

    const muni = zoning ? String(zoning.MUNI_NAME ?? "") : "";
    const zcode = zoning ? String(zoning.ZCODE ?? "") : "";
    const join = zoning ? String(zoning.JOIN_FIELD ?? "") : "";
    const district = findDistrict(muni, zcode, join);

    const result: YorkLookup = {
      matchedAddress: match.matchedAddress ?? withState,
      lat,
      lng,
      parcel: parcel
        ? {
            pidn: parcel.PIDN != null ? String(parcel.PIDN) : null,
            address: parcel.PROPADR != null ? String(parcel.PROPADR) : null,
            owner: parcel.OWNER_FULL != null ? String(parcel.OWNER_FULL) : null,
            acres: parcel.ACRES != null ? Number(parcel.ACRES) : null,
            class: parcel.CLASS != null ? String(parcel.CLASS) : null,
            school: parcel.SCHOOL_DIS != null ? String(parcel.SCHOOL_DIS) : null,
            landUse: parcel.LUC != null ? String(parcel.LUC) : null,
          }
        : null,
      zoning: zoning
        ? {
            municipality: muni || null,
            municipalityPretty: muni ? prettyMuni(muni) : null,
            zcode: zcode || null,
            zname: zoning.ZNAME != null ? String(zoning.ZNAME) : null,
            ztype: zoning.ZTYPE != null ? String(zoning.ZTYPE) : null,
            gcode: zoning.GEN_ZCODE != null ? String(zoning.GEN_ZCODE) : null,
            gname: zoning.GEN_ZNAME != null ? String(zoning.GEN_ZNAME) : null,
            join: join || null,
          }
        : null,
      district,
    };
    return { ok: true, result };
  });
