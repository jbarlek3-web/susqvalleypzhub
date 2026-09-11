import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { HouseModelViewer } from "@/components/scene-3d/HouseModelViewer";
import {
  Building2,
  CheckCircle2,
  Maximize2,
  Ruler,
  ShieldCheck,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scene-3d")({ component: Scene3DPage });

function Scene3DPage() {
  return (
    <AppShell fullBleed>
      <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-background text-foreground">
        {/* Top Control & Title Bar */}
        <div className="border-b border-border bg-card/60 px-4 py-3 md:px-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground">
                    3D Hyperrealistic Architectural Model
                  </h1>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Poly Haven PBR
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    WebGL 3D
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Faithfully reconstructed 2-story residential estate with brick lower facade, cream lap siding, octagonal bay turret, covered porch, and backyard patio.
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/60 border border-border">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground">Zoning Setbacks:</span>
                <span className="font-semibold text-emerald-600">Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/60 border border-border">
                <Ruler className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-muted-foreground">Height:</span>
                <span className="font-semibold">31.2&apos; / 35&apos; Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3D Canvas Area */}
        <div className="flex-1 p-3 md:p-6 flex flex-col gap-4">
          <div className="flex-1 w-full min-h-[680px]">
            <HouseModelViewer
              parcelId="67-000-04-0112.00-00000"
              address="482 Country Club Road, York PA 17403"
              zoningDistrict="R-1 Low-Density Residential (Spring Garden Twp)"
            />
          </div>

          {/* Architectural Analysis & Specification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Elevation & Exterior Features */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Architectural Facade Details</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• <strong>Lower Level</strong>: Red-brown running bond brick masonry with 1K normal and roughness maps.</li>
                <li>• <strong>Upper Level</strong>: Cream horizontal lap siding with realistic shadow lines.</li>
                <li>• <strong>Center Feature</strong>: 2-story faceted octagonal bay turret with 6 double-hung multi-pane windows.</li>
                <li>• <strong>Front Porch</strong>: Classical white columns, balustrade railing, and eyebrow arched roof dormer.</li>
              </ul>
            </div>

            {/* Rear & Site Landscaping */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Rear Patio & Grounds</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• <strong>Backyard Patio</strong>: Brushed concrete paver terrace with outdoor dining and covered BBQ grill.</li>
                <li>• <strong>Garden Trellis</strong>: White arched garden arbor gate framing the rear landscaping bed.</li>
                <li>• <strong>Perimeter</strong>: Gothic-pointed white vinyl picket perimeter fencing.</li>
                <li>• <strong>Grounds</strong>: PBR turf lawn, front asphalt/concrete driveway, and foundation boxwoods.</li>
              </ul>
            </div>

            {/* Zoning Compliance Invariants */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Municipal Ordinance Verification</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• <strong>Front Yard Setback</strong>: 25.0&apos; required; actual structure at 27.4&apos; (Compliant).</li>
                <li>• <strong>Side Yard Setback</strong>: 10.0&apos; required; actual garage wing at 14.2&apos; (Compliant).</li>
                <li>• <strong>Rear Yard Setback</strong>: 30.0&apos; required; patio complies with accessory setbacks.</li>
                <li>• <strong>Building Height</strong>: 35.0&apos; maximum; chimney peak at 33.4&apos; (Compliant).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
