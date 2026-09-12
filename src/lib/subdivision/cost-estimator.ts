import type { County } from "../types.ts";
import type { CostBreakdown, HouseDesignSpec, SubdivisionConfig } from "./types.ts";

export const COUNTY_COST_FACTORS: Record<
  County,
  {
    multiplier: number;
    name: string;
    rawLandAcreCost: number;
    baseHomeSaleComp: number;
    permitFeeFactor: number;
  }
> = {
  York: {
    multiplier: 0.98,
    name: "York County (South Central PA Base)",
    rawLandAcreCost: 48_000,
    baseHomeSaleComp: 435_000,
    permitFeeFactor: 0.95,
  },
  Cumberland: {
    multiplier: 1.04,
    name: "Cumberland County (I-81 / West Shore Corridor)",
    rawLandAcreCost: 68_000,
    baseHomeSaleComp: 495_000,
    permitFeeFactor: 1.05,
  },
  Dauphin: {
    multiplier: 1.02,
    name: "Dauphin County (Harrisburg Capital / Hershey Metro)",
    rawLandAcreCost: 58_000,
    baseHomeSaleComp: 465_000,
    permitFeeFactor: 1.02,
  },
  Lancaster: {
    multiplier: 1.06,
    name: "Lancaster County (Prime Farmland & Suburban Growth)",
    rawLandAcreCost: 78_000,
    baseHomeSaleComp: 540_000,
    permitFeeFactor: 1.08,
  },
};

export function calculateDevelopmentCost(
  subdivision: SubdivisionConfig,
  spec: HouseDesignSpec,
  overrides?: {
    customRawLandCost?: number;
    customTargetSalePrice?: number;
    customFinishTier?: "standard" | "upgraded" | "luxury";
  }
): CostBreakdown {
  const countyInfo = COUNTY_COST_FACTORS[subdivision.county] ?? COUNTY_COST_FACTORS.York;
  const loc = countyInfo.multiplier;

  // 1. Raw Land Acquisition
  const landCostPerAcre = overrides?.customRawLandCost ?? countyInfo.rawLandAcreCost;
  const landAcquisitionCost = Math.round(subdivision.grossAcres * landCostPerAcre);

  // 2. Slope & Topography Multiplier
  let slopeEarthworkMultiplier = 1.0;
  if (subdivision.slopePct > 15) {
    slopeEarthworkMultiplier = 2.0; // PA SALDO steep slope conservation & benching
  } else if (subdivision.slopePct > 8) {
    slopeEarthworkMultiplier = 1.45;
  } else if (subdivision.slopePct > 4) {
    slopeEarthworkMultiplier = 1.2;
  }

  // 3. Karst & Pond Surcharge
  // Karst limestone requires impermeable geosynthetic clay liner (GCL) + riprap
  const karstLinerCost =
    subdivision.karstRisk === "High"
      ? 95_000
      : subdivision.karstRisk === "Moderate"
      ? 55_000
      : 18_000;

  // 4. Horizontal Civil Site Work Costs
  const earthworkGradingCost = Math.round(
    subdivision.grossAcres * 11_500 * slopeEarthworkMultiplier * loc
  );

  // Central Stormwater Retention Pond (Excavation, liner, concrete spillway, aerator fountain, littoral shelf)
  const basePondCost = Math.round(
    (subdivision.pondAcreage * 125_000 + karstLinerCost + 28_000) * loc
  );
  const stormwaterPondCost = Math.max(135_000, basePondCost);

  // Roadway Paving (Subbase, 4" asphalt binder, 1.5" wearing course per PA SALDO)
  // Approx $210 / linear foot
  const roadwayPavingCost = Math.round(subdivision.roadLengthLinearFt * 210 * loc);

  // Concrete Curbs & Sidewalks (5ft wide sidewalk both sides + ADA ramps)
  // Approx $85 / linear foot of roadway
  const curbsAndSidewalksCost = Math.round(subdivision.roadLengthLinearFt * 85 * loc);

  // Central Walking Trail circling the pond + Park Benches + Overlook Deck
  const walkingTrailAndAmenitiesCost = Math.round(
    (subdivision.pondRadiusFt * 2 * Math.PI * 45 + 32_000) * loc
  );

  // Wet Utilities: Water distribution main ($95/LF) + Sanitary sewer ($140/LF) + Storm drainage RC pipe ($155/LF)
  const waterSewerInfrastructureCost = Math.round(
    subdivision.roadLengthLinearFt * (95 + 140 + 155) * loc
  );

  // Dry Utilities: Underground electric (PPL/Met-Ed), gas (UGI/Columbia), telecom fiber ($75/LF)
  const dryUtilitiesTrenchingCost = Math.round(subdivision.roadLengthLinearFt * 75 * loc);

  // Landscaping: Street trees (1 per 40ft per PA SALDO), sodding, pond emergent wetland plants, perimeter buffer
  const streetTreeCount = Math.max(12, Math.round(subdivision.roadLengthLinearFt / 40));
  const landscapingStreetTreesCost = Math.round(
    (streetTreeCount * 650 + subdivision.grossAcres * 4_200 + 25_000) * loc
  );

  // Civil Engineering, PA DEP NPDES Phase II, E&S plan, PennDOT HOP, and municipal escrow
  const civilEngineeringAndPermitsCost = Math.round(
    (85_000 + subdivision.totalLots * 3_200) * countyInfo.permitFeeFactor * loc
  );

  const totalHorizontalCost =
    earthworkGradingCost +
    stormwaterPondCost +
    roadwayPavingCost +
    curbsAndSidewalksCost +
    walkingTrailAndAmenitiesCost +
    waterSewerInfrastructureCost +
    dryUtilitiesTrenchingCost +
    landscapingStreetTreesCost +
    civilEngineeringAndPermitsCost;

  const horizontalCostPerLot = Math.round(totalHorizontalCost / Math.max(1, subdivision.totalLots));

  // 5. Vertical Spec Home Construction
  // Base cost per sqft by story count
  let baseSqftCost = 155;
  if (spec.stories === 1) baseSqftCost = 168; // High roof-to-floor ratio
  else if (spec.stories === 2) baseSqftCost = 152; // Optimum two-story framing efficiency
  else if (spec.stories === 3) baseSqftCost = 172; // Structural reinforcement, upper hoisting
  else if (spec.stories === 4) baseSqftCost = 192; // Engineered timber/steel headers, high-load MEP

  // Exterior facade adders
  let facadeAdder = 0;
  if (spec.facadeMaterial === "stone") facadeAdder = 22;
  else if (spec.facadeMaterial === "brick") facadeAdder = 16;
  else if (spec.facadeMaterial === "boardAndBatten") facadeAdder = 9;
  else if (spec.facadeMaterial === "stucco") facadeAdder = 12;

  // Roof material adders
  let roofAdder = 0;
  if (spec.roofMaterial === "slate") roofAdder = 15;
  else if (spec.roofMaterial === "standingSeam") roofAdder = 12;

  // Interior finish tier adder
  let interiorAdder = 0;
  const tier = overrides?.customFinishTier ?? "upgraded";
  if (tier === "luxury") interiorAdder = 28;
  else if (tier === "upgraded") interiorAdder = 14;
  else interiorAdder = 0;

  // Garage adder
  const garageCost = spec.garageBays * 18_500;

  // Porch, Patio, Balcony & Turret adders
  const porchCost = spec.hasPorch ? 14_000 : 0;
  const patioCost = spec.hasPatio ? 11_500 : 0;
  const balconyCost = spec.hasBalcony && spec.stories >= 2 ? 9_500 : 0;
  const turretCost = spec.hasBayTurret ? 16_000 : 0;

  const netSqftRate = Math.round((baseSqftCost + facadeAdder + roofAdder + interiorAdder) * loc);

  const singleHomeFoundationCost = Math.round(
    (spec.sqftPerStory * 38 + (spec.stories > 2 ? 8_000 : 0)) * loc
  );
  const singleHomeFramingCost = Math.round(spec.totalSqft * 48 * loc);
  const singleHomeExteriorFinishesCost = Math.round(
    (spec.totalSqft * (22 + facadeAdder + roofAdder) + garageCost + porchCost + balconyCost + turretCost) * loc
  );
  const singleHomeInteriorFinishesCost = Math.round(
    spec.totalSqft * (32 + interiorAdder) * loc
  );
  const singleHomeMEPCost = Math.round(spec.totalSqft * 34 * loc);

  const singleHomeTotalCost =
    singleHomeFoundationCost +
    singleHomeFramingCost +
    singleHomeExteriorFinishesCost +
    singleHomeInteriorFinishesCost +
    singleHomeMEPCost +
    patioCost;

  const singleHomeCostPerSqft = Math.round(singleHomeTotalCost / Math.max(1, spec.totalSqft));
  const allHomesVerticalCost = singleHomeTotalCost * subdivision.totalLots;

  // 6. Total Development Cost & Underwriting Pro Forma
  const totalDevelopmentCost = landAcquisitionCost + totalHorizontalCost + allHomesVerticalCost;

  // Projected sale price per home based on size, stories, finishes, and county market comps
  let projectedSalePricePerHome: number;
  if (overrides?.customTargetSalePrice && overrides.customTargetSalePrice > 0) {
    projectedSalePricePerHome = Math.round(overrides.customTargetSalePrice);
  } else {
    const baselineComp = countyInfo.baseHomeSaleComp;
    const sqftAdjustment = (spec.totalSqft - 2600) * 145;
    const storyBonus = (spec.stories - 2) * 35_000;
    const finishBonus = tier === "luxury" ? 55_000 : tier === "upgraded" ? 22_000 : 0;
    const pondViewBonus = 25_000; // Premium for central subdivision retention pond views
    projectedSalePricePerHome = Math.round(
      baselineComp + sqftAdjustment + storyBonus + finishBonus + pondViewBonus
    );
  }

  const grossDevelopmentValue = projectedSalePricePerHome * subdivision.totalLots;
  const netDeveloperProfit = grossDevelopmentValue - totalDevelopmentCost;
  const developerMarginPct = Number(
    ((netDeveloperProfit / Math.max(1, grossDevelopmentValue)) * 100).toFixed(1)
  );
  const returnOnCostPct = Number(
    ((netDeveloperProfit / Math.max(1, totalDevelopmentCost)) * 100).toFixed(1)
  );

  // Standard underwriting: 65% Construction Loan-to-Cost (LTC), 35% Equity
  const equityRequired = Math.round(totalDevelopmentCost * 0.35);
  const equityMultiple = Number(
    ((netDeveloperProfit + equityRequired) / Math.max(1, equityRequired)).toFixed(2)
  );
  const breakevenPricePerHome = Math.round(totalDevelopmentCost / Math.max(1, subdivision.totalLots));

  return {
    locationFactor: loc,
    locationName: countyInfo.name,
    landAcquisitionCost,
    landCostPerAcre,
    earthworkGradingCost,
    stormwaterPondCost,
    roadwayPavingCost,
    curbsAndSidewalksCost,
    walkingTrailAndAmenitiesCost,
    waterSewerInfrastructureCost,
    dryUtilitiesTrenchingCost,
    landscapingStreetTreesCost,
    civilEngineeringAndPermitsCost,
    totalHorizontalCost,
    horizontalCostPerLot,
    singleHomeFoundationCost,
    singleHomeFramingCost,
    singleHomeExteriorFinishesCost,
    singleHomeInteriorFinishesCost,
    singleHomeMEPCost,
    singleHomeTotalCost,
    singleHomeCostPerSqft,
    allHomesVerticalCost,
    totalDevelopmentCost,
    projectedSalePricePerHome,
    grossDevelopmentValue,
    netDeveloperProfit,
    developerMarginPct,
    returnOnCostPct,
    equityRequired,
    equityMultiple,
    breakevenPricePerHome,
  };
}
