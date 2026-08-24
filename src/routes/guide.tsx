import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/guide")({ component: Guide });

function Guide() {
  return (
    <AppShell>
      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        Welcome to the Planning Hub
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Master the Hub in 5 Steps</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Learn how to navigate the interactive property map, analyze site constraints, and generate
        zoning reports for regional development projects.
      </p>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <Link to="/map">Go to Map</Link>
        </Button>
      </div>
      <ol className="mt-8 grid gap-4">
        <Step n={1} t="Property Search & Map Navigation">
          Locate parcels with the global search bar using address, owner name, or APN. Click any
          parcel for ownership and zoning summary. Use +/- or scroll to zoom.
        </Step>
        <Step n={2} t="Layer Customization">
          Toggle zoning districts, flood projections, utilities, and topography. Stack datasets to
          identify opportunities and constraints.
        </Step>
        <Step n={3} t="Site Analysis & Constraints">
          Net buildable area subtracts setbacks, easements, and unbuildable slopes based on local
          codes. Example: 45,000 sf gross − 12,500 setbacks = 32,500 sf net.
        </Step>
        <Step n={4} t="Project Management">
          Multi-select parcels (batch mode), compare zoning and ROI, then save to the Project
          Dashboard.
        </Step>
        <Step n={5} t="Data Export">
          Export PDF reports and document packets. Pro unlocks unlimited downloads after the 5-minute
          preview.
        </Step>
        <Step n={6} t="Acquisition toolkit">
          Run lot yield and residual offer math, screen a tract, walk York County SALDO (sketch to
          final plat), and pull York Home Depot material prices. Search a York address on the map
          to load live YCPC parcel and zoning.
        </Step>
      </ol>
    </AppShell>
  );
}

function Step({ n, t, children }: { n: number; t: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-semibold text-on-primary">
          {n}
        </div>
        <div>
          <h2 className="font-semibold">{t}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{children}</p>
        </div>
      </CardContent>
    </Card>
  );
}
