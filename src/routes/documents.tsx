import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Download, ExternalLink, FileText, FolderOpen, LayoutList, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOCUMENTS } from "@/lib/data/catalog";
import { PREVIEW_MS, useHub } from "@/lib/store";
import type { PlanningDoc } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/documents")({ component: Documents });

const CATS = ["Zoning", "SALDO", "Builder", "Codes"] as const;

const CAT_LABEL: Record<(typeof CATS)[number], string> = {
  Zoning: "Zoning Ordinances",
  SALDO: "SALDO Documents",
  Builder: "Builder's Docs",
  Codes: "Codes & Standards",
};

const CORE_COUNTIES = ["York", "Cumberland", "Dauphin", "Lancaster"];

function Documents() {
  const [q, setQ] = useState("");
  const [county, setCounty] = useState("All");
  const [cat, setCat] = useState<(typeof CATS)[number]>("Zoning");
  const [view, setView] = useState<"list" | "group">("list");
  const [expandAll, setExpandAll] = useState(true);
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const isPro = useHub((s) => s.isPro);
  const previewStartedAt = useHub((s) => s.previewStartedAt);
  const canExport = isPro || (previewStartedAt != null && Date.now() - previewStartedAt < PREVIEW_MS);

  const countyOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of DOCUMENTS) counts.set(d.county, (counts.get(d.county) || 0) + 1);
    const core = CORE_COUNTIES.filter((c) => counts.has(c));
    const rest = [...counts.keys()].filter((c) => !CORE_COUNTIES.includes(c)).sort();
    return [...core, ...rest];
  }, []);

  const catCounts = useMemo(() => {
    const counts: Record<(typeof CATS)[number], number> = {
      Zoning: 0,
      SALDO: 0,
      Builder: 0,
      Codes: 0,
    };
    for (const d of DOCUMENTS) {
      if (county !== "All" && d.county !== county) continue;
      counts[d.category] += 1;
    }
    return counts;
  }, [county]);

  const list = useMemo(
    () =>
      DOCUMENTS.filter((d) => d.category === cat)
        .filter((d) => county === "All" || d.county === county)
        .filter(
          (d) =>
            !q.trim() ||
            d.name.toLowerCase().includes(q.toLowerCase()) ||
            d.municipality.toLowerCase().includes(q.toLowerCase()) ||
            d.county.toLowerCase().includes(q.toLowerCase()),
        ),
    [q, county, cat],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PlanningDoc[]>();
    for (const d of list) {
      const key = `${d.municipality} · ${d.county}`;
      const arr = map.get(key);
      if (arr) arr.push(d);
      else map.set(key, [d]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [list]);

  function isOpen(key: string) {
    if (expandAll) return !openKeys.has(key);
    return openKeys.has(key);
  }

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Document Library</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Official zoning ordinances, SALDO, building applications, and codes — live municipal PDFs and
        code books, plus the recovered archive. Every counted file is listed below and opens the original
        source.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search documents or municipality"
          className="max-w-sm"
          autoComplete="off"
        />
        <select
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="All">All counties</option>
          {countyOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setOpenKeys(new Set());
            }}
            className={
              cat === c
                ? "rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary"
                : "rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold"
            }
          >
            {CAT_LABEL[c]} {catCounts[c]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Showing {list.length} {CAT_LABEL[cat].toLowerCase()}
          {view === "group" ? ` in ${grouped.length} municipalities` : ""}
          {county !== "All" ? ` · ${county} County` : ""}
          {q.trim() ? ` matching “${q.trim()}”` : ""}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-container underline-offset-2 hover:underline"
            onClick={() => setView((v) => (v === "list" ? "group" : "list"))}
          >
            {view === "list" ? <Rows3 className="size-3.5" /> : <LayoutList className="size-3.5" />}
            {view === "list" ? "Group by municipality" : "Show full list"}
          </button>
          {view === "group" ? (
            <button
              type="button"
              className="text-xs font-semibold text-primary-container underline-offset-2 hover:underline"
              onClick={() => {
                setExpandAll((v) => !v);
                setOpenKeys(new Set());
              }}
            >
              {expandAll ? "Collapse all" : "Expand all"}
            </button>
          ) : null}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-outline-variant bg-card px-5 py-10 text-center">
          <FolderOpen className="mx-auto size-8 text-on-surface-variant" />
          <p className="mt-2 text-sm font-medium">No documents in this view</p>
          <p className="mt-1 text-xs text-muted-foreground">Try another category, county, or search.</p>
        </div>
      ) : view === "list" ? (
        <ul className="mt-4 divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant bg-card">
          {list.map((d) => (
            <DocRow key={d.id} d={d} canExport={canExport} showMuni />
          ))}
        </ul>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant bg-card">
          {grouped.map(([muni, docs]) => {
            const open = isOpen(muni);
            return (
              <section key={muni} className="border-b border-outline-variant last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggle(muni)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-surface-low"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{muni}</span>
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                      {docs.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-on-surface-variant transition-transform",
                      open ? "rotate-180" : "",
                    )}
                  />
                </button>
                {open ? (
                  <ul className="divide-y divide-outline-variant border-t border-outline-variant bg-surface-low/40">
                    {docs.map((d) => (
                      <DocRow key={d.id} d={d} canExport={canExport} />
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-lg bg-primary px-5 py-6 text-on-primary">
        <h2 className="text-lg font-semibold">Need access to municipal GIS data?</h2>
        <p className="mt-1 max-w-xl text-sm text-on-primary/80">
          The Property Map tool integrates directly with these zoning ordinances so you can visualize
          parcel-level data across York, Cumberland, Dauphin, and Lancaster counties.
        </p>
        <Button asChild className="mt-4 bg-on-primary text-primary hover:bg-primary-fixed">
          <Link to="/map">Open Property Map</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function DocRow({
  d,
  canExport,
  showMuni = false,
}: {
  d: PlanningDoc;
  canExport: boolean;
  showMuni?: boolean;
}) {
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        <FileText className="mt-0.5 size-4 shrink-0 text-primary-container" />
        <div className="min-w-0">
          <div className="font-medium leading-snug">{d.name}</div>
          <div className="text-xs text-muted-foreground">
            {showMuni ? `${d.municipality} · ${d.county} · ` : ""}
            {d.kind} · {d.size} · {d.updated}
            {d.source === "official" ? " · Official source" : " · Drive archive"}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 pl-6 sm:pl-0">
        <Button size="sm" variant="outline" asChild>
          <a href={d.url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" /> Open
          </a>
        </Button>
        <Button size="sm" variant="outline" onClick={() => downloadDoc(d, canExport)}>
          <Download className="size-3.5" /> Download
        </Button>
      </div>
    </li>
  );
}

function downloadDoc(d: PlanningDoc, canExport: boolean) {
  if (!canExport) {
    toast.error("Preview expired. Subscribe to download.");
    return;
  }
  const a = document.createElement("a");
  a.href = d.url;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.click();
  toast.success("Opening original document");
}
