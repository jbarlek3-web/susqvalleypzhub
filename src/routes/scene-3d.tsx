import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { HouseModelViewer, DEFAULT_HOUSE_SPEC } from "@/components/scene-3d/HouseModelViewer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Waves,
  Home,
  DollarSign,
  FileText,
  Download,
  Mountain,
  Droplets,
  HardHat,
  Palette,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { PARCELS } from "@/lib/data/parcels";
import { calculateDevelopmentCost } from "@/lib/subdivision/cost-estimator";
import { resolveAddressOrParcel } from "@/lib/subdivision/address-resolver";
import type {
  ArchitectureStyle,
  CostBreakdown,
  FacadeMaterial,
  HouseDesignSpec,
  InteriorFlooring,
  InteriorWallColor,
  RoofMaterial,
  StudioSceneMode,
  StudioViewLevel,
} from "@/lib/subdivision/types";

export interface Scene3DSearch {
  parcelId?: string;
}

export const Route = createFileRoute("/scene-3d")({
  validateSearch: (search: Record<string, unknown>): Scene3DSearch => ({
    parcelId: typeof search.parcelId === "string" ? search.parcelId : undefined,
  }),
  component: Scene3DPage,
});

type ActiveTab = "Studio3D" | "ZoningRestrictions" | "SpecDesign" | "UnderwritingCost";

function money(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function Scene3DPage() {
  const search = Route.useSearch();
  // 1. Location & Parcel Selection State
  const [selectedParcelId, setSelectedParcelId] = useState<string>(
    () => search.parcelId || "p-hampden",
  );
  const [customAddressQuery, setCustomAddressQuery] = useState<string>("");

  const activeProfile = useMemo(() => {
    return resolveAddressOrParcel(customAddressQuery.trim() || selectedParcelId);
  }, [selectedParcelId, customAddressQuery]);

  const subdivisionConfig = activeProfile.subdivision;

  // 2. 3D Scene Mode State
  const [sceneMode, setSceneMode] = useState<StudioSceneMode>("subdivision");
  const [activeTab, setActiveTab] = useState<ActiveTab>("Studio3D");

  // 3. 3D House Design Spec State
  const [houseSpec, setHouseSpec] = useState<HouseDesignSpec>({
    ...DEFAULT_HOUSE_SPEC,
    stories: 2,
    totalSqft: 2900,
    sqftPerStory: 1450,
    heightFt: 31.2,
  });

  // Story Changer Helper
  const handleSetStories = (stories: 1 | 2 | 3 | 4) => {
    let sqft = 1850;
    let height = 19.5;
    if (stories === 2) {
      sqft = 2900;
      height = 31.2;
    } else if (stories === 3) {
      sqft = 3950;
      height = 41.5;
    } else if (stories === 4) {
      sqft = 5100;
      height = 51.8;
    }
    setHouseSpec((prev) => {
      let viewLevel = prev.viewLevel;
      if (viewLevel === "story4" && stories < 4) viewLevel = "exterior";
      if (viewLevel === "story3" && stories < 3) viewLevel = "exterior";
      if (viewLevel === "story2" && stories < 2) viewLevel = "exterior";
      return {
        ...prev,
        stories,
        totalSqft: sqft,
        sqftPerStory: Math.round(sqft / stories),
        heightFt: height,
        viewLevel,
      };
    });
  };

  // 4. Cost Estimator & Pro Forma State
  const [customFinishTier, setCustomFinishTier] = useState<"standard" | "upgraded" | "luxury">(
    "upgraded"
  );
  const [customTargetSalePrice, setCustomTargetSalePrice] = useState<number>(0);
  const [customLandCostPerAcre, setCustomLandCostPerAcre] = useState<number>(0);

  const costBreakdown: CostBreakdown = useMemo(() => {
    return calculateDevelopmentCost(subdivisionConfig, houseSpec, {
      customTargetSalePrice: customTargetSalePrice > 0 ? customTargetSalePrice : undefined,
      customRawLandCost: customLandCostPerAcre > 0 ? customLandCostPerAcre : undefined,
      customFinishTier,
    });
  }, [subdivisionConfig, houseSpec, customFinishTier, customTargetSalePrice, customLandCostPerAcre]);

  // Height & Zoning Checks
  const isHeightExceeded = houseSpec.heightFt > subdivisionConfig.maxZoningHeight;
  const isCoverageCompliant =
    (houseSpec.footprintWidthFt * houseSpec.footprintDepthFt) /
      ((subdivisionConfig.grossAcres * 43560) / subdivisionConfig.totalLots) <=
    subdivisionConfig.maxLotCoverage / 100;

  // Export Spec & Underwriting Report
  const handleExportReport = () => {
    const reportData = {
      title: "Field ACQ Land Development Spec Design & Underwriting Report",
      generatedAt: new Date().toISOString(),
      location: {
        address: subdivisionConfig.address,
        parcelId: subdivisionConfig.parcelId,
        municipality: subdivisionConfig.municipality,
        county: subdivisionConfig.county,
        zoningCode: subdivisionConfig.zoningCode,
        zoningDistrict: subdivisionConfig.zoningName,
      },
      landDevelopmentMetrics: {
        grossAcres: subdivisionConfig.grossAcres,
        totalLots: subdivisionConfig.totalLots,
        centralStormwaterPondAcreage: subdivisionConfig.pondAcreage,
        openSpaceAcreage: subdivisionConfig.openSpaceAcreage,
        roadLengthLinearFt: subdivisionConfig.roadLengthLinearFt,
        slopePercentage: subdivisionConfig.slopePct,
        floodZone: subdivisionConfig.floodZone,
        karstLimestoneRisk: subdivisionConfig.karstRisk,
      },
      specHouseDesign: {
        stories: houseSpec.stories,
        architecturalStyle: houseSpec.style,
        facadeMaterial: houseSpec.facadeMaterial,
        roofMaterial: houseSpec.roofMaterial,
        garageBays: houseSpec.garageBays,
        totalSqft: houseSpec.totalSqft,
        totalHeightFt: houseSpec.heightFt,
        interiorFlooring: houseSpec.flooring,
        interiorWallPalette: houseSpec.wallColor,
      },
      underwritingAndCostEngine: costBreakdown,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `underwriting-spec-report-${subdivisionConfig.parcelId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell fullBleed>
      <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-background text-foreground">
        {/* Top Control & Location Selector Bar */}
        <div className="border-b border-border bg-card/75 px-4 py-3 md:px-6 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground">
                    Subdivision Master Plan & 3D Design Studio
                  </h1>
                  <Badge
                    variant="outline"
                    className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30"
                  >
                    <Waves className="w-3 h-3 mr-1" />
                    Central Pond
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    PA SALDO
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/10 text-primary border-primary/30"
                  >
                    Cost Engine
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Full subdivision layout with central retention pond, multi-story architectural
                  design studio, zoning & topography restriction analysis, and location-tied
                  underwriting.
                </p>
              </div>
            </div>

            {/* Address / Parcel Selector */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border">
                <MapPin className="w-3.5 h-3.5 text-primary ml-1.5" />
                <select
                  aria-label="Select Pennsylvania regional parcel"
                  value={selectedParcelId}
                  onChange={(e) => {
                    setSelectedParcelId(e.target.value);
                    setCustomAddressQuery("");
                  }}
                  className="bg-transparent text-xs font-medium text-foreground py-1 pr-2 outline-none cursor-pointer"
                >
                  <optgroup label="Cumberland County">
                    {PARCELS.filter((p) => p.county === "Cumberland").map((p) => (
                      <option key={p.id} value={p.id} className="bg-popover text-foreground">
                        {p.address} ({p.municipality})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="York County">
                    {PARCELS.filter((p) => p.county === "York").map((p) => (
                      <option key={p.id} value={p.id} className="bg-popover text-foreground">
                        {p.address} ({p.municipality})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Dauphin County">
                    {PARCELS.filter((p) => p.county === "Dauphin").map((p) => (
                      <option key={p.id} value={p.id} className="bg-popover text-foreground">
                        {p.address} ({p.municipality})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Lancaster County">
                    {PARCELS.filter((p) => p.county === "Lancaster").map((p) => (
                      <option key={p.id} value={p.id} className="bg-popover text-foreground">
                        {p.address} ({p.municipality})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Custom Search Input */}
              <div className="w-48 hidden sm:block">
                <Input
                  type="text"
                  placeholder="Or custom PA address..."
                  value={customAddressQuery}
                  onChange={(e) => setCustomAddressQuery(e.target.value)}
                  className="h-8 text-xs bg-muted/60"
                />
              </div>

              {/* Mode Toggle Button */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => setSceneMode("subdivision")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    sceneMode === "subdivision"
                      ? "bg-orange-500/30 text-orange-300 border border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Waves className="w-3.5 h-3.5 text-orange-400" />
                  <span>Subdivision</span>
                </button>
                <button
                  onClick={() => setSceneMode("houseStudio")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    sceneMode === "houseStudio"
                      ? "bg-orange-500/30 text-orange-300 border border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-orange-400" />
                  <span>House Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location Metrics Banner */}
        <div className="bg-card/40 border-b border-border px-4 py-2 md:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="text-muted-foreground">Location:</span>
              <span>{subdivisionConfig.address}</span>
              <span className="text-muted-foreground">({subdivisionConfig.municipality}, {subdivisionConfig.county} Co.)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Zoning:</span>
              <Badge variant="outline" className="text-[11px] font-semibold text-primary">
                {subdivisionConfig.zoningCode}
              </Badge>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Gross Area:</span>
              <span className="font-semibold">{subdivisionConfig.grossAcres} Acres</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Lot Yield:</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                {subdivisionConfig.totalLots} Platted Lots
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-muted-foreground">Slope:</span>
              <span className="font-semibold">{subdivisionConfig.slopePct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-muted-foreground">Flood:</span>
              <span className="font-semibold">Zone {subdivisionConfig.floodZone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-muted-foreground">Karst:</span>
              <span className="font-semibold">{subdivisionConfig.karstRisk}</span>
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 p-3 md:p-6 flex flex-col gap-6">
          {/* 3D Canvas Host Container with Error Boundary */}
          <div className="w-full h-[660px]">
            <ErrorBoundary
              fallback={({ reset }) => (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-lg">
                  <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-3">
                    <AlertTriangle className="size-8" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    3D Scene Engine Interrupted
                  </h3>
                  <p className="max-w-md text-xs text-muted-foreground mt-1 mb-4">
                    An unexpected graphics or WebGL issue occurred while rendering the 3D model. You can retry loading the scene or continue using the Spec Design Sheet and Underwriting Cost Estimator tabs below.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={reset} className="gap-1.5 text-xs">
                      <RotateCcw className="size-3.5" /> Retry 3D Scene
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setActiveTab("SpecDesign")}
                      className="text-xs"
                    >
                      View Spec Design Sheet
                    </Button>
                  </div>
                </div>
              )}
            >
              <HouseModelViewer
                parcelId={subdivisionConfig.parcelId}
                address={subdivisionConfig.address}
                zoningDistrict={subdivisionConfig.zoningName}
                subdivisionConfig={subdivisionConfig}
                houseSpec={houseSpec}
                onHouseSpecChange={setHouseSpec}
                sceneMode={sceneMode}
                onSceneModeChange={setSceneMode}
                onSelectLot={(_lotNum) => {
                  setSceneMode("houseStudio");
                }}
              />
            </ErrorBoundary>
          </div>

          {/* Sub-Workspaces & Tools Tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("Studio3D")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "Studio3D"
                      ? "bg-orange-500/30 text-orange-300 border border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                      : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-orange-400" />
                  <span>3D Design Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab("ZoningRestrictions")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "ZoningRestrictions"
                      ? "bg-orange-500/30 text-orange-300 border border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                      : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Zoning & Topography</span>
                </button>

                <button
                  onClick={() => setActiveTab("SpecDesign")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "SpecDesign"
                      ? "bg-orange-500/30 text-orange-300 border border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                      : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  <span>Spec Design Sheet</span>
                </button>

                <button
                  onClick={() => setActiveTab("UnderwritingCost")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "UnderwritingCost"
                      ? "bg-orange-500/30 text-orange-300 border border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                      : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cost Estimator & Underwriting</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportReport}
                  className="text-xs h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Export Spec & Underwriting Report (JSON)
                </Button>
              </div>
            </div>

            {/* TAB 1: 3D DESIGN STUDIO CONTROLS */}
            {activeTab === "Studio3D" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Multi-Story Builder */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2.5">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-primary" />
                        Multi-Story Builder
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {houseSpec.stories} {houseSpec.stories === 1 ? "Story" : "Stories"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSetStories(s as 1 | 2 | 3 | 4)}
                          className={`py-2 text-center rounded-md font-bold transition-all border ${
                            houseSpec.stories === s
                              ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                          }`}
                        >
                          {s}F
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-border">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total Living Area:</span>
                        <span className="font-semibold text-foreground">
                          {houseSpec.totalSqft.toLocaleString()} SF
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Height to Peak:</span>
                        <span
                          className={`font-semibold ${
                            isHeightExceeded ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {houseSpec.heightFt}&apos; / {subdivisionConfig.maxZoningHeight}&apos; Max
                        </span>
                      </div>
                      {isHeightExceeded && (
                        <div className="p-2 rounded bg-red-500/10 text-red-600 border border-red-500/20 text-[11px] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Exceeds zoning max height! Variance required.</span>
                        </div>
                      )}
                    </div>

                    {/* View Level / Cutaway Selector */}
                    <div className="pt-2 border-t border-border space-y-1.5">
                      <span className="text-muted-foreground font-semibold block">
                        Cutaway & Floor Mode:
                      </span>
                      <select
                        aria-label="Select cutaway and floor view level"
                        value={houseSpec.viewLevel}
                        onChange={(e) =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            viewLevel: e.target.value as StudioViewLevel,
                          }))
                        }
                        className="w-full p-1.5 rounded border border-border bg-background text-foreground"
                      >
                        <option value="exterior">Full Exterior Shell</option>
                        <option value="dollhouse">Dollhouse Open Cutaway</option>
                        <option value="story1">Level 1 Interior Floor Plan</option>
                        {houseSpec.stories >= 2 && (
                          <option value="story2">Level 2 Interior Floor Plan</option>
                        )}
                        {houseSpec.stories >= 3 && (
                          <option value="story3">Level 3 Bonus / Loft Floor Plan</option>
                        )}
                        {houseSpec.stories >= 4 && (
                          <option value="story4">Level 4 Sky Lounge Floor Plan</option>
                        )}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Exterior Facade & Materials */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2.5">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-primary" />
                      Exterior Finishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">
                        Architectural Style:
                      </span>
                      <select
                        aria-label="Select architectural style"
                        value={houseSpec.style}
                        onChange={(e) =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            style: e.target.value as ArchitectureStyle,
                          }))
                        }
                        className="w-full p-1.5 rounded border border-border bg-background text-foreground capitalize"
                      >
                        <option value="craftsman">Craftsman Style</option>
                        <option value="colonial">Colonial Revival</option>
                        <option value="modernFarmhouse">Modern Farmhouse</option>
                        <option value="contemporary">Contemporary Minimalist</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">
                        Facade Masonry / Siding:
                      </span>
                      <select
                        aria-label="Select facade masonry or siding material"
                        value={houseSpec.facadeMaterial}
                        onChange={(e) =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            facadeMaterial: e.target.value as FacadeMaterial,
                          }))
                        }
                        className="w-full p-1.5 rounded border border-border bg-background text-foreground"
                      >
                        <option value="brick">Running Bond Red-Brown Brick</option>
                        <option value="stone">Pennsylvania Fieldstone Masonry</option>
                        <option value="siding">Horizontal Cream Lap Siding</option>
                        <option value="boardAndBatten">Modern Board & Batten</option>
                        <option value="stucco">Contemporary Greige Stucco</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">
                        Roof Material:
                      </span>
                      <select
                        aria-label="Select roof material"
                        value={houseSpec.roofMaterial}
                        onChange={(e) =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            roofMaterial: e.target.value as RoofMaterial,
                          }))
                        }
                        className="w-full p-1.5 rounded border border-border bg-background text-foreground"
                      >
                        <option value="shingle">Weathered Dark Charcoal Shingle</option>
                        <option value="slate">Architectural Welsh Slate</option>
                        <option value="standingSeam">Standing Seam Metal Roof</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">
                        Garage Bays:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((g) => (
                          <button
                            key={g}
                            onClick={() =>
                              setHouseSpec((prev) => ({
                                ...prev,
                                garageBays: g as 1 | 2 | 3,
                              }))
                            }
                            className={`py-1 rounded border text-center font-semibold ${
                              houseSpec.garageBays === g
                                ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                                : "bg-muted/40 border-border text-muted-foreground"
                            }`}
                          >
                            {g} Car
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border space-y-1.5">
                      <span className="text-muted-foreground font-medium block">
                        Architectural Additions:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setHouseSpec((prev) => ({ ...prev, hasPorch: !prev.hasPorch }))}
                          className={`py-1 px-2 rounded border text-center font-semibold transition-all ${
                            houseSpec.hasPorch
                              ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                              : "bg-muted/40 border-border text-muted-foreground"
                          }`}
                        >
                          {houseSpec.hasPorch ? "✓ Porch" : "+ Porch"}
                        </button>
                        <button
                          onClick={() => setHouseSpec((prev) => ({ ...prev, hasPatio: !prev.hasPatio }))}
                          className={`py-1 px-2 rounded border text-center font-semibold transition-all ${
                            houseSpec.hasPatio
                              ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                              : "bg-muted/40 border-border text-muted-foreground"
                          }`}
                        >
                          {houseSpec.hasPatio ? "✓ Patio" : "+ Patio"}
                        </button>
                        <button
                          onClick={() =>
                            houseSpec.stories >= 2 &&
                            setHouseSpec((prev) => ({ ...prev, hasBalcony: !prev.hasBalcony }))
                          }
                          disabled={houseSpec.stories < 2}
                          className={`py-1 px-2 rounded border text-center font-semibold transition-all ${
                            houseSpec.hasBalcony && houseSpec.stories >= 2
                              ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                              : "bg-muted/40 border-border text-muted-foreground"
                          } ${houseSpec.stories < 2 ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {houseSpec.hasBalcony && houseSpec.stories >= 2 ? "✓ Balcony" : "+ Balcony (2F+)"}
                        </button>
                        <button
                          onClick={() => setHouseSpec((prev) => ({ ...prev, hasBayTurret: !prev.hasBayTurret }))}
                          className={`py-1 px-2 rounded border text-center font-semibold transition-all ${
                            houseSpec.hasBayTurret
                              ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                              : "bg-muted/40 border-border text-muted-foreground"
                          }`}
                        >
                          {houseSpec.hasBayTurret ? "✓ Turret" : "+ Turret"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Interior Finishes & Furniture */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2.5">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-primary" />
                      Interior Finishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">
                        Flooring Finish:
                      </span>
                      <select
                        aria-label="Select interior flooring finish"
                        value={houseSpec.flooring}
                        onChange={(e) =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            flooring: e.target.value as InteriorFlooring,
                          }))
                        }
                        className="w-full p-1.5 rounded border border-border bg-background text-foreground"
                      >
                        <option value="oak">White Oak Hardwood Plank</option>
                        <option value="herringbone">European Herringbone Parquet</option>
                        <option value="walnut">Rich Dark American Walnut</option>
                        <option value="tile">Porcelain Marble Slab Tile</option>
                        <option value="lvp">Luxury Engineered Vinyl Plank</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">
                        Interior Wall Tone:
                      </span>
                      <select
                        aria-label="Select interior wall paint tone"
                        value={houseSpec.wallColor}
                        onChange={(e) =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            wallColor: e.target.value as InteriorWallColor,
                          }))
                        }
                        className="w-full p-1.5 rounded border border-border bg-background text-foreground"
                      >
                        <option value="alabaster">Warm Alabaster (Sherwin 7008)</option>
                        <option value="greige">Modern Greige / Agreeable Gray</option>
                        <option value="navy">Hale Navy Feature Accent</option>
                        <option value="sage">Botanical Sage Green</option>
                      </select>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-muted-foreground">3D Staging Furniture:</span>
                      <button
                        onClick={() =>
                          setHouseSpec((prev) => ({
                            ...prev,
                            furnished: !prev.furnished,
                          }))
                        }
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          houseSpec.furnished
                            ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {houseSpec.furnished ? "Furnished" : "Unfurnished"}
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Subdivision Master Infrastructure */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2.5">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-primary" />
                      Subdivision Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Stormwater Pond:</span>
                      <span className="font-semibold text-sky-600">
                        {subdivisionConfig.pondAcreage} Ac ({subdivisionConfig.pondRadiusFt}&apos; rad)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Aeration Fountain:</span>
                      <span className="font-semibold text-emerald-600">Active Spray Nozzle</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Walking Trail:</span>
                      <span className="font-semibold text-foreground">Loop Trail + Benches</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Streetlight Network:</span>
                      <span className="font-semibold text-foreground">Post-Top Lanterns</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Dedicated Open Space:</span>
                      <span className="font-semibold text-foreground">
                        {subdivisionConfig.openSpaceAcreage} Ac (
                        {(
                          (subdivisionConfig.openSpaceAcreage / subdivisionConfig.grossAcres) *
                          100
                        ).toFixed(0)}
                        %)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 2: ZONING & TOPOGRAPHY RESTRICTIONS */}
            {activeTab === "ZoningRestrictions" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dimensional Zoning Invariants */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Municipal Zoning Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                      <div className="font-semibold text-foreground">
                        {subdivisionConfig.zoningName}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        Jurisdiction: {subdivisionConfig.municipality} (SALDO & Zoning Ordinance)
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-border">
                        <span className="text-muted-foreground">Front Yard Setback:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{subdivisionConfig.setbacks.front}&apos; min</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border">
                        <span className="text-muted-foreground">Side Yard Setback:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{subdivisionConfig.setbacks.side}&apos; min</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border">
                        <span className="text-muted-foreground">Rear Yard Setback:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{subdivisionConfig.setbacks.rear}&apos; min</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border">
                        <span className="text-muted-foreground">Max Building Height:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{subdivisionConfig.maxZoningHeight}&apos; max</span>
                          {isHeightExceeded ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Max Lot Coverage:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{subdivisionConfig.maxLotCoverage}%</span>
                          {isCoverageCompliant ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Topography & Soil Constraints */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-emerald-600" />
                      <span>Topography & Grading Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Average Slope Grade:</span>
                      <span className="font-semibold">{subdivisionConfig.slopePct}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">PA SALDO Slope Category:</span>
                      <span className="font-semibold text-foreground">
                        {subdivisionConfig.slopePct > 15
                          ? "Steep Slope (>15% Conservation)"
                          : subdivisionConfig.slopePct > 8
                          ? "Moderate Slope (8-15%)"
                          : "Gentle / Favorable (0-8%)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Grading & Earthwork:</span>
                      <span className="font-semibold">
                        {subdivisionConfig.slopePct > 15
                          ? "Engineered benching & silt fencing"
                          : "Balanced on-site cut & fill"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">FEMA Floodplain Status:</span>
                      <span
                        className={`font-semibold ${
                          subdivisionConfig.floodZone === "AE" ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        Zone {subdivisionConfig.floodZone}{" "}
                        {subdivisionConfig.floodZone === "X"
                          ? "(Minimal Flood Hazard)"
                          : "(Floodplain Fringe)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Karst Limestone Geology:</span>
                      <span
                        className={`font-semibold ${
                          subdivisionConfig.karstRisk === "High"
                            ? "text-amber-600"
                            : "text-foreground"
                        }`}
                      >
                        {subdivisionConfig.karstRisk} Risk{" "}
                        {subdivisionConfig.karstRisk !== "Low"
                          ? "(GCL pond liner required)"
                          : "(Standard basin)"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Infrastructure & Utilities Connections */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-sky-600" />
                      <span>Infrastructure & Utility Capacity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="space-y-2">
                      <div className="p-2 rounded bg-muted/40 border border-border">
                        <span className="text-muted-foreground font-medium block">
                          Potable Water Service:
                        </span>
                        <span className="font-semibold text-foreground">
                          {subdivisionConfig.utilities.water}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border border-border">
                        <span className="text-muted-foreground font-medium block">
                          Sanitary Sewer Service:
                        </span>
                        <span className="font-semibold text-foreground">
                          {subdivisionConfig.utilities.sewer}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border border-border">
                        <span className="text-muted-foreground font-medium block">
                          Electric Service:
                        </span>
                        <span className="font-semibold text-foreground">
                          {subdivisionConfig.utilities.electric}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border border-border">
                        <span className="text-muted-foreground font-medium block">
                          Natural Gas Service:
                        </span>
                        <span className="font-semibold text-foreground">
                          {subdivisionConfig.utilities.gas}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 3: SPEC DESIGN SHEET */}
            {activeTab === "SpecDesign" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>Architectural Spec Sheet: Residential Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Building Footprint:</span>
                        <span className="font-bold text-sm">
                          {houseSpec.footprintWidthFt}&apos; W × {houseSpec.footprintDepthFt}&apos; D
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Total Finished SF:</span>
                        <span className="font-bold text-sm text-primary">
                          {houseSpec.totalSqft.toLocaleString()} Sq. Ft.
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Story Configuration:</span>
                        <span className="font-bold text-sm">
                          {houseSpec.stories} {houseSpec.stories === 1 ? "Story" : "Stories"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Ridge Peak Elevation:</span>
                        <span className="font-bold text-sm">{houseSpec.heightFt}&apos; Above Grade</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border space-y-2">
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Facade Material:</span>
                        <span className="font-semibold capitalize">{houseSpec.facadeMaterial}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Roof Style & System:</span>
                        <span className="font-semibold capitalize">{houseSpec.roofMaterial}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Garage Capacity:</span>
                        <span className="font-semibold">{houseSpec.garageBays}-Car Integrated</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Primary Flooring:</span>
                        <span className="font-semibold capitalize">{houseSpec.flooring}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Interior Wall Palette:</span>
                        <span className="font-semibold capitalize">{houseSpec.wallColor}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Waves className="w-4 h-4 text-sky-600" />
                      <span>Land Development Master Plan Specs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Gross Parcel Tract:</span>
                        <span className="font-bold text-sm">{subdivisionConfig.grossAcres} Acres</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Platted Lot Count:</span>
                        <span className="font-bold text-sm text-sky-600">
                          {subdivisionConfig.totalLots} Building Lots
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Central Pond Basin:</span>
                        <span className="font-bold text-sm text-primary">
                          {subdivisionConfig.pondAcreage} Ac / {subdivisionConfig.pondRadiusFt}&apos;
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <span className="text-muted-foreground block">Dedicated Open Space:</span>
                        <span className="font-bold text-sm">
                          {subdivisionConfig.openSpaceAcreage} Acres
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border space-y-2">
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Paved Street Network:</span>
                        <span className="font-semibold">
                          {subdivisionConfig.roadLengthLinearFt.toLocaleString()} LF (28&apos; Curb to Curb)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Sidewalks & Trails:</span>
                        <span className="font-semibold">5&apos; Concrete + Pond Perimeter Loop</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Stormwater Management:</span>
                        <span className="font-semibold">
                          PA DEP Chapter 102 E&S & NPDES Phase II Wet Retention
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Community Amenities:</span>
                        <span className="font-semibold">Aeration Fountain, Park Benches & Trail</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 4: COST ESTIMATOR & UNDERWRITING ENGINE */}
            {activeTab === "UnderwritingCost" && (
              <div className="flex flex-col gap-4">
                {/* Underwriting Sensitivity & Assumptions Panel */}
                <Card className="shadow-sm border-primary/20 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-2.5">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Sliders className="w-4 h-4" />
                        Underwriting Assumptions & Sensitivity Model
                      </span>
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {costBreakdown.locationName}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-muted-foreground font-medium block mb-1">
                          Finish Quality Tier:
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          {(["standard", "upgraded", "luxury"] as const).map((tier) => (
                            <button
                              key={tier}
                              onClick={() => setCustomFinishTier(tier)}
                              className={`py-1.5 px-2 rounded border text-center font-semibold capitalize transition-all ${
                                customFinishTier === tier
                                  ? "bg-orange-500/30 text-orange-300 border-orange-500/50 backdrop-blur-md shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-medium block mb-1">
                          Target Sale Price (ASP) / Home:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            placeholder={`${costBreakdown.projectedSalePricePerHome}`}
                            value={customTargetSalePrice || ""}
                            onChange={(e) => setCustomTargetSalePrice(Number(e.target.value))}
                            className="h-8 text-xs bg-background"
                          />
                          {customTargetSalePrice > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCustomTargetSalePrice(0)}
                              className="h-8 px-2 text-xs text-muted-foreground"
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground font-medium block mb-1">
                          Land Acquisition Cost ($/Acre):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            placeholder={`${costBreakdown.landCostPerAcre}`}
                            value={customLandCostPerAcre || ""}
                            onChange={(e) => setCustomLandCostPerAcre(Number(e.target.value))}
                            className="h-8 text-xs bg-background"
                          />
                          {customLandCostPerAcre > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCustomLandCostPerAcre(0)}
                              className="h-8 px-2 text-xs text-muted-foreground"
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Executive Underwriting Pro Forma KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground block">
                      Total Development Cost (TDC)
                    </span>
                    <div className="text-xl font-bold text-foreground mt-1">
                      {money(costBreakdown.totalDevelopmentCost)}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {money(costBreakdown.breakevenPricePerHome)} per lot all-in
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground block">
                      Gross Development Value (GDV)
                    </span>
                    <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                      {money(costBreakdown.grossDevelopmentValue)}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {costBreakdown.projectedSalePricePerHome.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}{" "}
                      avg. ASP
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground block">
                      Net Developer Profit
                    </span>
                    <div className="text-xl font-bold text-emerald-600 mt-1">
                      {money(costBreakdown.netDeveloperProfit)}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {costBreakdown.developerMarginPct}% Gross Margin
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground block">
                      Return on Cost (ROC) & Multiple
                    </span>
                    <div className="text-xl font-bold text-primary mt-1">
                      {costBreakdown.returnOnCostPct}% ROC
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">
                      {costBreakdown.equityMultiple}x Equity Multiple
                    </span>
                  </div>
                </div>

                {/* Detailed Itemized Development Cost Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Horizontal Civil Work */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2.5">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <HardHat className="w-4 h-4 text-sky-600" />
                          Horizontal Civil & Site Development
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {money(costBreakdown.totalHorizontalCost)} Civil Works
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex justify-between items-center mb-1">
                        <div>
                          <span className="font-semibold block text-foreground">
                            Raw Land Acquisition:
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {subdivisionConfig.grossAcres} Acres @ {money(costBreakdown.landCostPerAcre)} / Ac
                          </span>
                        </div>
                        <span className="font-bold text-sm text-foreground">
                          {money(costBreakdown.landAcquisitionCost)}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Clearing, Earthwork & Grading:</span>
                        <span className="font-semibold">{money(costBreakdown.earthworkGradingCost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Central Retention Pond & Fountain:</span>
                        <span className="font-semibold text-sky-600">
                          {money(costBreakdown.stormwaterPondCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Paved Streets & Asphalt Topping:</span>
                        <span className="font-semibold">{money(costBreakdown.roadwayPavingCost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Concrete Curbs & Sidewalks:</span>
                        <span className="font-semibold">{money(costBreakdown.curbsAndSidewalksCost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Walking Trail Around Pond:</span>
                        <span className="font-semibold">
                          {money(costBreakdown.walkingTrailAndAmenitiesCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Water, Sewer & Storm Infrastructure:</span>
                        <span className="font-semibold">
                          {money(costBreakdown.waterSewerInfrastructureCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Dry Utilities (Electric/Gas/Fiber):</span>
                        <span className="font-semibold">
                          {money(costBreakdown.dryUtilitiesTrenchingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Street Trees & Open Space Landscaping:</span>
                        <span className="font-semibold">
                          {money(costBreakdown.landscapingStreetTreesCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border font-semibold text-foreground">
                        <span>Civil Engineering, NPDES & Permitting:</span>
                        <span>{money(costBreakdown.civilEngineeringAndPermitsCost)}</span>
                      </div>

                      <div className="pt-2 flex justify-between py-1 font-semibold text-sky-600">
                        <span>Horizontal Civil Subtotal ({subdivisionConfig.totalLots} Lots):</span>
                        <span>{money(costBreakdown.totalHorizontalCost)} ({money(costBreakdown.horizontalCostPerLot)}/lot)</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vertical Construction & Pro Forma */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2.5">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-primary" />
                          Vertical Spec House Build-out
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {money(costBreakdown.allHomesVerticalCost)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex justify-between items-center mb-2">
                        <div>
                          <span className="font-semibold block text-foreground">
                            Per Single Spec Home Cost:
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {costBreakdown.singleHomeCostPerSqft} / SF ({houseSpec.totalSqft} SF)
                          </span>
                        </div>
                        <span className="font-bold text-sm text-primary">
                          {money(costBreakdown.singleHomeTotalCost)}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Excavation & Foundation:</span>
                        <span className="font-semibold">
                          {money(costBreakdown.singleHomeFoundationCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Framing & Structural Envelope:</span>
                        <span className="font-semibold">{money(costBreakdown.singleHomeFramingCost)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Exterior Facade & Roofing:</span>
                        <span className="font-semibold">
                          {money(costBreakdown.singleHomeExteriorFinishesCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Interior Drywall & Finishes:</span>
                        <span className="font-semibold">
                          {money(costBreakdown.singleHomeInteriorFinishesCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Plumbing, HVAC & Electrical (MEP):</span>
                        <span className="font-semibold">{money(costBreakdown.singleHomeMEPCost)}</span>
                      </div>

                      <div className="pt-2 border-t border-border flex justify-between py-1 font-semibold text-foreground">
                        <span>Total Vertical ({subdivisionConfig.totalLots} Homes):</span>
                        <span>{money(costBreakdown.allHomesVerticalCost)}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mt-2 space-y-1">
                        <div className="flex justify-between font-semibold text-primary">
                          <span>Required Equity (35%):</span>
                          <span>{money(costBreakdown.equityRequired)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-[11px]">
                          <span>Construction Financing (65% LTC):</span>
                          <span>{money(costBreakdown.totalDevelopmentCost * 0.65)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
