import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { COUNTIES } from "@/lib/data/catalog";
import { ZONING_CODES } from "@/lib/data/zoning";
import {
  GEN_ZONE_COLORS,
  YORK_MUNICIPALITIES,
  YORK_ZONING_DISTRICTS,
  dimLabel,
  prettyMuni,
  useFlags,
  type YorkZoningDistrict,
} from "@/lib/data/york-zoning";
import type { County } from "@/lib/types";

export const Route = createFileRoute("/zoning")({ component: Zoning });

function Zoning() {
  const [q, setQ] = useState("");
  const [muni, setMuni] = useState("All");
  const [gcode, setGcode] = useState("All");
  const [county, setCounty] = useState<"All" | County>("York");

  const gcodes = useMemo(() => {
    const set = new Set(YORK_ZONING_DISTRICTS.map((d) => d.gcode).filter(Boolean));
    return ["All", ...[...set].sort()];
  }, []);

  const yorkList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return YORK_ZONING_DISTRICTS.filter((d) => {
      if (muni !== "All" && d.muni !== muni) return false;
      if (gcode !== "All" && d.gcode !== gcode) return false;
      if (!needle) return true;
      return `${d.muni} ${d.zcode} ${d.zname} ${d.gname}`.toLowerCase().includes(needle);
    });
  }, [q, muni, gcode]);

  const otherCodes = useMemo(
    () =>
      ZONING_CODES.filter((c) => county === "All" || c.county === county).filter(
        (c) =>
          !q.trim() ||
          `${c.section} ${c.municipality} ${c.summary}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, county],
  );

  const showYork = county === "All" || county === "York";

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">York County Zoning Districts</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {YORK_ZONING_DISTRICTS.length} live districts across {YORK_MUNICIPALITIES.length}{" "}
        municipalities, joined to PASDA dimensional standards (front/side/lot/height/coverage and
        use matrix). Zero in the map layer means “see the ordinance,” not a 0-ft setback. Source:
        YCPC Open Data + PASDA.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search district, municipality, use"
          className="max-w-sm"
        />
        <select
          value={county}
          onChange={(e) => setCounty(e.target.value as "All" | County)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option>All</option>
          {COUNTIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {showYork && (
          <>
            <select
              value={muni}
              onChange={(e) => setMuni(e.target.value)}
              className="h-10 max-w-xs rounded-md border border-input bg-card px-3 text-sm"
            >
              <option>All</option>
              {YORK_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {prettyMuni(m)}
                </option>
              ))}
            </select>
            <select
              value={gcode}
              onChange={(e) => setGcode(e.target.value)}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            >
              {gcodes.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {showYork && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing {yorkList.length} of {YORK_ZONING_DISTRICTS.length} York districts
        </p>
      )}

      {showYork && (
        <div className="mt-4 grid gap-3">
          {yorkList.slice(0, 80).map((d) => (
            <YorkDistrictCard key={d.join || `${d.muni}-${d.zcode}`} d={d} />
          ))}
          {yorkList.length > 80 && (
            <p className="text-sm text-muted-foreground">
              {yorkList.length - 80} more — narrow the municipality or search.
            </p>
          )}
        </div>
      )}

      {county !== "York" && (
        <div className="mt-8 grid gap-4">
          <h2 className="text-lg font-semibold">Other county code excerpts</h2>
          {otherCodes.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {c.municipality} · {c.county} County
                </p>
                <CardTitle>{c.section}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.summary}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-6">
                  <Cell l="Max Height" v={`${c.height} ft`} />
                  <Cell l="Min Lot" v={`${c.minLot.toLocaleString()} sf`} />
                  <Cell l="Front" v={`${c.front} ft`} />
                  <Cell l="Side" v={`${c.side} ft`} />
                  <Cell l="Rear" v={`${c.rear} ft`} />
                  <Cell l="Coverage" v={`${c.coverage}%`} />
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function YorkDistrictCard({ d }: { d: YorkZoningDistrict }) {
  const color = GEN_ZONE_COLORS[d.gcode] || d.color || "#466649";
  const flags = useFlags(d);
  const muniPretty = prettyMuni(d.muni);
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {muniPretty} · Dist {d.district}
            </p>
            <CardTitle className="text-lg">
              {d.zcode} — {d.zname}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {d.gname || d.gcode} · {d.join}
            </p>
          </div>
          <span
            className="mt-1 size-4 shrink-0 rounded-sm border border-outline-variant"
            style={{ background: color }}
            aria-hidden
          />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-5">
          <Cell l="Front" v={dimLabel(d.front, "ft")} />
          <Cell l="Side" v={dimLabel(d.side, "ft")} />
          <Cell l="Min lot" v={dimLabel(d.lot, "sf")} />
          <Cell l="Height" v={dimLabel(d.height, "ft")} />
          <Cell l="Coverage" v={dimLabel(d.cov, "%")} />
        </dl>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flags.map((f) => (
            <span
              key={f.label}
              className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold ${
                f.ok
                  ? "border border-secondary/30 bg-secondary-container text-secondary"
                  : "bg-surface-low text-muted-foreground"
              }`}
            >
              {f.label}
              {f.ok === true ? " yes" : f.ok === false ? " no" : ""}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Cell({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-md bg-surface-low p-2">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{l}</div>
      <div className="font-mono font-semibold">{v}</div>
    </div>
  );
}
