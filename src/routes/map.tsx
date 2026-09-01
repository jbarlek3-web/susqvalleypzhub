import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { MapPanel, MapToolbar } from "@/components/map/map-panel";
import { ParcelMap } from "@/components/map/parcel-map";
import { ProvenanceBadge } from "@/components/brand/provenance-badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEEDED_PARCEL_BUILDABLE } from "@/lib/data/derived-layers";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  const [panel, setPanel] = useState(true);
  return (
    <AppShell fullBleed>
      <div className="flex h-[calc(100dvh-5rem)] md:h-[calc(100dvh-5rem)]">
        <div
          className={cn(
            "shrink-0 overflow-hidden border-r border-outline-variant bg-card transition-all",
            panel ? "w-full max-w-md md:w-[22rem]" : "w-0",
          )}
        >
          {panel && <MapPanel />}
        </div>
        <div className="relative min-w-0 flex-1">
          <ParcelMap className="h-full" />
          <MapToolbar />
          <div className="pointer-events-none absolute right-3 top-3 z-[400] flex max-w-sm flex-col gap-1">
            <ProvenanceBadge status="sample-demo" />
            <ProvenanceBadge status="derived" lineage={SEEDED_PARCEL_BUILDABLE} />
          </div>
          <Button
            size="icon"
            variant="outline"
            className="absolute left-3 top-3 z-[400] bg-card"
            onClick={() => setPanel((v) => !v)}
            aria-label="Toggle layers"
          >
            <PanelLeft />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
