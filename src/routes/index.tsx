import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileStack,
  Gavel,
  Layers,
  Map as MapIcon,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { REGIONAL_DOCUMENT_COVERAGE } from "@/lib/data/regional-document-coverage";
import { useHub } from "@/lib/store";
import type { County } from "@/lib/types";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { lookupYorkAddress } from "@/lib/york-lookup";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [q, setQ] = useState("");
  const setQuery = useHub((s) => s.setQuery);
  const setLookupBusy = useHub((s) => s.setLookupBusy);
  const setLookupResult = useHub((s) => s.setLookupResult);
  const nav = useNavigate();
  const { user, isPending } = useCurrentUserState();

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-xl border border-outline-variant border-t-4 border-t-brand-lime bg-card px-5 py-12 md:px-12 md:py-16">
        <div className="relative mx-auto max-w-3xl text-center">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-20 max-w-[300px]" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Field intelligence for land and ordinance research
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Make the next acquisition decision with confidence.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-lg">
            Field ACQ Ordinance Aide brings zoning codes, property maps, and builder documentation
            together for York, Cumberland, Dauphin, and Lancaster counties.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (isPending) return;
              if (!user) {
                nav({ to: "/login" });
                return;
              }
              setQuery(q);
              if (q.trim().length >= 4) {
                setLookupBusy(true);
                void lookupYorkAddress({ data: { q: q.trim() } })
                  .then((res) => {
                    if (res.ok) setLookupResult(res.result);
                    else setLookupResult(null, res.error);
                  })
                  .catch(() => setLookupResult(null, "Lookup failed. Try again."));
              }
              nav({ to: "/map" });
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="York County address — live parcel + zoning"
                className="h-12 bg-card pl-9 text-on-surface"
                autoComplete="off"
                suppressHydrationWarning
              />
            </div>
            <Button type="submit" size="lg" className="h-12">
              Explore Map
            </Button>
          </form>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <Stat n="72" l="York municipalities" />
            <Stat
              n={REGIONAL_DOCUMENT_COVERAGE.sourceRecords.toLocaleString()}
              l="Regional source records"
            />
            <Stat n={REGIONAL_DOCUMENT_COVERAGE.saldoRecords.toLocaleString()} l="SALDO records" />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Covering 4 Counties</h2>
          <Link
            to="/insights"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-container"
          >
            View Regional Overview <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CountyCard name="York" blurb="Comprehensive zoning & tax parcel records." to="/map" />
          <CountyCard
            name="Cumberland"
            blurb="Development tracking and municipal codes."
            to="/map"
          />
          <CountyCard
            name="Dauphin"
            blurb="Interactive parcel layers and historic overlays."
            to="/map"
          />
          <CountyCard
            name="Lancaster"
            blurb="Agricultural zoning and urban growth boundaries."
            to="/map"
          />
        </div>
      </section>

      <section className="mt-12">
        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Platform Capabilities
        </p>
        <h2 className="mt-1 text-2xl font-semibold">
          Integrated Tools for Planners, Developers, and Municipalities
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Feature
            icon={Layers}
            title="Interactive Property Map"
            body="Visualize zoning districts, floodplain overlays, and individual parcel boundaries across county lines."
            href="/map"
            cta="Launch GIS Map"
          />
          <Feature
            icon={Gavel}
            title="Unified Zoning Codes"
            body="Search and cross-reference municipal zoning ordinances in a standardized format. Track amendments instantly."
            href="/zoning"
            extra={
              <div className="mt-3 rounded-md bg-surface-low p-3 font-mono text-xs">
                <div>Sec 402.1 — R-1 Residential</div>
                <div className="text-on-surface-variant">
                  Max Height: 35ft · Min Lot: 10,000 sqft
                </div>
              </div>
            }
          />
          <Feature
            icon={FileStack}
            title="Builder Documentation"
            body="Access standardized application forms, fee schedules, and review checklists for municipal submissions."
            href="/documents"
          />
          <Feature
            icon={Database}
            title="API & Data Export"
            body="Export comprehensive parcel reports in CSV, PDF, or GeoJSON. Integrate planning data into your firm's systems."
            href="/guide"
            cta="View Documentation"
          />
          <Feature
            icon={Gavel}
            title="Acquisition Toolkit"
            body="Lot yield, residual land offer, York SALDO path, diligence checklists, and York Home Depot material prices."
            href="/acquire"
            cta="Open toolkit"
          />
        </div>
      </section>

      <section className="mt-12 grid items-center gap-8 rounded-xl border border-outline-variant bg-card p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-2xl font-semibold">Professional Access</h2>
          <p className="mt-2 text-muted-foreground">
            Unlock the full potential of regional data. Join municipal officials, developers, and
            surveyors who rely on Field ACQ Ordinance Aide for integrated land-use intelligence.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "High-volume live York parcel and zoning lookups.",
              "AI-assisted parcel feasibility briefs.",
              "Guided Pro print and export workflow.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-secondary" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <Card className="border-primary-container/30">
          <CardContent className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-secondary">
              Most Popular
            </div>
            <div className="mt-1 text-lg font-semibold">Pro Subscription</div>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-bold">$10</span>
              <span className="mb-1 text-muted-foreground">/mo</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Billed annually at $120/year.</p>
            <Button asChild className="mt-4 w-full">
              <Link to="/subscription">Subscribe Now</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Municipal accounts eligible for group licensing.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-primary md:text-3xl">{n}</div>
      <div className="text-xs uppercase tracking-wider text-on-surface-variant">{l}</div>
    </div>
  );
}

function CountyCard({ name, blurb, to }: { name: string; blurb: string; to: string }) {
  const setCounty = useHub((s) => s.setCounty);
  return (
    <Link
      to={to}
      onClick={() => setCounty(name as County)}
      className="rounded-lg border border-outline-variant bg-card p-4 transition-colors hover:border-primary-container"
    >
      <div className="flex items-center gap-2 font-semibold">
        <MapIcon className="size-4 text-primary-container" /> {name}
      </div>
      <p className="mt-2 text-sm leading-snug text-muted-foreground">{blurb}</p>
    </Link>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
  href,
  cta,
  extra,
}: {
  icon: typeof Layers;
  title: string;
  body: string;
  href: string;
  cta?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-card p-5">
      <Icon className="size-6 text-primary-container" />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {extra}
      <Link
        to={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-container"
      >
        {cta ?? "Open"} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
