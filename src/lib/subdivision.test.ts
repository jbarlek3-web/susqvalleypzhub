import assert from "node:assert/strict";
import test from "node:test";
import { calculateDevelopmentCost } from "./subdivision/cost-estimator.ts";
import {
  createCustomSubdivision,
  parcelToSubdivisionConfig,
  resolveAddressOrParcel,
} from "./subdivision/address-resolver.ts";
import type { HouseDesignSpec } from "./subdivision/types.ts";
import { getParcel } from "./data/parcels.ts";

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

test("address resolver resolves exact parcel id and generates valid subdivision configuration", () => {
  const result = resolveAddressOrParcel("p-hampden");
  assert.ok(result.parcel);
  assert.equal(result.parcel.id, "p-hampden");
  assert.equal(result.subdivision.county, "Cumberland");
  assert.equal(result.subdivision.municipality, "Hampden Township");
  assert.ok(result.subdivision.grossAcres >= 1.5);
  assert.ok(result.subdivision.totalLots >= 6);
  assert.ok(result.subdivision.pondAcreage > 0);
  assert.ok(result.subdivision.pondRadiusFt > 0);
  assert.ok(result.subdivision.setbacks.front > 0);
  assert.ok(result.subdivision.maxZoningHeight > 0);
});

test("address resolver matches address query keywords across all regional PA counties", () => {
  const cumberlandMatch = resolveAddressOrParcel("Carlisle Pike");
  assert.ok(cumberlandMatch.subdivision);
  assert.equal(cumberlandMatch.subdivision.county, "Cumberland");

  const yorkMatch = resolveAddressOrParcel("Country Club Road");
  assert.ok(yorkMatch.subdivision);
  assert.equal(yorkMatch.subdivision.county, "York");

  const dauphinCustom = resolveAddressOrParcel("1200 Hershey Park Drive, Hershey, PA");
  assert.equal(dauphinCustom.subdivision.county, "Dauphin");

  const lancasterCustom = resolveAddressOrParcel("500 Lititz Springs Rd, Lititz, PA");
  assert.equal(lancasterCustom.subdivision.county, "Lancaster");
});

test("address resolver gracefully handles empty or whitespace queries with custom fallback", () => {
  const emptyResult = resolveAddressOrParcel("   ");
  assert.ok(emptyResult.subdivision);
  assert.equal(emptyResult.parcel, null);
  assert.ok(emptyResult.subdivision.grossAcres > 0);
  assert.ok(emptyResult.subdivision.totalLots > 0);
});

test("subdivision configuration accurately sizes retention pond and detects karst hazards", () => {
  const cumberlandParcel = getParcel("p-hampden");
  assert.ok(cumberlandParcel);
  const config = parcelToSubdivisionConfig(cumberlandParcel);

  // Stormwater pond should be scaled to parcel gross acres
  assert.ok(config.pondAcreage >= config.grossAcres * 0.1);
  const expectedRadius = Math.round(Math.sqrt((config.pondAcreage * 43560) / Math.PI));
  assert.equal(config.pondRadiusFt, expectedRadius);

  // Cumberland Valley low-slope parcel has High Karst limestone hazard
  if (cumberlandParcel.slopePct < 6) {
    assert.equal(config.karstRisk, "High");
  }
});

test("cost estimator applies correct location factors for all four PA counties", () => {
  const yorkSub = createCustomSubdivision("York Tract", "York", "Spring Garden", 10);
  const cumberlandSub = createCustomSubdivision("Cumberland Tract", "Cumberland", "Hampden", 10);
  const dauphinSub = createCustomSubdivision("Dauphin Tract", "Dauphin", "Derry", 10);
  const lancasterSub = createCustomSubdivision("Lancaster Tract", "Lancaster", "Manheim", 10);

  const yorkCost = calculateDevelopmentCost(yorkSub, BASE_SPEC);
  const cumberlandCost = calculateDevelopmentCost(cumberlandSub, BASE_SPEC);
  const dauphinCost = calculateDevelopmentCost(dauphinSub, BASE_SPEC);
  const lancasterCost = calculateDevelopmentCost(lancasterSub, BASE_SPEC);

  assert.equal(yorkCost.locationFactor, 0.98);
  assert.equal(cumberlandCost.locationFactor, 1.04);
  assert.equal(dauphinCost.locationFactor, 1.02);
  assert.equal(lancasterCost.locationFactor, 1.06);

  // Lancaster and Cumberland have higher baseline land costs per acre
  assert.ok(lancasterCost.landAcquisitionCost > yorkCost.landAcquisitionCost);
  assert.ok(cumberlandCost.landAcquisitionCost > yorkCost.landAcquisitionCost);
});

test("cost estimator applies slope earthwork multipliers for steep slope conservation", () => {
  const flatSub = createCustomSubdivision("Flat Tract", "York", "York Twp", 10);
  flatSub.slopePct = 3;

  const steepSub = createCustomSubdivision("Steep Tract", "York", "York Twp", 10);
  steepSub.slopePct = 18;

  const flatCost = calculateDevelopmentCost(flatSub, BASE_SPEC);
  const steepCost = calculateDevelopmentCost(steepSub, BASE_SPEC);

  // Steep slope (>15%) doubles the grading earthwork cost (2.0x vs 1.0x)
  assert.equal(steepCost.earthworkGradingCost, flatCost.earthworkGradingCost * 2);
});

test("cost estimator adds karst geosynthetic liner surcharge for high risk limestone zones", () => {
  const lowKarstSub = createCustomSubdivision("Low Karst Tract", "York", "York Twp", 10);
  lowKarstSub.karstRisk = "Low";

  const highKarstSub = createCustomSubdivision("High Karst Tract", "Cumberland", "Hampden Twp", 10);
  highKarstSub.karstRisk = "High";

  const lowCost = calculateDevelopmentCost(lowKarstSub, BASE_SPEC);
  const highCost = calculateDevelopmentCost(highKarstSub, BASE_SPEC);

  assert.ok(highCost.stormwaterPondCost > lowCost.stormwaterPondCost);
});

test("cost estimator calculates multi-story vertical construction variations from 1 to 4 stories", () => {
  const sub = createCustomSubdivision("Standard Master Plan", "Cumberland", "Silver Spring", 12);

  const spec1F: HouseDesignSpec = {
    ...BASE_SPEC,
    stories: 1,
    totalSqft: 1850,
    sqftPerStory: 1850,
    heightFt: 19.5,
  };
  const spec2F: HouseDesignSpec = {
    ...BASE_SPEC,
    stories: 2,
    totalSqft: 2900,
    sqftPerStory: 1450,
    heightFt: 31.2,
  };
  const spec3F: HouseDesignSpec = {
    ...BASE_SPEC,
    stories: 3,
    totalSqft: 3950,
    sqftPerStory: 1317,
    heightFt: 41.5,
  };
  const spec4F: HouseDesignSpec = {
    ...BASE_SPEC,
    stories: 4,
    totalSqft: 5100,
    sqftPerStory: 1275,
    heightFt: 51.8,
  };

  const cost1F = calculateDevelopmentCost(sub, spec1F);
  const cost2F = calculateDevelopmentCost(sub, spec2F);
  const cost3F = calculateDevelopmentCost(sub, spec3F);
  const cost4F = calculateDevelopmentCost(sub, spec4F);

  assert.ok(cost1F.singleHomeTotalCost < cost2F.singleHomeTotalCost);
  assert.ok(cost2F.singleHomeTotalCost < cost3F.singleHomeTotalCost);
  assert.ok(cost3F.singleHomeTotalCost < cost4F.singleHomeTotalCost);

  // Total Development Cost reconciles exactly: Land + Horizontal + All Homes Vertical
  assert.equal(
    cost2F.totalDevelopmentCost,
    cost2F.landAcquisitionCost + cost2F.totalHorizontalCost + cost2F.allHomesVerticalCost
  );
  // Gross Development Value reconciles exactly: Projected ASP * Lots
  assert.equal(
    cost2F.grossDevelopmentValue,
    cost2F.projectedSalePricePerHome * sub.totalLots
  );
  // Net Developer Profit reconciles exactly: GDV - TDC
  assert.equal(
    cost2F.netDeveloperProfit,
    cost2F.grossDevelopmentValue - cost2F.totalDevelopmentCost
  );
  // Breakeven price per home
  assert.equal(
    cost2F.breakevenPricePerHome,
    Math.round(cost2F.totalDevelopmentCost / sub.totalLots)
  );
});

test("cost estimator respects custom target sale price and land cost overrides", () => {
  const sub = createCustomSubdivision("Scenario Tract", "Dauphin", "Derry", 14);

  const defaultCost = calculateDevelopmentCost(sub, BASE_SPEC);
  const customTargetPrice = 675_000;
  const customLandPerAcre = 95_000;

  const overriddenCost = calculateDevelopmentCost(sub, BASE_SPEC, {
    customTargetSalePrice: customTargetPrice,
    customRawLandCost: customLandPerAcre,
    customFinishTier: "luxury",
  });

  assert.notEqual(overriddenCost.projectedSalePricePerHome, defaultCost.projectedSalePricePerHome);
  assert.equal(overriddenCost.projectedSalePricePerHome, customTargetPrice);
  assert.equal(overriddenCost.landCostPerAcre, customLandPerAcre);
  assert.equal(
    overriddenCost.landAcquisitionCost,
    Math.round(sub.grossAcres * customLandPerAcre)
  );
  assert.equal(
    overriddenCost.grossDevelopmentValue,
    customTargetPrice * sub.totalLots
  );
});

test("finish tiers adjust vertical spec interior cost appropriately", () => {
  const sub = createCustomSubdivision("Finish Test Tract", "Lancaster", "Warwick", 8);

  const standardCost = calculateDevelopmentCost(sub, BASE_SPEC, { customFinishTier: "standard" });
  const upgradedCost = calculateDevelopmentCost(sub, BASE_SPEC, { customFinishTier: "upgraded" });
  const luxuryCost = calculateDevelopmentCost(sub, BASE_SPEC, { customFinishTier: "luxury" });

  assert.ok(standardCost.singleHomeInteriorFinishesCost < upgradedCost.singleHomeInteriorFinishesCost);
  assert.ok(upgradedCost.singleHomeInteriorFinishesCost < luxuryCost.singleHomeInteriorFinishesCost);
});
