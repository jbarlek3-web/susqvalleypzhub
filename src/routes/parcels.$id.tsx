import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProvenanceBadge } from "@/components/brand/provenance-badge";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RENO_2026 } from "@/lib/data/catalog";
import { SEEDED_PARCEL_BUILDABLE } from "@/lib/data/derived-layers";
import { getParcel } from "@/lib/data/parcels";
import { analyzeParcel } from "@/lib/grok-analyze";
import { sampleDemoBlockMessage } from "@/lib/provenance";
import { useHub } from "@/lib/store";
import { formatFullMoney } from "@/lib/utils";

export const Route = createFileRoute("/parcels/$id")({ component: ParcelReport });

function ParcelReport() {
  const { id } = Route.useParams();
  const parcel = getParcel(id);
  const commentsAll = useHub((s) => s.comments);
  const comments = commentsAll.filter((c) => c.parcelId === id);
  const addComment = useHub((s) => s.addComment);
  const saved = useHub((s) => s.savedIds.includes(id));
  const toggleSaved = useHub((s) => s.toggleSaved);
  const profile = useHub((s) => s.profile);
  const [note, setNote] = useState("");
  const [ai, setAi] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [renoSf, setRenoSf] = useState(12000);

  if (!parcel) {
    return (
      <AppShell>
        <p>Parcel not found.</p>
        <Link to="/map" className="text-primary-container">
          Back to map
        </Link>
      </AppShell>
    );
  }

  const flood = parcel.flood[0];

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-on-surface-variant">
            PARCEL ID: {parcel.apn} {"\u00b7"} LAST UPDATED: 24 OCT 2024
          </p>
          <h1 className="text-3xl font-semibold">{parcel.address}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <ProvenanceBadge status="sample-demo" />
            <ProvenanceBadge status="derived" lineage={SEEDED_PARCEL_BUILDABLE} />
          </div>
          <p className="text-muted-foreground">
            {parcel.municipality}, PA {"\u00b7"} {parcel.county} County
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied");
            }}
          >
            <Share2 className="size-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleSaved(id)}>
            {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi
          label="Lot Size"
          value={`${parcel.acres} Acres`}
          sub={`${parcel.sqft.toLocaleString()} Sq. Ft.`}
        />
        <Kpi label="Zoning District" value={parcel.zoning} sub={parcel.zoningName} />
        <Kpi
          label="Assessed Value"
          value={formatFullMoney(parcel.assessed)}
          sub={`Tax Year ${parcel.taxYear}`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Zoning & Development Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Permitted Uses (selected)
            </p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {parcel.permittedUses.map((u) => (
                <li key={u} className="text-sm">
                  {"\u00b7"} {u}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Dim l="Max Height" v={`${parcel.maxHeight} ft`} />
              <Dim l="Front" v={`${parcel.setbacks.front} ft`} />
              <Dim l="Side" v={`${parcel.setbacks.side} ft`} />
              <Dim l="Rear" v={`${parcel.setbacks.rear} ft`} />
              <Dim l="Max Coverage" v={`${parcel.maxCoverage}%`} />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Buildable Area Analysis
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              <Row l="Gross Lot Area" v={`${parcel.sqft.toLocaleString()} SF`} />
              <Row
                l="Right-of-Way Dedication"
                v={`\u2212 ${parcel.rowDedicationSf.toLocaleString()} SF`}
              />
              <Row l="Environmental Buffers" v={`\u2212 ${parcel.envBufferSf.toLocaleString()} SF`} />
              <Row l="Required Setbacks" v={`\u2212 ${parcel.setbackSf.toLocaleString()} SF`} />
              <Row l="Net Buildable Area" v={`${parcel.buildableSf.toLocaleString()} SF`} strong />
            </dl>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilities & Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Water. </span>
                {parcel.utilities.water}
              </p>
              <p>
                <span className="font-semibold">Sewer. </span>
                {parcel.utilities.sewer}
              </p>
              <p>
                <span className="font-semibold">Electric. </span>
                {parcel.utilities.electric}
              </p>
              <p>
                <span className="font-semibold">Gas. </span>
                {parcel.utilities.gas}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Environmental & Risk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Flood Zone <span className="font-semibold">ZONE {flood}</span>
              </p>
              <p>
                Steep Slopes{" "}
                <span className="font-semibold">
                  {parcel.slopePct >= 15 ? `${parcel.slopePct}%` : "NONE"}
                </span>{" "}
                ({parcel.slopePct}% grade)
              </p>
              <p>
                Historic District{" "}
                <span className="font-semibold">{parcel.historic ? "YES" : "NO"}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {parcel.transfers.map((t) => (
                <li key={t.date} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{t.party}</div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </div>
                  <div className="font-mono">{t.price ? formatFullMoney(t.price) : "\u2014"}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2026 Renovation Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Building SF
            </label>
            <input
              type="range"
              min={1000}
              max={40000}
              step={500}
              value={renoSf}
              onChange={(e) => setRenoSf(Number(e.target.value))}
              className="mt-2 w-full accent-primary-container"
            />
            <div className="mb-3 font-mono text-sm">{renoSf.toLocaleString()} sf</div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-on-surface-variant">
                  <th className="py-1 font-medium">Item</th>
                  <th className="font-medium">Low</th>
                  <th className="font-medium">High</th>
                </tr>
              </thead>
              <tbody>
                {RENO_2026.filter((r) => r.unit === "sf").map((r) => (
                  <tr key={r.item} className="border-t border-outline-variant">
                    <td className="py-1.5">{r.item}</td>
                    <td className="font-mono">{formatFullMoney(r.low * renoSf)}</td>
                    <td className="font-mono">{formatFullMoney(r.high * renoSf)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Central PA 2026 contractor ranges. Site work priced separately by acre. Sample/demo.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Grok Feasibility Brief</CardTitle>
          <Button
            size="sm"
            disabled
            onClick={async () => {
              setBusy(true);
              const res = await analyzeParcel({
                data: {
                  parcelId: parcel.id,
                },
              });
              setBusy(false);
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              setAi(res.text);
            }}
          >
            <Sparkles className="size-3.5" /> Ask Grok
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{sampleDemoBlockMessage()}</p>
          {ai ? (
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">{ai}</pre>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Internal Team Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-md bg-surface-low p-3">
                <div className="text-sm font-semibold">
                  {c.author} <span className="font-normal text-muted-foreground">{c.at}</span>
                </div>
                <p className="mt-1 text-sm">{c.body}</p>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              addComment(
                id,
                profile ? `${profile.firstName} ${profile.lastName}` : "You",
                note.trim(),
              );
              setNote("");
            }}
          >
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Post comment"
            />
            <Button type="submit" className="self-end">
              Post comment
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-card p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{sub}</div>
    </div>
  );
}

function Dim({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-md bg-surface-low p-2 text-center">
      <div className="font-mono text-sm font-semibold">{v}</div>
      <div className="text-[10px] uppercase text-on-surface-variant">{l}</div>
    </div>
  );
}

function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={strong ? "font-semibold" : ""}>{l}</span>
      <span className={strong ? "font-mono font-semibold" : "font-mono"}>{v}</span>
    </div>
  );
}
