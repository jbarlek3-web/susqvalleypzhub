import { PARCELS, getParcel } from "../data/parcels.ts";
import type { County, Parcel } from "../types.ts";
import type { SubdivisionConfig } from "./types.ts";

export interface ResolvedLocationProfile {
  parcel: Parcel | null;
  subdivision: SubdivisionConfig;
}

export function parcelToSubdivisionConfig(p: Parcel): SubdivisionConfig {
  const grossAcres = Math.max(1.5, p.acres || 8.5);
  // Lot yield based on zoning density or standard suburban calculation
  const density = p.densityUa > 0 ? p.densityUa : 3.5;
  const rawLots = Math.max(6, Math.floor(grossAcres * 0.72 * density));
  const totalLots = Math.min(48, rawLots);

  // Stormwater retention pond sizing per PA DEP Chapter 102 & PA BMP manual
  // Typically 10-15% of developed parcel area
  const pondAcreage = Number(Math.max(0.4, grossAcres * 0.11).toFixed(2));
  const pondRadiusFt = Math.round(Math.sqrt((pondAcreage * 43560) / Math.PI));

  // Open space buffer
  const openSpaceAcreage = Number(Math.max(0.5, grossAcres * 0.18).toFixed(2));

  // Road length calculation: ~60-80 linear feet per single-family lot with cul-de-sac
  const roadLengthLinearFt = Math.round(Math.max(450, totalLots * 72));

  // Karst limestone hazard assessment: High in Cumberland Valley and Lancaster limestone plains
  let karstRisk: "Low" | "Moderate" | "High" = "Low";
  if (p.county === "Cumberland" || p.county === "Lancaster") {
    karstRisk = p.slopePct < 6 ? "High" : "Moderate";
  } else if (p.county === "York" && p.municipality.includes("Spring")) {
    karstRisk = "Moderate";
  }

  // Flood zone from parcel flood map
  let floodZone: "X" | "X500" | "AE" = "X";
  if (p.flood) {
    if (p.flood[0] === "AE" || p.flood[1] === "AE" || p.flood[3] === "AE" || p.flood[5] === "AE") {
      floodZone = "AE";
    } else if (p.flood[0] === "X500" || p.flood[3] === "X500" || p.flood[5] === "X500") {
      floodZone = "X500";
    }
  }

  return {
    id: p.id,
    name: `${p.municipality} Preserve · ${p.address}`,
    parcelId: p.apn,
    address: p.address,
    municipality: p.municipality,
    county: p.county,
    grossAcres,
    zoningCode: p.zoning,
    zoningName: p.zoningName,
    maxZoningHeight: p.maxHeight || 35,
    maxLotCoverage: p.maxCoverage || 35,
    setbacks: {
      front: p.setbacks.front || 25,
      side: p.setbacks.side || 10,
      rear: p.setbacks.rear || 25,
    },
    totalLots,
    pondRadiusFt,
    pondAcreage,
    openSpaceAcreage,
    roadLengthLinearFt,
    slopePct: p.slopePct || 4,
    floodZone,
    karstRisk,
    utilities: {
      water: p.utilities.water,
      sewer: p.utilities.sewer,
      electric: p.utilities.electric,
      gas: p.utilities.gas,
    },
  };
}

export function createCustomSubdivision(
  address: string,
  county: County,
  municipality: string,
  grossAcres = 14.5
): SubdivisionConfig {
  const zoningCode = "R-1";
  const zoningName = "Low-to-Medium Density Residential (SALDO Compliant)";
  const totalLots = Math.max(8, Math.round(grossAcres * 2.8));
  const pondAcreage = Number((grossAcres * 0.12).toFixed(2));
  const pondRadiusFt = Math.round(Math.sqrt((pondAcreage * 43560) / Math.PI));
  const openSpaceAcreage = Number((grossAcres * 0.2).toFixed(2));
  const roadLengthLinearFt = Math.round(totalLots * 75);

  const karstRisk = county === "Cumberland" || county === "Lancaster" ? "High" : "Low";

  return {
    id: `custom-${Date.now()}`,
    name: `${municipality} Master Planned Community`,
    parcelId: `CUSTOM-PA-${Math.floor(100000 + Math.random() * 900000)}`,
    address: address.trim() || `Subdivision Parcel, ${municipality}, ${county} County, PA`,
    municipality,
    county,
    grossAcres,
    zoningCode,
    zoningName,
    maxZoningHeight: 35,
    maxLotCoverage: 35,
    setbacks: {
      front: 25,
      side: 10,
      rear: 25,
    },
    totalLots,
    pondRadiusFt,
    pondAcreage,
    openSpaceAcreage,
    roadLengthLinearFt,
    slopePct: 5,
    floodZone: "X",
    karstRisk,
    utilities: {
      water: "Public 8\" municipal main connection",
      sewer: "Gravity sanitary sewer extension",
      electric: county === "York" ? "Met-Ed 3-phase underground" : "PPL Electric underground",
      gas: "UGI Utilities natural gas main",
    },
  };
}

export function getAllAvailableParcels(): Parcel[] {
  return PARCELS;
}

export function resolveAddressOrParcel(idOrAddress: string): ResolvedLocationProfile {
  // Security: Sanitize input, remove control chars/HTML tags, cap length
  const sanitizedInput = Array.from(idOrAddress || "")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 || code === 10 || code === 13 || code === 9;
    })
    .join("")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 120);

  // Check exact parcel id first
  const existing = getParcel(sanitizedInput);
  if (existing) {
    return {
      parcel: existing,
      subdivision: parcelToSubdivisionConfig(existing),
    };
  }

  // Check matching address query if query is non-empty
  const query = sanitizedInput.toLowerCase();
  if (query.length > 0) {
    const match = PARCELS.find(
      (p) =>
        p.address.toLowerCase().includes(query) ||
        p.apn.toLowerCase().includes(query) ||
        p.id.toLowerCase() === query ||
        p.municipality.toLowerCase().includes(query)
    );

    if (match) {
      return {
        parcel: match,
        subdivision: parcelToSubdivisionConfig(match),
      };
    }
  }

  // Fallback to custom subdivision with intelligent county guessing
  let detectedCounty: County = "York";
  if (/cumberland|camp hill|carlisle|mechanicsburg|hampden|silver spring|upper allen|lower allen|east pennsboro|shippensburg/i.test(sanitizedInput)) {
    detectedCounty = "Cumberland";
  } else if (/dauphin|harrisburg|derry|hershey|swatara|lower paxton|susquehanna|middletown|hummelstown/i.test(sanitizedInput)) {
    detectedCounty = "Dauphin";
  } else if (/lancaster|manheim|ephrata|lititz|east hempfield|mount joy|millersville|columbia/i.test(sanitizedInput)) {
    detectedCounty = "Lancaster";
  } else if (/york|springettsbury|spring garden|manchester|dover|fairview|hanover|red lion|dallastown|shrewsbury/i.test(sanitizedInput)) {
    detectedCounty = "York";
  }

  const custom = createCustomSubdivision(
    sanitizedInput,
    detectedCounty,
    `${detectedCounty} Township`,
    12.0
  );

  return {
    parcel: null,
    subdivision: custom,
  };
}
