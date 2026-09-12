import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Box,
  CheckCircle2,
  ContactRound,
  Gavel,
  Layers,
  Map as MapIcon,
  Search,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      <section className="relative overflow-hidden rounded-2xl border border-outline-variant/80 border-t-4 border-t-brand-lime bg-card/90 px-5 py-12 shadow-[0_4px_24px_rgb(17_40_71/0.06)] backdrop-blur-md md:px-12 md:py-16">
        {/* Ambient top glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[650px] rounded-full bg-gradient-to-b from-brand-lime/15 via-secondary/10 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-20 max-w-[300px]" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Field intelligence for land and ordinance research
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Make the next acquisition decision with confidence.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-lg">
            Field ACQ Ordinance Aide brings zoning research, property maps, official-source
            directories, and a private AI reference library together for York, Cumberland, Dauphin,
            and Lancaster counties.
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
                id="home-address-search"
                name="address"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="York County address — live parcel + zoning"
                aria-label="Search a York County address"
                className="h-12 rounded-xl bg-card pl-9 text-on-surface focus:ring-2 focus:ring-secondary/40"
                autoComplete="off"
                suppressHydrationWarning
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-xl">
              Explore Map
            </Button>
          </form>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <Stat n="4" l="Core counties" />
            <Stat n="72" l="York municipalities" />
            <Stat n="67" l="PA county contacts" />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Covering 4 Counties</h2>
          <Link
            to="/insights"
            preload="intent"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Platform Capabilities
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Integrated Tools for Planners, Developers, and Municipalities
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={Box}
            title="3D Hyperrealistic Parcel Model"
            badge="Live WebGL"
            body="Inspect photorealistic 3D residential structures with architectural day/night lighting, real material textures, and measurement calipers."
            href="/scene-3d"
            cta="Launch 3D Viewer"
          />
          <Feature
            icon={Layers}
            title="Interactive Property Map"
            body="Visualize zoning districts, floodplain overlays, and individual parcel boundaries across county lines."
            href="/map"
            cta="Launch Property Map"
          />
          <Feature
            icon={Gavel}
            title="Unified Zoning Codes"
            body="Search and cross-reference municipal zoning ordinances in a standardized format. Track amendments instantly."
            href="/zoning"
            extra={
              <div className="mt-3 rounded-md bg-surface-low p-3 font-mono text-xs border border-outline-variant/60">
                <div className="font-semibold text-primary">Sec 402.1 — R-1 Residential</div>
                <div className="text-on-surface-variant">
                  Max Height: 35ft · Min Lot: 10,000 sqft
                </div>
              </div>
            }
          />
          <Feature
            icon={Bot}
            title="Ordinance Aide Agent"
            body="Ask municipality-specific zoning and development questions against the private Field ACQ reference corpus."
            href="/aide"
            cta="Ask Ordinance Aide"
          />
          <Feature
            icon={ContactRound}
            title="PA Planning & Zoning Directory"
            body="Find planning departments, zoning contacts, phone numbers, email addresses, and official county websites statewide."
            href="/directory"
            cta="Open Directory"
          />
          <Feature
            icon={Gavel}
            title="Acquisition Toolkit"
            body="Lot yield, residual land offer, York SALDO path, and diligence checklists."
            href="/acquire"
            cta="Open Toolkit"
          />
        </div>
      </section>

      <section className="mt-12 grid items-center gap-8 rounded-2xl border border-outline-variant/80 bg-card/90 p-6 shadow-sm backdrop-blur md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-2xl font-semibold">Professional Access</h2>
          <p className="mt-2 text-muted-foreground">
            Unlock the full potential of regional data for developers, contractors, realtors, and
            surveyors who rely on Field ACQ Ordinance Aide for integrated land-use intelligence.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "High-volume live York parcel and zoning lookups.",
              "AI-assisted parcel feasibility briefs.",
              "Direct links to official municipal and county websites.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-secondary" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <Card className="interactive-card border-primary-container/30">
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
            <Button asChild className="mt-4 w-full active-press">
              <Link to="/subscription" preload="intent">Subscribe Now</Link>
            </Button>
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
      preload="intent"
      onClick={() => setCounty(name as County)}
      className="interactive-card active-press block rounded-xl border border-outline-variant/80 bg-card/90 p-4 transition-all hover:border-brand-teal hover:shadow-md"
    >
      <div className="flex items-center gap-2 font-semibold">
        <MapIcon className="size-4 text-primary" /> {name}
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
  badge,
}: {
  icon: typeof Layers;
  title: string;
  body: string;
  href: string;
  cta?: string;
  extra?: ReactNode;
  badge?: string;
}) {
  return (
    <div className="interactive-card flex flex-col justify-between rounded-xl border border-outline-variant/80 bg-card/90 p-5 shadow-sm transition-all hover:border-brand-teal">
      <div>
        <div className="flex items-center justify-between">
          <Icon className="size-6 text-primary" />
          {badge && (
            <span className="inline-flex items-center rounded-full bg-brand-lime/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        {extra}
      </div>
      <Link
        to={href}
        preload="intent"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {cta ?? "Open"} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
