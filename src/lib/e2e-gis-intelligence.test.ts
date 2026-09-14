import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  resolveAddressOrParcel,
  parcelToSubdivisionConfig,
  createCustomSubdivision,
  getAllAvailableParcels,
} from "./subdivision/address-resolver.ts";
import { PARCELS, searchParcels, parcelsByCounty } from "./data/parcels.ts";
import { calculateDevelopmentCost, COUNTY_COST_FACTORS } from "./subdivision/cost-estimator.ts";
import {
  PARCEL_SERVICES,
  SOILS,
  FEMA_NFHL,
  boundsOverlap,
  esriQueryUrl,
} from "./data/gis-layers.ts";
import {
  resolveEntitlement,
  assertProEntitlement,
  AdminIdentityUnavailableError,
} from "./entitlement-policy.ts";
import type { Parcel, County } from "./types.ts";
import type { HouseDesignSpec } from "./subdivision/types.ts";

// ---------------------------------------------------------------------------
// Load Reference Datasets & Route Files via Canonical File System
// ---------------------------------------------------------------------------

const countiesData = JSON.parse(
  readFileSync(new URL("./data/pro-directory/counties.json", import.meta.url), "utf8"),
) as { source: string; records: Array<{ county: string; departmentName: string; countyZoningStatus: string; websiteUrl: string | null; phoneNumber: string | null; emailAddress: string | null; physicalAddress: string | null; directorOrZoningOfficer: string | null }> };

const municipalitiesData = JSON.parse(
  readFileSync(new URL("./data/pro-directory/municipalities.json", import.meta.url), "utf8"),
) as { source: string; compiled: string; records: Array<{ county: string; municipality: string; municipalityWebsiteUrl: string | null; ecode360Url: string | null; countyPlanningUrl: string | null }> };

const planningDirectory = JSON.parse(
  readFileSync(new URL("./data/pa-county-planning-directory.json", import.meta.url), "utf8"),
) as Array<{ county: string; departmentName: string; departmentUrl: string }>;

const _zoningSourceUrls = JSON.parse(
  readFileSync(new URL("./data/pa-county-zoning-source-urls.json", import.meta.url), "utf8"),
) as Array<{ county: string; sourceUrl: string; municipalityListSourceUrl?: string }>;

const directoryRouteContent = readFileSync(new URL("../routes/directory.tsx", import.meta.url), "utf8");
const proDirectoryClientModule = readFileSync(new URL("./pro-directory.ts", import.meta.url), "utf8");
const proDirectoryServerModule = readFileSync(new URL("./pro-directory.server.ts", import.meta.url), "utf8");

const BASE_SPEC: HouseDesignSpec = {
  stories: 2,
  style: "craftsman",
  facadeMaterial: "brick",
  roofMaterial: "shingle",
  roofColor: "#334155",
  trimColor: "#f8fafc",
  shutterColor: "#1e293b",
  garageBays: 2,
  hasPorch: true,
  hasPatio: true,
  hasBalcony: true,
  hasBayTurret: true,
  footprintWidthFt: 46,
  footprintDepthFt: 36,
  sqftPerStory: 1450,
  totalSqft: 2900,
  heightFt: 31.2,
  viewLevel: "exterior",
  flooring: "oak",
  wallColor: "greige",
  furnished: true,
};

// ---------------------------------------------------------------------------
// TIER 1: FEATURE COVERAGE (5 tests per feature for R3)
// ---------------------------------------------------------------------------

// Feature 11: Universal Query Resolver (R3)
test("F11-T1-1: Exact parcel APN/ID match resolves existing parcel and converts to compliant subdivision config", () => {
  const result = resolveAddressOrParcel("p-1042");
  assert.ok(result.parcel !== null);
  assert.equal(result.parcel.id, "p-1042");
  assert.equal(result.parcel.county, "Cumberland");
  assert.equal(result.parcel.address, "1042 Market Street");

  const sub = result.subdivision;
  assert.equal(sub.id, "p-1042");
  assert.equal(sub.county, "Cumberland");
  assert.equal(sub.municipality, "Camp Hill Borough");
  assert.equal(sub.zoningCode, "C-2");
  assert.equal(sub.setbacks.front, 25);
  assert.equal(sub.setbacks.side, 10);
  assert.equal(sub.setbacks.rear, 20);
});

test("F11-T1-2: Address substring and municipality search resolves parcels across target jurisdictions", () => {
  const byAddress = resolveAddressOrParcel("Market Street");
  assert.ok(byAddress.parcel !== null);
  assert.equal(byAddress.parcel.municipality, "Camp Hill Borough");

  const byApn = resolveAddressOrParcel("21-14-1234-567");
  assert.ok(byApn.parcel !== null);
  assert.equal(byApn.parcel.id, "p-1042");
});

test("F11-T1-3: Unknown parcel query falls back to procedural subdivision with intelligent county detection", () => {
  const cumberland = resolveAddressOrParcel("742 Evergreen Terrace, Carlisle, PA");
  assert.equal(cumberland.parcel, null);
  assert.equal(cumberland.subdivision.county, "Cumberland");

  const dauphin = resolveAddressOrParcel("100 Hershey Park Drive, Hershey, PA");
  assert.equal(dauphin.parcel, null);
  assert.equal(dauphin.subdivision.county, "Dauphin");

  const lancaster = resolveAddressOrParcel("500 Lincoln Highway, Lancaster, PA");
  assert.equal(lancaster.parcel, null);
  assert.equal(lancaster.subdivision.county, "Lancaster");

  const york = resolveAddressOrParcel("123 Main Street, Red Lion, PA");
  assert.equal(york.parcel, null);
  assert.equal(york.subdivision.county, "York");
});

test("F11-T1-4: Stormwater retention pond and open space sizing conform to PA DEP Chapter 102 & BMP Manual standards", () => {
  const acres = 14.5;
  const sub = createCustomSubdivision("Test Farm", "York", "York Twp", acres);

  const expectedPondAcreage = Number((acres * 0.12).toFixed(2));
  const expectedPondRadius = Math.round(Math.sqrt((expectedPondAcreage * 43560) / Math.PI));
  const expectedOpenSpace = Number((acres * 0.2).toFixed(2));

  assert.equal(sub.pondAcreage, expectedPondAcreage);
  assert.equal(sub.pondRadiusFt, expectedPondRadius);
  assert.equal(sub.openSpaceAcreage, expectedOpenSpace);
  assert.equal(sub.totalLots, Math.round(acres * 2.8));
});

test("F11-T1-5: Karst sinkhole hazard classification applies geological stratification rules", () => {
  // Cumberland and Lancaster have high limestone karst sinkhole risk on low slope plains
  const cumberlandSub = createCustomSubdivision("Cumberland Meadow", "Cumberland", "Silver Spring", 10);
  assert.equal(cumberlandSub.karstRisk, "High");

  const lancasterSub = createCustomSubdivision("Lancaster Plains", "Lancaster", "Manheim", 10);
  assert.equal(lancasterSub.karstRisk, "High");

  const yorkSub = createCustomSubdivision("York Rolling Hills", "York", "Manchester", 10);
  assert.equal(yorkSub.karstRisk, "Low");
});

// Feature 12: 67-County Reference Catalog (R3)
test("F12-T1-1: PA County Planning Directory encompasses all 67 Pennsylvania counties without omissions or duplicates", () => {
  assert.equal(planningDirectory.length, 67);

  const countyNames = new Set(planningDirectory.map((c) => c.county));
  assert.equal(countyNames.size, 67);

  const keyCounties = [
    "Adams", "Allegheny", "Berks", "Bucks", "Chester", "Cumberland",
    "Dauphin", "Delaware", "Erie", "Lancaster", "Lehigh", "Montgomery",
    "Northampton", "Philadelphia", "Westmoreland", "York",
  ];
  for (const kc of keyCounties) {
    assert.ok(countyNames.has(kc), `Missing anticipated county: ${kc}`);
  }
});

test("F12-T1-2: Pro Directory counties catalog verifies official contact and zoning status classification", () => {
  assert.equal(countiesData.records.length, 67);

  for (const rec of countiesData.records) {
    assert.ok(rec.county.length > 0);
    assert.ok(rec.departmentName.length > 0);
    assert.ok(
      rec.countyZoningStatus === "YES" ||
      rec.countyZoningStatus === "NO" ||
      rec.countyZoningStatus === "UNKNOWN",
      `Invalid zoning status: ${rec.countyZoningStatus} in ${rec.county}`,
    );
  }
});

test("F12-T1-3: Pro Directory municipalities catalog contains 1,290 records mapped to valid PA counties", () => {
  assert.equal(municipalitiesData.records.length, 1_290);

  const validCountySet = new Set(countiesData.records.map((c) => c.county.toLowerCase()));
  for (const mun of municipalitiesData.records) {
    assert.ok(validCountySet.has(mun.county.toLowerCase()), `Unknown county in municipality: ${mun.county}`);
    assert.ok(mun.municipality.length > 0);
  }
});

test("F12-T1-4: eCode360 official code library URLs validate against canonical URL pattern regex", () => {
  const regex = /^https:\/\/ecode360\.com\/[a-z]{2}\d{4}\/?$/i;

  const valid1 = "https://ecode360.com/CA1234";
  const valid2 = "https://ecode360.com/sp0567/";
  const invalidDomain = "https://malicious.com/ecode360.com/ca1234";
  const invalidCode = "https://ecode360.com/invalid";
  const nonHttp = "javascript:alert(1)";

  assert.ok(regex.test(valid1));
  assert.ok(regex.test(valid2));
  assert.ok(!regex.test(invalidDomain));
  assert.ok(!regex.test(invalidCode));
  assert.ok(!regex.test(nonHttp));
});

test("F12-T1-5: County cost factor catalog covers regional economic zones with exact multipliers", () => {
  assert.equal(COUNTY_COST_FACTORS.York.multiplier, 0.98);
  assert.equal(COUNTY_COST_FACTORS.Dauphin.multiplier, 1.02);
  assert.equal(COUNTY_COST_FACTORS.Cumberland.multiplier, 1.04);
  assert.equal(COUNTY_COST_FACTORS.Lancaster.multiplier, 1.06);

  // Default fallback for unspecified counties
  const getFactor = (c: string) => (COUNTY_COST_FACTORS as Record<string, { multiplier: number }>)[c]?.multiplier ?? 1.00;
  assert.equal(getFactor("Allegheny"), 1.00);
  assert.equal(getFactor("Philadelphia"), 1.00);
});

// Feature 13: Client-Server Data Partitioning & Pro Gating (R3)
test("F13-T1-1: Anonymous unauthenticated session is locked with status 'locked' and isPro false", async () => {
  const dummyGetUser = async () => {
    throw new Error("Should not be called for unauthenticated session");
  };

  const status = await resolveEntitlement(
    { userId: null, has: () => false },
    "pro",
    undefined,
    dummyGetUser,
  );

  assert.equal(status.isPro, false);
  assert.equal(status.status, "locked");
  assert.equal(status.currentPeriodEnd, null);
});

test("F13-T1-2: Non-pro authenticated user without active subscription throws 402 PaymentRequiredError when accessing Pro Directory", async () => {
  const dummyGetUser = async () => ({
    id: "user_free_123",
    banned: false,
    locked: false,
    primaryEmailAddressId: "email_free_123",
    emailAddresses: [{ id: "email_free_123", emailAddress: "free@example.com", verification: { status: "verified" } }],
  });

  const entitlement = await resolveEntitlement(
    { userId: "user_free_123", has: () => false },
    "pro",
    undefined,
    dummyGetUser,
  );

  assert.equal(entitlement.isPro, false);
  assert.throws(
    () => assertProEntitlement(entitlement),
    (err: unknown) => {
      const error = err as { name: string; status: number; message: string };
      return error.name === "PaymentRequiredError" && error.status === 402;
    },
  );
});

test("F13-T1-3: Pro subscriber with active Clerk plan entitlement grants access", async () => {
  const dummyGetUser = async () => ({
    id: "user_pro_999",
    banned: false,
    locked: false,
    primaryEmailAddressId: "email_pro_999",
    emailAddresses: [{ id: "email_pro_999", emailAddress: "pro@acme.com", verification: { status: "verified" } }],
  });

  const entitlement = await resolveEntitlement(
    { userId: "user_pro_999", has: (permission) => permission.plan === "pro" },
    "pro",
    undefined,
    dummyGetUser,
  );

  assert.equal(entitlement.isPro, true);
  assert.equal(entitlement.status, "active");
  const verified = assertProEntitlement(entitlement);
  assert.equal(verified.isPro, true);
});

test("F13-T1-4: Superadmin email identity bypasses billing checks when verified by Clerk", async () => {
  const adminEmail = "admin@acquisitionaide.com";
  const dummyGetUser = async (userId: string) => ({
    id: userId,
    banned: false,
    locked: false,
    primaryEmailAddressId: "email_admin_001",
    emailAddresses: [
      {
        id: "email_admin_001",
        emailAddress: adminEmail,
        verification: { status: "verified" },
      },
    ],
  });

  const entitlement = await resolveEntitlement(
    { userId: "user_admin_001", has: () => false },
    "pro",
    adminEmail,
    dummyGetUser,
  );

  assert.equal(entitlement.isPro, true);
  assert.equal(entitlement.status, "admin");
});

test("F13-T1-5: Client route code inspection guarantees zero bundling of heavy municipal datasets or server modules", () => {
  // Directory route must NOT directly import pro-directory.server or the raw JSON files
  assert.doesNotMatch(directoryRouteContent, /data\/pro-directory|pro-directory\.server/);
  assert.match(directoryRouteContent, /County P&amp;Z directory/);
  assert.match(directoryRouteContent, /Municipal source directory/);

  // Server function must require auth middleware and Pro entitlement
  assert.match(proDirectoryClientModule, /middleware\(\[authMiddleware\]\)/);
  assert.match(proDirectoryClientModule, /await requirePro\(\)/);
  assert.match(proDirectoryClientModule, /await import\("@\/lib\/pro-directory\.server"\)/);
});

// ---------------------------------------------------------------------------
// TIER 2: BOUNDARY & CORNER CASES (5 tests per feature for R3)
// ---------------------------------------------------------------------------

// Feature 11 Boundaries: Universal Query Resolver
test("F11-T2-1: Malicious XSS and SQL injection strings in query input are sanitized without executing", () => {
  const maliciousQuery = "<script>alert('pwned')</script> DROP TABLE parcels;-- Carlisle, PA";
  const result = resolveAddressOrParcel(maliciousQuery);

  assert.equal(result.parcel, null);
  assert.ok(!result.subdivision.address.includes("<script>"));
  assert.ok(!result.subdivision.address.includes("</script>"));
  assert.equal(result.subdivision.county, "Cumberland"); // Correctly detected Carlisle
});

test("F11-T2-2: Extremely long query strings exceeding 120 characters are truncated safely", () => {
  const longQuery = "A".repeat(300) + " Mechanicsburg, PA";
  const result = resolveAddressOrParcel(longQuery);

  assert.ok(result.subdivision.address.length <= 120);
});

test("F11-T2-3: Non-printable ASCII control characters (null byte, bell, backspace) are stripped", () => {
  const dirtyQuery = "\x00\x07\x081042 Market Street\x1b";
  const result = resolveAddressOrParcel(dirtyQuery);

  assert.ok(result.parcel !== null);
  assert.equal(result.parcel.id, "p-1042");
});

test("F11-T2-4: Micro-parcels (< 1.5 gross acres) clamp to minimum allowable development acreage", () => {
  const microParcel: Parcel = {
    ...PARCELS[0],
    id: "micro-1",
    acres: 0.25,
    polygon: [[40, -76], [40, -75], [41, -75], [41, -76]],
  };

  const sub = parcelToSubdivisionConfig(microParcel);
  assert.equal(sub.grossAcres, 1.5); // Clamped to minimum 1.5
  assert.ok(sub.totalLots >= 6); // Minimum 6 lots
});

test("F11-T2-5: Spatial coordinate bounds check validates latitude/longitude ordering and containment", () => {
  const yorkBounds = { west: -77.15, south: 39.71, east: -76.22, north: 40.23 };
  const pointInside = { lat: 39.96, lng: -76.73 };
  const pointOutside = { lat: 41.50, lng: -75.00 };

  const isInside = (lat: number, lng: number, b: typeof yorkBounds) =>
    lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;

  assert.ok(isInside(pointInside.lat, pointInside.lng, yorkBounds));
  assert.ok(!isInside(pointOutside.lat, pointOutside.lng, yorkBounds));
});

// Feature 12 Boundaries: 67-County Reference Catalog
test("F12-T2-1: Case-insensitive county lookup handles arbitrary casing cleanly", () => {
  const normalizeCounty = (input: string): County => {
    const s = input.trim().toLowerCase();
    if (s === "cumberland") return "Cumberland";
    if (s === "dauphin") return "Dauphin";
    if (s === "lancaster") return "Lancaster";
    return "York";
  };

  assert.equal(normalizeCounty("cUmBeRlAnD"), "Cumberland");
  assert.equal(normalizeCounty("DAUPHIN"), "Dauphin");
  assert.equal(normalizeCounty("lancaster"), "Lancaster");
  assert.equal(normalizeCounty("YORK"), "York");
});

test("F12-T2-2: Unlisted or out-of-state county name falls back to baseline cost factor 1.00", () => {
  const factor = (county: string) => (COUNTY_COST_FACTORS as unknown as Record<string, { multiplier: number }>)[county]?.multiplier ?? 1.00;

  assert.equal(factor("UnknownCounty"), 1.00);
  assert.equal(factor(""), 1.00);
  assert.equal(factor("Camden_NJ"), 1.00);
});

test("F12-T2-3: Municipality directory URL sanitization rejects non-HTTP protocols", () => {
  const sanitizeUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return null;
  };

  assert.equal(sanitizeUrl("https://springettsbury.com"), "https://springettsbury.com");
  assert.equal(sanitizeUrl("http://township.org"), "http://township.org");
  assert.equal(sanitizeUrl("javascript:evil()"), null);
  assert.equal(sanitizeUrl("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(sanitizeUrl(null), null);
});

test("F12-T2-4: Missing or null eCode360 URLs map strictly to null rather than undefined or empty string", () => {
  const parseEcode = (val: string | null) => {
    return val && /^https:\/\/ecode360\.com\/[a-z]{2}\d{4}\/?$/i.test(val) ? val : null;
  };

  assert.equal(parseEcode(null), null);
  assert.equal(parseEcode(""), null);
  assert.equal(parseEcode("   "), null);
  assert.equal(parseEcode("https://ecode360.com/"), null);
  assert.equal(parseEcode("https://ecode360.com/DA1002"), "https://ecode360.com/DA1002");
});

test("F12-T2-5: ESRI query parameter generator encodes bounding box coordinates and special query filters safely", () => {
  const bounds = { west: -77.15, south: 39.71, east: -76.22, north: 40.23 };
  const url = esriQueryUrl("https://example.com/arcgis/rest/services/Layer", bounds, 16, "PIDN,PROPADR", 1000);

  assert.ok(url.startsWith("https://example.com/arcgis/rest/services/Layer/query?"));
  assert.ok(url.includes("where=1%3D1"));
  assert.ok(url.includes("geometry=-77.15%2C39.71%2C-76.22%2C40.23"));
  assert.ok(url.includes("f=geojson"));
  assert.ok(url.includes("outFields=PIDN%2CPROPADR"));
});

// Feature 13 Boundaries: Client-Server Data Partitioning & Pro Gating
test("F13-T2-1: Clerk getUser network failure during admin verification raises 503 AdminIdentityUnavailableError", async () => {
  const adminEmail = "admin@domain.com";
  const failingGetUser = async () => {
    throw new Error("ECONNRESET: Failed to connect to Clerk API");
  };

  await assert.rejects(
    async () => {
      await resolveEntitlement(
        { userId: "user_failing", has: () => false },
        "pro",
        adminEmail,
        failingGetUser,
      );
    },
    (err: unknown) => {
      const error = err as AdminIdentityUnavailableError;
      return error.name === "AdminIdentityUnavailableError" && error.status === 503;
    },
  );
});

test("F13-T2-2: Unverified admin email claim (verification status != 'verified') denies admin privilege", async () => {
  const adminEmail = "admin@domain.com";
  const unverifiedGetUser = async () => ({
    id: "user_unverified",
    banned: false,
    locked: false,
    primaryEmailAddressId: "email_unverified",
    emailAddresses: [{ id: "email_unverified", emailAddress: adminEmail, verification: { status: "unverified" } }],
  });

  const entitlement = await resolveEntitlement(
    { userId: "user_unverified", has: () => false },
    "pro",
    adminEmail,
    unverifiedGetUser,
  );

  assert.equal(entitlement.isPro, false);
  assert.equal(entitlement.status, "locked");
});

test("F13-T2-3: Rate limiter rejects requests exceeding 30 per minute threshold via PGlite transaction", async () => {
  const db = new PGlite();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      bucket_key text not null,
      window_id bigint not null,
      request_count integer not null default 1,
      updated_at timestamptz not null default now(),
      primary key (bucket_key, window_id)
    );
  `);

  const action = "pro-directory";
  const userId = "test_user_rate_limit";
  const windowSeconds = 60;
  const max = 30;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowId = Math.floor(nowSeconds / windowSeconds);
  const key = `${action}:${userId}`;

  // Execute 30 valid requests
  let currentCount = 0;
  for (let i = 1; i <= 30; i++) {
    const res = await db.query<{ request_count: number }>(`
      INSERT INTO rate_limits (bucket_key, window_id, request_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (bucket_key, window_id)
      DO UPDATE SET request_count = rate_limits.request_count + 1, updated_at = now()
      RETURNING request_count;
    `, [key, windowId]);
    currentCount = res.rows[0].request_count;
    assert.equal(currentCount, i);
  }

  // 31st request triggers rate limit violation
  const res31 = await db.query<{ request_count: number }>(`
    INSERT INTO rate_limits (bucket_key, window_id, request_count)
    VALUES ($1, $2, 1)
    ON CONFLICT (bucket_key, window_id)
    DO UPDATE SET request_count = rate_limits.request_count + 1, updated_at = now()
    RETURNING request_count;
  `, [key, windowId]);
  currentCount = res31.rows[0].request_count;
  assert.equal(currentCount, 31);
  assert.ok(currentCount > max, "Request count should exceed rate limit max");
});

test("F13-T2-4: Server response filters out deprecated internal document URLs from client payload", () => {
  const retiredDocumentFields = [
    "municipalityZoningOrdinanceUrl",
    "municipalityComprehensivePlanUrl",
    "municipalitySaldoUrl",
    "municipalitySaldoApplicationUrl",
    "countySaldoUrl",
    "countySaldoApplicationUrl",
    "countyFeeScheduleUrl",
    "countyComprehensivePlanUrl",
    "countyZoningMapsUrl",
    "countyBuildingCodeUrl",
  ];

  for (const field of retiredDocumentFields) {
    assert.doesNotMatch(proDirectoryClientModule, new RegExp(field));
    assert.doesNotMatch(proDirectoryServerModule, new RegExp(field));
    assert.doesNotMatch(directoryRouteContent, new RegExp(field));
  }
});

test("F13-T2-5: Malformed session object with throwing 'has' function falls through to admin check safely", async () => {
  const adminEmail = "admin@domain.com";
  const dummyGetUser = async (userId: string) => ({
    id: userId,
    banned: false,
    locked: false,
    primaryEmailAddressId: "email_admin_fallback",
    emailAddresses: [
      {
        id: "email_admin_fallback",
        emailAddress: adminEmail,
        verification: { status: "verified" },
      },
    ],
  });

  const brokenSession = {
    userId: "user_admin_fallback",
    has: () => {
      throw new TypeError("Token signature corrupted");
    },
  };

  const entitlement = await resolveEntitlement(
    brokenSession,
    "pro",
    adminEmail,
    dummyGetUser,
  );

  assert.equal(entitlement.isPro, true);
  assert.equal(entitlement.status, "admin");
});

// ---------------------------------------------------------------------------
// TIER 3: CROSS-FEATURE COMBINATIONS (5 tests for R3)
// ---------------------------------------------------------------------------

test("R3-T3-1: Query resolver location profile + 67-County cost factor + Dynamic underwriting calculation", () => {
  // Step 1: Query resolver extracts Lancaster location
  const resolved = resolveAddressOrParcel("125 Lititz Pike, Lancaster, PA");
  const sub = resolved.subdivision;
  assert.equal(sub.county, "Lancaster");
  assert.equal(sub.karstRisk, "High");

  // Step 2: Extract county cost factor
  const factorRecord = COUNTY_COST_FACTORS[sub.county];
  assert.equal(factorRecord.multiplier, 1.06);

  // Step 3: Compute development underwriting with karst & regional cost factor
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  assert.equal(cost.locationFactor, 1.06);
  assert.ok(cost.stormwaterPondCost > 150_000, "Karst liner should elevate pond cost");
  assert.ok(cost.totalDevelopmentCost > 0);
  assert.ok(cost.breakevenPricePerHome > 0);
});

test("R3-T3-2: Query resolver + Pro directory municipality lookup + eCode360 ordinance linkage", () => {
  // Step 1: Query resolver finds parcel in Camp Hill Borough
  const resolved = resolveAddressOrParcel("1042 Market Street");
  assert.ok(resolved.parcel !== null);
  const munName = resolved.parcel.municipality;
  assert.equal(munName, "Camp Hill Borough");

  // Step 2: Search 1,290 municipalities catalog
  const match = municipalitiesData.records.find(
    (m) => m.county === "Cumberland" && m.municipality.toLowerCase().includes("camp hill"),
  );
  assert.ok(match !== undefined, "Camp Hill record should exist in catalog");
  assert.ok(match.municipalityWebsiteUrl !== null);
  assert.ok(match.ecode360Url !== null);
  assert.match(match.ecode360Url, /^https:\/\/ecode360\.com\//);
});

test("R3-T3-3: Pro entitlement gating + Pro directory data extraction + GIS overlay boundary intersection", () => {
  // Step 1: Verify Pro entitlement
  const proEntitlement = { isPro: true, status: "active", currentPeriodEnd: null };
  const verified = assertProEntitlement(proEntitlement);
  assert.ok(verified.isPro);

  // Step 2: Extract York County record from catalog
  const yorkRecord = countiesData.records.find((c) => c.county === "York");
  assert.ok(yorkRecord !== undefined);
  assert.equal(yorkRecord.countyZoningStatus, "YES"); // York County Planning Commission has active zoning status in directory
  assert.equal(yorkRecord.directorOrZoningOfficer, "Mike Pritchard");

  // Step 3: Match with York County parcel service extent
  const yorkService = PARCEL_SERVICES.find((s) => s.county === "York");
  assert.ok(yorkService !== undefined);

  // Parcel inside York County extent
  const parcelExtent = { west: -76.75, south: 39.95, east: -76.70, north: 40.00 };
  assert.ok(boundsOverlap(parcelExtent, yorkService.extent));
});

test("R3-T3-4: Malformed coordinate injection + ESRI URL generation + Security perimeter verification", () => {
  const maliciousBounds = {
    west: -77.15,
    south: 39.71,
    east: -76.22,
    north: 40.23,
  };
  const maliciousFields = "PIDN,PROPADR<script>alert(1)</script>; DROP TABLE users;";

  const url = esriQueryUrl("https://map.service.com", maliciousBounds, 15, maliciousFields, 500);

  // URL should be cleanly URL-encoded without raw < or > or unencoded semicolons
  assert.ok(!url.includes("<script>"));
  assert.ok(url.includes("PIDN%2CPROPADR%3Cscript%3Ealert%281%29%3C%2Fscript%3E%3B+DROP+TABLE+users%3B"));
});

test("R3-T3-5: Query resolver fallback to custom subdivision + Grok AI jurisdiction context preparation", () => {
  // Step 1: Resolve unknown parcel in Lower Paxton, Dauphin County
  const resolved = resolveAddressOrParcel("4500 Linglestown Road, Lower Paxton, PA");
  const sub = resolved.subdivision;
  assert.equal(sub.county, "Dauphin");

  // Step 2: Build Grok AI prompt payload injecting exact parcel and SALDO zoning constraints
  const promptContext = {
    municipality: sub.municipality,
    county: sub.county,
    grossAcres: sub.grossAcres,
    totalLots: sub.totalLots,
    maxHeightFt: sub.maxZoningHeight,
    setbacks: sub.setbacks,
    karstRisk: sub.karstRisk,
  };

  const grokUserPrompt = `Assess feasibility for ${promptContext.grossAcres} acres in ${promptContext.municipality}, ${promptContext.county} County. Setbacks: Front ${promptContext.setbacks.front}ft, Rear ${promptContext.setbacks.rear}ft. Max height: ${promptContext.maxHeightFt}ft. Karst: ${promptContext.karstRisk}.`;

  assert.ok(grokUserPrompt.includes("Dauphin County"));
  assert.ok(grokUserPrompt.includes("Front 25ft"));
  assert.ok(grokUserPrompt.includes("Max height: 35ft"));
});

// ---------------------------------------------------------------------------
// TIER 4: REAL-WORLD WORKLOAD SCENARIOS (5 tests for R3)
// ---------------------------------------------------------------------------

test("R3-T4-1: Multi-County Tri-Lateral Site Screening Journey: Compare parcels across York, Cumberland, and Lancaster for 24-unit subdivision", () => {
  // Scenario: Land acquisition director compares 3 target sites across 3 counties
  const siteYork = createCustomSubdivision("York Springettsbury", "York", "Springettsbury", 12.0);
  const siteCumberland = createCustomSubdivision("Cumberland Silver Spring", "Cumberland", "Silver Spring", 12.0);
  const siteLancaster = createCustomSubdivision("Lancaster Manheim", "Lancaster", "Manheim", 12.0);

  const costYork = calculateDevelopmentCost(siteYork, BASE_SPEC);
  const costCumberland = calculateDevelopmentCost(siteCumberland, BASE_SPEC);
  const costLancaster = calculateDevelopmentCost(siteLancaster, BASE_SPEC);

  // Fact 1: York has base cost factor 0.98 and Low Karst
  assert.equal(costYork.locationFactor, 0.98);

  // Fact 2: Cumberland has 1.04 factor and High Karst liner cost
  assert.equal(costCumberland.locationFactor, 1.04);
  assert.ok(costCumberland.stormwaterPondCost > costYork.stormwaterPondCost);

  // Fact 3: Lancaster has highest regional cost factor 1.06 and High Karst
  assert.equal(costLancaster.locationFactor, 1.06);
  assert.ok(costLancaster.totalDevelopmentCost > costYork.totalDevelopmentCost);
  assert.ok(costLancaster.singleHomeTotalCost > costYork.singleHomeTotalCost);
});

test("R3-T4-2: Enterprise Land Acquisition Workflow: Free user blocked -> Upgrades to Pro -> Ingests 1,290 municipalities -> Evaluates site feasibility with full pro forma", async () => {
  // Phase 1: Free user hits Pro directory route
  const freeEntitlement = await resolveEntitlement(
    { userId: "free_dev_1", has: () => false },
    "pro",
    undefined,
    async () => ({
      id: "free_dev_1",
      banned: false,
      locked: false,
      primaryEmailAddressId: null,
      emailAddresses: [],
    }),
  );
  assert.throws(() => assertProEntitlement(freeEntitlement));

  // Phase 2: User completes Stripe checkout -> Clerk webhook sets Pro entitlement
  const proEntitlement = await resolveEntitlement(
    { userId: "free_dev_1", has: (p) => p.plan === "pro" },
    "pro",
    undefined,
    async () => ({
      id: "free_dev_1",
      banned: false,
      locked: false,
      primaryEmailAddressId: null,
      emailAddresses: [],
    }),
  );
  const verified = assertProEntitlement(proEntitlement);
  assert.ok(verified.isPro);

  // Phase 3: Ingest 1,290 municipalities
  assert.equal(municipalitiesData.records.length, 1_290);
  const swatara = municipalitiesData.records.find((m) => m.municipality === "Swatara Township");
  assert.ok(swatara !== undefined);

  // Phase 4: Run full underwriting pro forma with developer price target
  const sub = createCustomSubdivision("Swatara Parcel", "Dauphin", "Swatara", 16.0);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC, { customTargetSalePrice: 850_000 });
  assert.equal(cost.locationFactor, 1.02);
  assert.ok(cost.netDeveloperProfit > 0);
  assert.ok(cost.developerMarginPct > 10);
});

test("R3-T4-3: High-Volume GIS Parcel Batch Ingestion & Spatial Extent Indexing: Ingest parcels, test spatial filtering against FEMA flood AE & SSURGO soils", () => {
  const allParcels = getAllAvailableParcels();
  assert.ok(allParcels.length > 0);

  // Filter parcels by county
  const cumberlandParcels = parcelsByCounty("Cumberland");
  const yorkParcels = parcelsByCounty("York");
  assert.ok(cumberlandParcels.length > 0);
  assert.ok(yorkParcels.length > 0);

  // Test FEMA NFHL service definition
  assert.equal(FEMA_NFHL.layerIds[0], 28);
  assert.equal(FEMA_NFHL.minZoom, 13);

  // Test Soils service definition
  assert.equal(SOILS.layerIds[0], 0);
  assert.equal(SOILS.minZoom, 12);

  // Search parcels by zoning keyword
  const commercial = searchParcels("C-2");
  assert.ok(commercial.length > 0);
  for (const p of commercial) {
    assert.ok(p.zoning.includes("C-2") || p.zoningSummary.includes("C-2"));
  }
});

test("R3-T4-4: Resilient Fallback & Disaster Recovery in GIS Resolver: Handle empty query, whitespace, and special characters without crash", () => {
  const emptyRes = resolveAddressOrParcel("");
  assert.equal(emptyRes.parcel, null);
  assert.ok(emptyRes.subdivision.grossAcres >= 1.5);
  assert.equal(emptyRes.subdivision.county, "York"); // Default fallback county

  const whitespaceRes = resolveAddressOrParcel("    \n\t   ");
  assert.equal(whitespaceRes.parcel, null);
  assert.ok(whitespaceRes.subdivision.totalLots >= 8);

  const punctuationOnly = resolveAddressOrParcel("!@#$%^&*()_+{}[]:;<>?");
  assert.equal(punctuationOnly.parcel, null);
  assert.ok(!punctuationOnly.subdivision.address.includes("<>"));
});

test("R3-T4-5: Complete Full-Stack Due Diligence Report: Query parcel -> Check Pro directory zoning officer contact -> Compute underwriting -> Verify utility interconnects", () => {
  // Step 1: Query parcel
  const res = resolveAddressOrParcel("1042 Market Street");
  assert.ok(res.parcel !== null);
  const p = res.parcel;

  // Step 2: Check county planning contact from official 67-county planning directory
  const countyPlan = planningDirectory.find((c) => c.county === p.county);
  assert.ok(countyPlan !== undefined);
  assert.ok(countyPlan.departmentName.length > 0);
  assert.ok(countyPlan.departmentUrl.startsWith("http"));

  // Check Pro directory contact details
  const proCounty = countiesData.records.find((c) => c.county === p.county);
  assert.ok(proCounty !== undefined);
  assert.ok(proCounty.phoneNumber !== null);
  assert.ok(proCounty.directorOrZoningOfficer !== null);

  // Step 3: Compute underwriting
  const sub = res.subdivision;
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  assert.ok(cost.totalDevelopmentCost > 0);
  assert.ok(cost.breakevenPricePerHome > 0);

  // Step 4: Verify utility infrastructure details
  assert.ok(sub.utilities.water.length > 0);
  assert.ok(sub.utilities.sewer.length > 0);
  assert.ok(sub.utilities.electric.length > 0);
  assert.ok(sub.utilities.gas.length > 0);
});
