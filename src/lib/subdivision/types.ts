import type { County } from "../types.ts";

export type ArchitectureStyle = "craftsman" | "colonial" | "modernFarmhouse" | "contemporary" | "european";
export type FacadeMaterial = "brick" | "stone" | "siding" | "boardAndBatten" | "stucco";
export type RoofMaterial = "shingle" | "slate" | "standingSeam";
export type InteriorFlooring = "oak" | "herringbone" | "walnut" | "tile" | "lvp";
export type InteriorWallColor = "alabaster" | "greige" | "navy" | "sage";
export type StudioViewLevel = "exterior" | "dollhouse" | "story1" | "story2" | "story3" | "story4";
export type StudioSceneMode = "subdivision" | "houseStudio";
export type LightingMode = "day" | "sunset" | "night";

export interface LotInspectionDetails {
  lotNumber: number;
  widthFt: number;
  depthFt: number;
  areaSqFt: number;
  grossAcres: number;
  setbacks: { front: number; rear: number; side: number };
  buildableEnvelopeWidthFt: number;
  buildableEnvelopeDepthFt: number;
  buildableEnvelopeSqFt: number;
  style: ArchitectureStyle;
  styleName: string;
  storyCount: number;
}

export interface HouseDesignSpec {
  stories: 1 | 2 | 3 | 4 | number;
  style: ArchitectureStyle;
  facadeMaterial: FacadeMaterial;
  roofMaterial: RoofMaterial;
  roofColor: string;
  trimColor: string;
  shutterColor: string;
  garageBays: 1 | 2 | 3;
  hasPorch: boolean;
  hasPatio: boolean;
  hasBalcony: boolean;
  hasBayTurret: boolean;
  footprintWidthFt: number;
  footprintDepthFt: number;
  sqftPerStory: number;
  totalSqft: number;
  heightFt: number;
  viewLevel: StudioViewLevel;
  flooring: InteriorFlooring;
  wallColor: InteriorWallColor;
  furnished: boolean;
}

export interface SubdivisionConfig {
  id: string;
  name: string;
  parcelId: string;
  address: string;
  municipality: string;
  county: County;
  grossAcres: number;
  zoningCode: string;
  zoningName: string;
  maxZoningHeight: number;
  maxLotCoverage: number;
  setbacks: {
    front: number;
    side: number;
    rear: number;
  };
  totalLots: number;
  pondRadiusFt: number;
  pondAcreage: number;
  openSpaceAcreage: number;
  roadLengthLinearFt: number;
  slopePct: number;
  floodZone: "X" | "X500" | "AE";
  karstRisk: "Low" | "Moderate" | "High";
  utilities: {
    water: string;
    sewer: string;
    electric: string;
    gas: string;
  };
}

export interface CostBreakdown {
  locationFactor: number;
  locationName: string;
  // Land
  landAcquisitionCost: number;
  landCostPerAcre: number;
  // Horizontal Site Development
  earthworkGradingCost: number;
  stormwaterPondCost: number;
  roadwayPavingCost: number;
  curbsAndSidewalksCost: number;
  walkingTrailAndAmenitiesCost: number;
  waterSewerInfrastructureCost: number;
  dryUtilitiesTrenchingCost: number;
  landscapingStreetTreesCost: number;
  civilEngineeringAndPermitsCost: number;
  totalHorizontalCost: number;
  horizontalCostPerLot: number;
  // Vertical Spec Construction
  singleHomeFoundationCost: number;
  singleHomeFramingCost: number;
  singleHomeExteriorFinishesCost: number;
  singleHomeInteriorFinishesCost: number;
  singleHomeMEPCost: number;
  singleHomeTotalCost: number;
  singleHomeCostPerSqft: number;
  allHomesVerticalCost: number;
  // Total Development & Underwriting
  totalDevelopmentCost: number;
  projectedSalePricePerHome: number;
  grossDevelopmentValue: number;
  netDeveloperProfit: number;
  developerMarginPct: number;
  returnOnCostPct: number;
  equityRequired: number;
  equityMultiple: number;
  breakevenPricePerHome: number;
}

export const DEFAULT_HOUSE_SPEC: HouseDesignSpec = {
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
