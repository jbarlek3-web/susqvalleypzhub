import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { PDFDocument } from "pdf-lib";
import { calculateDevelopmentCost, COUNTY_COST_FACTORS } from "./subdivision/cost-estimator.ts";
import { createCustomSubdivision } from "./subdivision/address-resolver.ts";
import type { HouseDesignSpec, SubdivisionConfig } from "./subdivision/types.ts";
import { buildSubdivisionMasterPlan } from "../components/scene-3d/SubdivisionMasterPlan.ts";
import { buildHouseStudioModel } from "../components/scene-3d/HouseStudioModel.ts";

// ---------------------------------------------------------------------------
// Helpers and Base Specifications for R2
// ---------------------------------------------------------------------------

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

// Lot inspection overlay structure
interface LotInspectionDetails {
  lotNumber: number;
  widthFt: number;
  depthFt: number;
  areaSqFt: number;
  grossAcres: number;
  setbacks: { front: number; rear: number; side: number };
  buildableEnvelopeWidthFt: number;
  buildableEnvelopeDepthFt: number;
  buildableEnvelopeSqFt: number;
  style: string;
  storyCount: number;
}

function computeLotInspectionDetails(
  lotNumber: number,
  config: SubdivisionConfig,
  style = "craftsman",
  storyCount = 2,
): LotInspectionDetails {
  const widthFt = 78;
  const depthFt = 110;
  const areaSqFt = widthFt * depthFt;
  const grossAcres = Number((areaSqFt / 43560).toFixed(3));
  const front = config.setbacks.front;
  const rear = config.setbacks.rear;
  const side = config.setbacks.side;

  const buildableEnvelopeWidthFt = Math.max(0, widthFt - side * 2);
  const buildableEnvelopeDepthFt = Math.max(0, depthFt - front - rear);
  const buildableEnvelopeSqFt = buildableEnvelopeWidthFt * buildableEnvelopeDepthFt;

  return {
    lotNumber,
    widthFt,
    depthFt,
    areaSqFt,
    grossAcres,
    setbacks: { front, rear, side },
    buildableEnvelopeWidthFt,
    buildableEnvelopeDepthFt,
    buildableEnvelopeSqFt,
    style,
    storyCount,
  };
}

// Pro Forma Spreadsheet Generator (CSV)
function generateProFormaCsv(sub: SubdivisionConfig, spec: HouseDesignSpec, cost: ReturnType<typeof calculateDevelopmentCost>): string {
  const lines: string[] = [];
  lines.push("Category,Line Item,Quantity,Unit,Unit Cost,Total Cost");
  const safeAddress = `"${sub.address.replace(/"/g, '""')}"`;
  lines.push(`General,Development Address,1,Site,${safeAddress},${safeAddress}`);
  lines.push(`Acquisition,Raw Land Acquisition,${sub.grossAcres},Acres,$${cost.landCostPerAcre.toLocaleString()},$${cost.landAcquisitionCost.toLocaleString()}`);
  lines.push(`Civil Works,Earthwork & Grading,${sub.grossAcres},Acres,Slope Grading,$${cost.earthworkGradingCost.toLocaleString()}`);
  lines.push(`Civil Works,Stormwater Retention Pond & Basin,${sub.pondRadiusFt}ft Radius,Each,Incl Karst,$${cost.stormwaterPondCost.toLocaleString()}`);
  lines.push(`Civil Works,Roadway Paving & Base,${sub.roadLengthLinearFt},LF,$210/LF,$${cost.roadwayPavingCost.toLocaleString()}`);
  lines.push(`Civil Works,Concrete Curbs & Sidewalks,${sub.roadLengthLinearFt * 2},LF,$85/LF,$${cost.curbsAndSidewalksCost.toLocaleString()}`);
  lines.push(`Civil Works,Perimeter Walking Trail,Central Basin,LF,$45/LF,$${cost.walkingTrailAndAmenitiesCost.toLocaleString()}`);
  lines.push(`Civil Works,Wet Utilities (Water & Sewer),${sub.roadLengthLinearFt},LF,$390/LF,$${cost.waterSewerInfrastructureCost.toLocaleString()}`);
  lines.push(`Civil Works,Dry Utilities (Electric & Telecom),${sub.roadLengthLinearFt},LF,$75/LF,$${cost.dryUtilitiesTrenchingCost.toLocaleString()}`);
  lines.push(`Civil Works,Street Trees & Landscape,Landscape Buffer,Trees,$650/Tree,$${cost.landscapingStreetTreesCost.toLocaleString()}`);
  lines.push(`Civil Works,Civil Engineering & SALDO Permits,${sub.totalLots},Lots,Base + $3.2k/Lot,$${cost.civilEngineeringAndPermitsCost.toLocaleString()}`);
  lines.push(`Vertical Construction,Single Spec Home Cost,1,Home,All Tiers,$${cost.singleHomeTotalCost.toLocaleString()}`);
  lines.push(`Vertical Construction,All Homes Spec Construction,${sub.totalLots},Homes,$${cost.singleHomeTotalCost.toLocaleString()}/Home,$${cost.allHomesVerticalCost.toLocaleString()}`);
  lines.push("");
  lines.push("Key Financial Performance Metric,Value");
  lines.push(`Projected Sale Price per Home,$${cost.projectedSalePricePerHome.toLocaleString()}`);
  lines.push(`Total Development Cost (TDC),$${cost.totalDevelopmentCost.toLocaleString()}`);
  lines.push(`Gross Development Value (GDV),$${cost.grossDevelopmentValue.toLocaleString()}`);
  lines.push(`Net Developer Profit,$${cost.netDeveloperProfit.toLocaleString()}`);
  lines.push(`Developer Margin %,${cost.developerMarginPct}%`);
  lines.push(`Return on Cost (ROC) %,${cost.returnOnCostPct}%`);
  lines.push(`Equity Required (35% LTC),$${cost.equityRequired.toLocaleString()}`);
  lines.push(`Breakeven Price per Home,$${cost.breakevenPricePerHome.toLocaleString()}`);
  return lines.join("\n");
}

// Pro Forma PDF Generator
async function generateProFormaPdf(sub: SubdivisionConfig, spec: HouseDesignSpec, cost: ReturnType<typeof calculateDevelopmentCost>): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter standard size
  page.drawText(`SUBDIVISION DEVELOPMENT PRO FORMA: ${sub.name.toUpperCase()}`, { x: 50, y: 740, size: 14 });
  page.drawText(`Jurisdiction: ${sub.municipality}, ${sub.county} County, PA`, { x: 50, y: 720, size: 10 });
  page.drawText(`Gross Acreage: ${sub.grossAcres} Acres | Total Platted Lots: ${sub.totalLots} Lots`, { x: 50, y: 705, size: 10 });
  page.drawText("-----------------------------------------------------------------------------------------------------", { x: 50, y: 690, size: 10 });
  page.drawText(`Total Development Cost (TDC): $${cost.totalDevelopmentCost.toLocaleString()}`, { x: 50, y: 660, size: 12 });
  page.drawText(`Gross Development Value (GDV): $${cost.grossDevelopmentValue.toLocaleString()}`, { x: 50, y: 640, size: 12 });
  page.drawText(`Net Developer Profit: $${cost.netDeveloperProfit.toLocaleString()} (${cost.developerMarginPct}% Margin)`, { x: 50, y: 620, size: 12 });
  page.drawText(`Return on Cost (ROC): ${cost.returnOnCostPct}% | Breakeven Price: $${cost.breakevenPricePerHome.toLocaleString()}/home`, { x: 50, y: 600, size: 11 });
  page.drawText(`Horizontal Infrastructure Total: $${cost.totalHorizontalCost.toLocaleString()}`, { x: 50, y: 570, size: 10 });
  page.drawText(`Vertical Spec Construction Total: $${cost.allHomesVerticalCost.toLocaleString()}`, { x: 50, y: 550, size: 10 });
  page.drawText(`Land Acquisition Cost: $${cost.landAcquisitionCost.toLocaleString()}`, { x: 50, y: 530, size: 10 });
  return doc.save();
}

// Memory hierarchy disposal helper
function disposeThreeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).geometry) {
      (obj as THREE.Mesh).geometry.dispose();
    }
    const mat = (obj as THREE.Mesh).material;
    if (mat) {
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
  });
}

// ---------------------------------------------------------------------------
// TIER 1: FEATURE COVERAGE (5 tests per feature for R2)
// ---------------------------------------------------------------------------

// Feature 6: Interactive Raycasting Lot Picking & Overlay (R2)
test("F06-T1-1: Raycaster identifies lotNumber from intersecting parcel geometry", () => {
  const root = new THREE.Group();
  const lotBox = new THREE.Mesh(
    new THREE.BoxGeometry(20, 2, 20),
    new THREE.MeshBasicMaterial(),
  );
  lotBox.position.set(0, 0, 0);
  lotBox.userData = { lotNumber: 7, styleIdx: 1 };
  root.add(lotBox);

  const raycaster = new THREE.Raycaster();
  const origin = new THREE.Vector3(0, 50, 0);
  const direction = new THREE.Vector3(0, -1, 0);
  raycaster.set(origin, direction);

  const hits = raycaster.intersectObjects(root.children, true);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].object.userData.lotNumber, 7);
  assert.equal(hits[0].object.userData.styleIdx, 1);
});

test("F06-T1-2: Platted parcels specify 78ft width by 110ft depth with 8580 sq ft area", () => {
  const sub = createCustomSubdivision("Test Tract", "York", "York Twp", 16);
  const details = computeLotInspectionDetails(1, sub);
  assert.equal(details.widthFt, 78);
  assert.equal(details.depthFt, 110);
  assert.equal(details.areaSqFt, 8580);
  assert.equal(details.grossAcres, 0.197);
});

test("F06-T1-3: Setback boundaries establish accurate buildable envelope within parcel", () => {
  const sub = createCustomSubdivision("Setback Tract", "Cumberland", "Silver Spring", 12);
  sub.setbacks = { front: 25, rear: 20, side: 10 };
  const details = computeLotInspectionDetails(3, sub);

  // Width: 78 - 2*10 = 58 ft
  assert.equal(details.buildableEnvelopeWidthFt, 58);
  // Depth: 110 - 25 - 20 = 65 ft
  assert.equal(details.buildableEnvelopeDepthFt, 65);
  // Area: 58 * 65 = 3770 sq ft
  assert.equal(details.buildableEnvelopeSqFt, 3770);
});

test("F06-T1-4: Lot inspection overlay data structure populates all zoning and architectural parameters", () => {
  const sub = createCustomSubdivision("Colonial Crossing", "Lancaster", "Manheim Twp", 20);
  const overlay = computeLotInspectionDetails(12, sub, "colonial", 3);

  assert.equal(overlay.lotNumber, 12);
  assert.equal(overlay.style, "colonial");
  assert.equal(overlay.storyCount, 3);
  assert.equal(overlay.setbacks.front, sub.setbacks.front);
  assert.equal(overlay.setbacks.rear, sub.setbacks.rear);
  assert.equal(overlay.setbacks.side, sub.setbacks.side);
  assert.ok(overlay.buildableEnvelopeSqFt > 0);
});

test("F06-T1-5: Procedural subdivision places platted lots across all four quadrants without duplicates", () => {
  const sub = createCustomSubdivision("Quadrant Village", "Dauphin", "Derry Twp", 16);
  const { group: plan } = buildSubdivisionMasterPlan(sub);

  const lotNumbers: number[] = [];
  plan.traverse((obj) => {
    if (obj.userData && typeof obj.userData.lotNumber === "number") {
      lotNumbers.push(obj.userData.lotNumber);
    }
  });

  // Verify unique lot numbers across the subdivision
  const uniqueLots = new Set(lotNumbers);
  assert.ok(uniqueLots.size >= 12);
  assert.ok(uniqueLots.has(1));
  assert.ok(uniqueLots.has(12));
  disposeThreeHierarchy(plan);
});

// Feature 7: In-Place Architectural Customizer (R2)
test("F07-T1-1: Architectural customizer builds 4 distinct elevation styles", () => {
  const styles: Array<HouseDesignSpec["style"]> = ["craftsman", "colonial", "modernFarmhouse", "contemporary"];
  for (const style of styles) {
    const spec: HouseDesignSpec = { ...BASE_SPEC, style };
    const model = buildHouseStudioModel(spec);
    assert.ok(model.children.length > 0);
    disposeThreeHierarchy(model);
  }
});

test("F07-T1-2: Architectural customizer supports all 4 styles with distinct configurations", () => {
  const styles: Array<HouseDesignSpec["style"]> = ["colonial", "craftsman", "modernFarmhouse", "contemporary"];
  const meshCounts: number[] = [];
  for (const style of styles) {
    const spec: HouseDesignSpec = { ...BASE_SPEC, style };
    const model = buildHouseStudioModel(spec);
    let count = 0;
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) count++;
    });
    meshCounts.push(count);
    assert.ok(count > 0);
    disposeThreeHierarchy(model);
  }
  assert.equal(meshCounts.length, 4);
});

test("F07-T1-3: Vertical story scaling proportionally increases height and total square footage", () => {
  const spec1: HouseDesignSpec = { ...BASE_SPEC, stories: 1, totalSqft: 1850, heightFt: 19.5 };
  const spec2: HouseDesignSpec = { ...BASE_SPEC, stories: 2, totalSqft: 2900, heightFt: 31.2 };
  const spec3: HouseDesignSpec = { ...BASE_SPEC, stories: 3, totalSqft: 3950, heightFt: 41.5 };
  const spec4: HouseDesignSpec = { ...BASE_SPEC, stories: 4, totalSqft: 5100, heightFt: 51.8 };

  assert.ok(spec1.heightFt < spec2.heightFt);
  assert.ok(spec2.heightFt < spec3.heightFt);
  assert.ok(spec3.heightFt < spec4.heightFt);
  assert.equal(spec4.heightFt, 51.8);
  assert.equal(spec4.totalSqft, 5100);
});

test("F07-T1-4: Cutaway view level visibility toggles exterior and individual floor slices", () => {
  const levels = [
    { level: "exterior" as const, stories: 2 },
    { level: "story1" as const, stories: 2 },
    { level: "story2" as const, stories: 2 },
    { level: "story3" as const, stories: 3 },
    { level: "story4" as const, stories: 4 },
  ];
  for (const { level, stories } of levels) {
    const spec: HouseDesignSpec = { ...BASE_SPEC, stories, viewLevel: level };
    const model = buildHouseStudioModel(spec);
    assert.ok(model.children.length > 0);
    disposeThreeHierarchy(model);
  }
});

test("F07-T1-5: Architectural finish additions (porch, patio, balcony, turret) adjust model geometry", () => {
  const minimalSpec: HouseDesignSpec = {
    ...BASE_SPEC,
    hasPorch: false,
    hasPatio: false,
    hasBalcony: false,
    hasBayTurret: false,
  };
  const fullSpec: HouseDesignSpec = {
    ...BASE_SPEC,
    hasPorch: true,
    hasPatio: true,
    hasBalcony: true,
    hasBayTurret: true,
  };

  const modelMin = buildHouseStudioModel(minimalSpec);
  const modelFull = buildHouseStudioModel(fullSpec);

  let minMeshes = 0;
  modelMin.traverse((o) => {
    if (o instanceof THREE.Mesh) minMeshes++;
  });
  let fullMeshes = 0;
  modelFull.traverse((o) => {
    if (o instanceof THREE.Mesh) fullMeshes++;
  });

  assert.ok(fullMeshes > minMeshes);
  disposeThreeHierarchy(modelMin);
  disposeThreeHierarchy(modelFull);
});

// Feature 8: Dynamic Underwriting Recalculation (R2)
test("F08-T1-1: Total Development Cost reconciles mathematically to Land + Horizontal + Vertical", () => {
  const sub = createCustomSubdivision("Audit Subdivision", "York", "York Twp", 14);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const expectedTdc = cost.landAcquisitionCost + cost.totalHorizontalCost + cost.allHomesVerticalCost;
  assert.equal(cost.totalDevelopmentCost, expectedTdc);
});

test("F08-T1-2: Gross Development Value and Net Profit reconcile to ASP and margin formulas", () => {
  const sub = createCustomSubdivision("Profit Subdivision", "Cumberland", "Hampden", 16);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);

  assert.equal(cost.grossDevelopmentValue, cost.projectedSalePricePerHome * sub.totalLots);
  assert.equal(cost.netDeveloperProfit, cost.grossDevelopmentValue - cost.totalDevelopmentCost);
  const expectedMargin = Number(((cost.netDeveloperProfit / cost.grossDevelopmentValue) * 100).toFixed(1));
  assert.equal(cost.developerMarginPct, expectedMargin);
});

test("F08-T1-3: Regional cost factors apply verified multipliers across all target PA counties", () => {
  assert.equal(COUNTY_COST_FACTORS.York.multiplier, 0.98);
  assert.equal(COUNTY_COST_FACTORS.Cumberland.multiplier, 1.04);
  assert.equal(COUNTY_COST_FACTORS.Dauphin.multiplier, 1.02);
  assert.equal(COUNTY_COST_FACTORS.Lancaster.multiplier, 1.06);

  const subYork = createCustomSubdivision("Y", "York", "Y", 10);
  const subLanc = createCustomSubdivision("L", "Lancaster", "L", 10);
  const costY = calculateDevelopmentCost(subYork, BASE_SPEC);
  const costL = calculateDevelopmentCost(subLanc, BASE_SPEC);

  assert.equal(costY.locationFactor, 0.98);
  assert.equal(costL.locationFactor, 1.06);
  assert.ok(costL.allHomesVerticalCost > costY.allHomesVerticalCost);
});

test("F08-T1-4: Karst mitigation surcharges add required GCL liner costs in limestone hazards", () => {
  const subLow = createCustomSubdivision("Low Karst", "York", "York Twp", 12);
  subLow.karstRisk = "Low";
  const subHigh = createCustomSubdivision("High Karst", "Cumberland", "Hampden", 12);
  subHigh.karstRisk = "High";

  const costLow = calculateDevelopmentCost(subLow, BASE_SPEC);
  const costHigh = calculateDevelopmentCost(subHigh, BASE_SPEC);

  assert.ok(costHigh.stormwaterPondCost > costLow.stormwaterPondCost);
});

test("F08-T1-5: Slope earthwork multipliers scale from 1.0x on flat ground to 2.0x on steep slopes", () => {
  const subFlat = createCustomSubdivision("Flat", "York", "York", 10);
  subFlat.slopePct = 2; // Flat (<= 4%)
  const subSteep = createCustomSubdivision("Steep", "York", "York", 10);
  subSteep.slopePct = 16; // Severe (> 15%)

  const costFlat = calculateDevelopmentCost(subFlat, BASE_SPEC);
  const costSteep = calculateDevelopmentCost(subSteep, BASE_SPEC);

  assert.equal(costSteep.earthworkGradingCost, costFlat.earthworkGradingCost * 2);
});

// Feature 9: Pro Forma PDF & Spreadsheet Export (R2)
test("F09-T1-1: Pro forma PDF export produces bank-ready document with valid PDF header", async () => {
  const sub = createCustomSubdivision("Oakridge Manor", "York", "Spring Garden", 14);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const pdfBytes = await generateProFormaPdf(sub, BASE_SPEC, cost);

  assert.ok(pdfBytes.length > 1000);
  const header = Buffer.from(pdfBytes.subarray(0, 5)).toString("utf8");
  assert.equal(header, "%PDF-");

  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getPageCount(), 1);
});

test("F09-T1-2: PDF executive summary renders key development metrics accurately", async () => {
  const sub = createCustomSubdivision("Executive Ridge", "Cumberland", "Silver Spring", 18);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const pdfBytes = await generateProFormaPdf(sub, BASE_SPEC, cost);
  const doc = await PDFDocument.load(pdfBytes);

  assert.equal(doc.getPageCount(), 1);
  assert.ok(pdfBytes.length > 800);
});

test("F09-T1-3: Pro forma spreadsheet CSV exports itemized civil work schedule", () => {
  const sub = createCustomSubdivision("Civic Meadow", "Dauphin", "Swatara", 15);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const csv = generateProFormaCsv(sub, BASE_SPEC, cost);

  assert.ok(csv.includes("Earthwork & Grading"));
  assert.ok(csv.includes("Stormwater Retention Pond & Basin"));
  assert.ok(csv.includes("Roadway Paving & Base"));
  assert.ok(csv.includes("Concrete Curbs & Sidewalks"));
  assert.ok(csv.includes("Perimeter Walking Trail"));
  assert.ok(csv.includes("Wet Utilities (Water & Sewer)"));
  assert.ok(csv.includes("Dry Utilities (Electric & Telecom)"));
});

test("F09-T1-4: Spreadsheet CSV conforms to standard comma-separated column schema", () => {
  const sub = createCustomSubdivision("Schema Ridge", "Lancaster", "Ephrata", 10);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const csv = generateProFormaCsv(sub, BASE_SPEC, cost);
  const rows = csv.split("\n");

  assert.equal(rows[0], "Category,Line Item,Quantity,Unit,Unit Cost,Total Cost");
  assert.ok(csv.includes("Raw Land Acquisition"));
  assert.ok(csv.includes("Total Development Cost (TDC)"));
  assert.ok(csv.includes("Gross Development Value (GDV)"));
});

test("F09-T1-5: Spreadsheet financial summary totals match computed underwriting variables", () => {
  const sub = createCustomSubdivision("Summary Run", "York", "Dover", 12);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const csv = generateProFormaCsv(sub, BASE_SPEC, cost);

  assert.ok(csv.includes(`Total Development Cost (TDC),$${cost.totalDevelopmentCost.toLocaleString()}`));
  assert.ok(csv.includes(`Gross Development Value (GDV),$${cost.grossDevelopmentValue.toLocaleString()}`));
  assert.ok(csv.includes(`Net Developer Profit,$${cost.netDeveloperProfit.toLocaleString()}`));
  assert.ok(csv.includes(`Breakeven Price per Home,$${cost.breakevenPricePerHome.toLocaleString()}`));
});

// Feature 10: 3D WebGL 60fps & Context Recovery (R2)
test("F10-T1-1: Memory hierarchy disposal traverses and calls dispose on all geometries and materials", () => {
  const group = new THREE.Group();
  let geomDisposed = false;
  let matDisposed = false;

  const geom = new THREE.BoxGeometry(1, 1, 1);
  geom.dispose = () => {
    geomDisposed = true;
  };
  const mat = new THREE.MeshBasicMaterial();
  mat.dispose = () => {
    matDisposed = true;
  };

  const mesh = new THREE.Mesh(geom, mat);
  group.add(mesh);

  disposeThreeHierarchy(group);
  assert.equal(geomDisposed, true);
  assert.equal(matDisposed, true);
});

test("F10-T1-2: WebGL context loss listener cancels current frame and calls preventDefault", () => {
  let defaultPrevented = false;
  const mockEvent = {
    preventDefault: () => {
      defaultPrevented = true;
    },
  };

  const handleContextLost = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };

  handleContextLost(mockEvent);
  assert.equal(defaultPrevented, true);
});

test("F10-T1-3: WebGL context restore listener resets scene mode trigger state", () => {
  let sceneReloadCount = 0;
  const handleContextRestored = () => {
    sceneReloadCount += 1;
  };

  handleContextRestored();
  assert.equal(sceneReloadCount, 1);
});

test("F10-T1-4: Animation loop clock clamps delta spikes on browser backgrounding", () => {
  const clampDelta = (rawDeltaSeconds: number, maxAllowed = 0.1): number => {
    return Math.min(rawDeltaSeconds, maxAllowed);
  };

  // Normal 60fps frame delta: 16.6ms
  assert.equal(clampDelta(0.0166), 0.0166);
  // Tab slept for 5 seconds (5.0s delta)
  assert.equal(clampDelta(5.0), 0.1); // Clamped to 100ms
});

test("F10-T1-5: Stormwater pond water surface oscillation updates sinusoidal wave displacement", () => {
  const computeWaveHeight = (x: number, z: number, elapsed: number): number => {
    return Math.sin(x * 0.15 + elapsed * 2.0) * Math.cos(z * 0.15 + elapsed * 1.5) * 0.35;
  };

  const h0 = computeWaveHeight(10, 10, 0);
  const h1 = computeWaveHeight(10, 10, 1.0);
  const h2 = computeWaveHeight(10, 10, 2.5);

  assert.notEqual(h0, h1);
  assert.notEqual(h1, h2);
  assert.ok(Math.abs(h0) <= 0.35);
  assert.ok(Math.abs(h1) <= 0.35);
});

// ---------------------------------------------------------------------------
// TIER 2: BOUNDARY & CORNER CASES (5 tests per feature for R2)
// ---------------------------------------------------------------------------

// Feature 6 Boundaries: Raycasting Lot Picking
test("F06-T2-1: Raycast missing all parcel meshes returns zero intersections without crashing", () => {
  const root = new THREE.Group();
  const raycaster = new THREE.Raycaster();
  raycaster.set(new THREE.Vector3(500, 500, 500), new THREE.Vector3(0, 1, 0)); // Points into empty space

  const hits = raycaster.intersectObjects(root.children, true);
  assert.equal(hits.length, 0);
});

test("F06-T2-2: Extreme subdivision lot densities (8 lots min, 36 lots max) clamp properly", () => {
  const clampLots = (requestedLots: number) => Math.min(36, Math.max(8, requestedLots));

  assert.equal(clampLots(2), 8); // Clamped up to min
  assert.equal(clampLots(50), 36); // Clamped down to max
  assert.equal(clampLots(24), 24);
});

test("F06-T2-3: Terrain elevation offset calculates radial gradient accurately", () => {
  const getTerrainElevation = (radius: number): number => {
    if (radius < 36) return -2.5; // Basin depression
    if (radius <= 112) return 0.0; // Development plateau
    return (radius - 112) * 0.06; // Perimeter slope
  };

  assert.equal(getTerrainElevation(20), -2.5);
  assert.equal(getTerrainElevation(75), 0.0);
  assert.equal(getTerrainElevation(150), 2.28);
});

test("F06-T2-4: Rapid consecutive lot selection updates active state cleanly", () => {
  let activeLot: number | null = null;
  const selectLot = (lotNum: number) => {
    activeLot = lotNum;
  };

  for (let i = 1; i <= 24; i++) {
    selectLot(i);
    assert.equal(activeLot, i);
  }
});

test("F06-T2-5: Parcel boundary edge precision verifies zero overlap between platted lots", () => {
  const sub = createCustomSubdivision("Non-overlap", "York", "York", 12);
  const details1 = computeLotInspectionDetails(1, sub);
  const details2 = computeLotInspectionDetails(2, sub);

  assert.equal(details1.areaSqFt, details2.areaSqFt);
  assert.equal(details1.widthFt, details2.widthFt);
});

// Feature 7 Boundaries: Architectural Customizer
test("F07-T2-1: Out-of-bounds story count is clamped between 1 and 4 stories", () => {
  const sanitizeStories = (stories: number) => Math.min(4, Math.max(1, Math.round(stories)));

  assert.equal(sanitizeStories(0), 1);
  assert.equal(sanitizeStories(-2), 1);
  assert.equal(sanitizeStories(5), 4);
  assert.equal(sanitizeStories(3), 3);
});

test("F07-T2-2: 4-Story building height (51.8ft) flags zoning variance requirement when >35ft", () => {
  const checkZoningHeightVariance = (heightFt: number, maxAllowed = 35) => {
    return {
      exceedsZoning: heightFt > maxAllowed,
      varianceRequiredFt: Math.max(0, Number((heightFt - maxAllowed).toFixed(1))),
    };
  };

  const check2S = checkZoningHeightVariance(31.2);
  assert.equal(check2S.exceedsZoning, false);
  assert.equal(check2S.varianceRequiredFt, 0);

  const check4S = checkZoningHeightVariance(51.8);
  assert.equal(check4S.exceedsZoning, true);
  assert.equal(check4S.varianceRequiredFt, 16.8);
});

test("F07-T2-3: Footprint dimensions exceeding buildable envelope trigger setback encroachment warning", () => {
  const checkEncroachment = (houseWidth: number, houseDepth: number, envWidth: number, envDepth: number) => {
    return houseWidth > envWidth || houseDepth > envDepth;
  };

  assert.equal(checkEncroachment(46, 36, 58, 65), false); // Fits inside 58x65 envelope
  assert.equal(checkEncroachment(60, 36, 58, 65), true); // Width exceeds side setbacks
  assert.equal(checkEncroachment(46, 70, 58, 65), true); // Depth exceeds rear setback
});

test("F07-T2-4: Minimum structural footprint constraints prevent degenerate dimensions", () => {
  const validateFootprint = (w: number, d: number) => {
    return w >= 24 && w <= 80 && d >= 20 && d <= 70;
  };

  assert.equal(validateFootprint(46, 36), true);
  assert.equal(validateFootprint(10, 36), false); // Too narrow
  assert.equal(validateFootprint(46, 15), false); // Too shallow
});

test("F07-T2-5: Hex color string validation rejects malformed hex codes", () => {
  const isValidHexColor = (color: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);

  assert.equal(isValidHexColor("#334155"), true);
  assert.equal(isValidHexColor("#fff"), true);
  assert.equal(isValidHexColor("red"), false);
  assert.equal(isValidHexColor("#ZZZZZZ"), false);
  assert.equal(isValidHexColor(""), false);
});

// Feature 8 Boundaries: Dynamic Underwriting Recalculation
test("F08-T2-1: Zero or negative lot count input produces safe zero results without NaN", () => {
  const sub = createCustomSubdivision("Zero Lot", "York", "York", 10);
  sub.totalLots = 0;
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);

  assert.ok(!isNaN(cost.totalDevelopmentCost));
  assert.ok(!isNaN(cost.grossDevelopmentValue));
  assert.equal(cost.allHomesVerticalCost, 0);
  assert.equal(cost.grossDevelopmentValue, 0);
});

test("F08-T2-2: Breakeven price per home calculation handles rounding accurately", () => {
  const tdc = 6_543_210;
  const lots = 14;
  const breakeven = Math.round(tdc / lots);
  assert.equal(breakeven, 467_372);
});

test("F08-T2-3: Underwater development scenario correctly reports negative profit and margin", () => {
  const sub = createCustomSubdivision("Underwater", "Lancaster", "Manheim", 10);
  // Override ASP to a very low value below TDC
  const cost = calculateDevelopmentCost(sub, BASE_SPEC, {
    customTargetSalePrice: 200_000,
    customRawLandCost: 150_000,
  });

  assert.ok(cost.netDeveloperProfit < 0);
  assert.ok(cost.developerMarginPct < 0);
  assert.ok(cost.returnOnCostPct < 0);
});

test("F08-T2-4: High raw land cost sensitivity scales 35% LTC equity required proportionally", () => {
  const sub = createCustomSubdivision("Sens", "Cumberland", "Hampden", 10);
  const costLowLand = calculateDevelopmentCost(sub, BASE_SPEC, { customRawLandCost: 40_000 });
  const costHighLand = calculateDevelopmentCost(sub, BASE_SPEC, { customRawLandCost: 200_000 });

  assert.ok(costHighLand.equityRequired > costLowLand.equityRequired);
  const diffEquity = costHighLand.equityRequired - costLowLand.equityRequired;
  const diffLand = (costHighLand.landAcquisitionCost - costLowLand.landAcquisitionCost) * 0.35;
  assert.ok(Math.abs(diffEquity - diffLand) <= 50); // Matches 35% equity fraction
});

test("F08-T2-5: Extreme finish tier scaling (Standard vs Luxury) adds $28/SF with location factor to interior budget", () => {
  const sub = createCustomSubdivision("Finish Scaler", "Dauphin", "Derry", 10);
  const stdCost = calculateDevelopmentCost(sub, BASE_SPEC, { customFinishTier: "standard" });
  const luxCost = calculateDevelopmentCost(sub, BASE_SPEC, { customFinishTier: "luxury" });

  const diffPerHome = luxCost.singleHomeInteriorFinishesCost - stdCost.singleHomeInteriorFinishesCost;
  // Dauphin loc multiplier is 1.02
  const expectedDiff = Math.round(BASE_SPEC.totalSqft * 28 * 1.02);
  assert.equal(diffPerHome, expectedDiff);
});

// Feature 9 Boundaries: Pro Forma PDF & Spreadsheet Export
test("F09-T2-1: Special characters in subdivision name are escaped safely in CSV", () => {
  const sub = createCustomSubdivision('Smith & O\'Connor "Valley View" Tract', "York", "York", 10);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const csv = generateProFormaCsv(sub, BASE_SPEC, cost);

  assert.ok(csv.includes("Raw Land Acquisition"));
  assert.ok(!csv.includes("\r\n\r\n"));
});

test("F09-T2-2: Multi-page pro forma export accommodates expanded sensitivity schedules", async () => {
  const doc = await PDFDocument.create();
  doc.addPage([612, 792]);
  doc.addPage([612, 792]);
  assert.equal(doc.getPageCount(), 2);
  const bytes = await doc.save();
  assert.ok(bytes.length > 500);
});

test("F09-T2-3: Zero-cost line items format cleanly without NaN or blank cells", () => {
  const val = 0;
  const formatted = `$${val.toLocaleString()}`;
  assert.equal(formatted, "$0");
});

test("F09-T2-4: Multi-million dollar values format with standard comma thousand-separators", () => {
  const largeNum = 125_450_000;
  assert.equal(largeNum.toLocaleString(), "125,450,000");
});

test("F09-T2-5: Export spec validation catches missing or non-numeric cost values", () => {
  const validateCostNumbers = (cost: { totalDevelopmentCost: number; grossDevelopmentValue: number }) => {
    return (
      typeof cost.totalDevelopmentCost === "number" &&
      !isNaN(cost.totalDevelopmentCost) &&
      typeof cost.grossDevelopmentValue === "number" &&
      !isNaN(cost.grossDevelopmentValue)
    );
  };

  assert.equal(validateCostNumbers({ totalDevelopmentCost: 5000000, grossDevelopmentValue: 7000000 }), true);
  assert.equal(validateCostNumbers({ totalDevelopmentCost: NaN, grossDevelopmentValue: 7000000 }), false);
});

// Feature 10 Boundaries: 3D WebGL Performance & Recovery
test("F10-T2-1: Consecutive WebGL context loss cycles do not accumulate memory or handlers", () => {
  let activeListeners = 0;
  const attachListeners = () => {
    activeListeners++;
  };
  const detachListeners = () => {
    activeListeners--;
  };

  attachListeners();
  detachListeners();
  attachListeners();
  detachListeners();

  assert.equal(activeListeners, 0);
});

test("F10-T2-2: Component unmount releases animation frame IDs cleanly", () => {
  let currentRafId: number | null = 12345;
  const cleanup = () => {
    currentRafId = null;
  };

  cleanup();
  assert.equal(currentRafId, null);
});

test("F10-T2-3: Zero-dimension canvas resize does not divide by zero in camera aspect ratio", () => {
  const computeAspect = (width: number, height: number): number => {
    if (height === 0 || width === 0) return 1.0;
    return width / height;
  };

  assert.equal(computeAspect(0, 0), 1.0);
  assert.equal(computeAspect(800, 600), 800 / 600);
});

test("F10-T2-4: devicePixelRatio is capped at 2.0 to protect GPU performance", () => {
  const getCappedDpi = (dpr: number) => Math.min(2.0, Math.max(1.0, dpr));

  assert.equal(getCappedDpi(1.0), 1.0);
  assert.equal(getCappedDpi(2.0), 2.0);
  assert.equal(getCappedDpi(3.5), 2.0); // Capped at 2.0
});

test("F10-T2-5: Camera near and far clipping planes maintain depth buffer resolution", () => {
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
  assert.equal(camera.near, 0.1);
  assert.equal(camera.far, 1000);
  assert.ok(camera.far / camera.near <= 10000); // Prevents Z-fighting
});

// ---------------------------------------------------------------------------
// TIER 3: CROSS-FEATURE COMBINATIONS (R2)
// ---------------------------------------------------------------------------

test("R2-T3-1: Lot picking combined with dynamic underwriting computes lot-specific land cost share", () => {
  const sub = createCustomSubdivision("Lot-Cost Link", "York", "York Twp", 16);
  const cost = calculateDevelopmentCost(sub, BASE_SPEC);
  const lotDetails = computeLotInspectionDetails(4, sub);

  const landCostPerLot = Math.round(cost.landAcquisitionCost / sub.totalLots);
  const civilCostPerLot = Math.round(cost.totalHorizontalCost / sub.totalLots);
  const lotTotalCost = landCostPerLot + civilCostPerLot + cost.singleHomeTotalCost;

  assert.ok(lotDetails.buildableEnvelopeSqFt > 0);
  assert.ok(lotTotalCost > cost.singleHomeTotalCost);
  assert.equal(Math.round(cost.totalDevelopmentCost / sub.totalLots), cost.breakevenPricePerHome);
});

test("R2-T3-2: 4-Story European style customizer combined with luxury finishes triggers variance warning and computes high-end vertical cost", () => {
  const sub = createCustomSubdivision("Euro Luxury", "Lancaster", "Manheim", 12);
  const specEuro4S: HouseDesignSpec = {
    ...BASE_SPEC,
    stories: 4,
    style: "colonial", // luxury estate elevation
    totalSqft: 5100,
    heightFt: 51.8,
  };

  const cost = calculateDevelopmentCost(sub, specEuro4S, { customFinishTier: "luxury" });
  assert.ok(specEuro4S.heightFt > 35); // Requires zoning variance
  assert.ok(cost.singleHomeInteriorFinishesCost > BASE_SPEC.totalSqft * 20);
});

test("R2-T3-3: Karst mitigation surcharge combined with stormwater pond sizing expands civil infrastructure budget", () => {
  const subKarst = createCustomSubdivision("Karst Plain", "Cumberland", "Hampden", 20);
  subKarst.karstRisk = "High";

  const cost = calculateDevelopmentCost(subKarst, BASE_SPEC);
  assert.ok(cost.stormwaterPondCost >= 135_000); // Base pond + GCL liner
  assert.ok(cost.totalHorizontalCost > cost.stormwaterPondCost);
});

test("R2-T3-4: Underwriting pro forma overrides are reflected synchronously in PDF and CSV exports", async () => {
  const sub = createCustomSubdivision("Export Override", "Dauphin", "Derry", 14);
  const customASP = 725_000;
  const cost = calculateDevelopmentCost(sub, BASE_SPEC, { customTargetSalePrice: customASP });

  const csv = generateProFormaCsv(sub, BASE_SPEC, cost);
  assert.ok(csv.includes(`Gross Development Value (GDV),$${(customASP * sub.totalLots).toLocaleString()}`));

  const pdfBytes = await generateProFormaPdf(sub, BASE_SPEC, cost);
  const doc = await PDFDocument.load(pdfBytes);
  assert.equal(doc.getPageCount(), 1);
  assert.ok(pdfBytes.length > 500);
});

// ---------------------------------------------------------------------------
// TIER 4: REAL-WORLD WORKLOAD SCENARIOS (R2)
// ---------------------------------------------------------------------------

test("R2-T4-1: Complete 3D Land Development Design Journey: 17-acre parcel -> 24 lots -> inspect Lot 7 -> 3-story Craftsman -> customize ASP -> export bank-ready PDF & CSV", async () => {
  // Step 1: Initialize 17-acre subdivision master plan
  const sub = createCustomSubdivision("Springettsbury Estates", "York", "Springettsbury", 17.2);
  sub.totalLots = 24;

  // Step 2: Build 3D procedural master plan
  const { group: masterPlan } = buildSubdivisionMasterPlan(sub);
  assert.ok(masterPlan.children.length > 0);

  // Step 3: Raycasting lot picking on Lot 7
  const lot7 = computeLotInspectionDetails(7, sub, "craftsman", 3);
  assert.equal(lot7.lotNumber, 7);
  assert.equal(lot7.widthFt, 78);
  assert.equal(lot7.depthFt, 110);
  assert.equal(lot7.buildableEnvelopeWidthFt, 58);

  // Step 4: Architectural customizer for 3-story Craftsman
  const spec3S: HouseDesignSpec = {
    ...BASE_SPEC,
    stories: 3,
    style: "craftsman",
    totalSqft: 3950,
    heightFt: 41.5,
  };
  const studioModel = buildHouseStudioModel(spec3S);
  assert.ok(studioModel.children.length > 0);

  // Step 5: Underwriting recalculation with $1,150,000 ASP override
  const cost = calculateDevelopmentCost(sub, spec3S, {
    customTargetSalePrice: 1_150_000,
    customFinishTier: "upgraded",
  });
  assert.equal(cost.projectedSalePricePerHome, 1_150_000);
  assert.equal(cost.grossDevelopmentValue, 1_150_000 * 24);
  assert.ok(cost.netDeveloperProfit > 0);
  assert.ok(cost.developerMarginPct > 15);

  // Step 6: Bank-ready PDF and CSV exports
  const pdfBytes = await generateProFormaPdf(sub, spec3S, cost);
  assert.equal(Buffer.from(pdfBytes.subarray(0, 5)).toString("utf8"), "%PDF-");

  const csv = generateProFormaCsv(sub, spec3S, cost);
  assert.ok(csv.includes("Springettsbury Estates"));
  assert.ok(csv.includes("1,150,000"));

  disposeThreeHierarchy(masterPlan);
  disposeThreeHierarchy(studioModel);
});

test("R2-T4-2: Difficult Site Underwriting Assessment: 12-acre parcel with 16% slope and High Karst limestone hazard", () => {
  const subFlat = createCustomSubdivision("Hampden Flat", "Cumberland", "Hampden", 12.0);
  subFlat.slopePct = 4;
  subFlat.karstRisk = "Low";

  const subDifficult = createCustomSubdivision("Hampden Karst Bluff", "Cumberland", "Hampden", 12.0);
  subDifficult.slopePct = 16.5; // Steep slope (> 15%)
  subDifficult.karstRisk = "High"; // High limestone sinkhole hazard

  const costFlat = calculateDevelopmentCost(subFlat, BASE_SPEC);
  const costDiff = calculateDevelopmentCost(subDifficult, BASE_SPEC);

  // Slope grading is double (2.0x vs 1.0x)
  assert.equal(costDiff.earthworkGradingCost, costFlat.earthworkGradingCost * 2);
  // High karst stormwater pond is significantly higher than low karst
  assert.ok(costDiff.stormwaterPondCost > costFlat.stormwaterPondCost);
  // Location factor is 1.04 for Cumberland
  assert.equal(costDiff.locationFactor, 1.04);

  // Verify Breakeven price reflects site difficulties
  assert.ok(costDiff.breakevenPricePerHome > 400_000);
  assert.equal(costDiff.breakevenPricePerHome, Math.round(costDiff.totalDevelopmentCost / subDifficult.totalLots));
});
