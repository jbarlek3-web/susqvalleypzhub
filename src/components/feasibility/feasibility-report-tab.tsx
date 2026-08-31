import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  Loader2,
  ShieldQuestion,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PARCELS } from "@/lib/data/parcels";
import { generateFeasibilityReport } from "@/lib/feasibility-report";
import {
  REPORT_SECTIONS,
  reportCoverage,
  type FeasibilityReport,
} from "@/lib/feasibility-report-core";
import { useHub } from "@/lib/store";
import { cn } from "@/lib/utils";

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix ? (
          <span id={`${id}-unit`} className="text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: "verified" | "assumption" | "missing" }) {
  if (status === "verified")
    return <CheckCircle2 className="size-4 text-primary-container" aria-hidden />;
  if (status === "missing")
    return <AlertTriangle className="size-4 text-destructive" aria-hidden />;
  return <ShieldQuestion className="size-4 text-amber-700" aria-hidden />;
}

export function FeasibilityReportTab() {
  const selectedIds = useHub((state) => state.selectedIds);
  const initialId =
    selectedIds.find((id) => PARCELS.some((parcel) => parcel.id === id)) ?? PARCELS[0]?.id ?? "";
  const [parcelId, setParcelId] = useState(initialId);
  const parcel = PARCELS.find((item) => item.id === parcelId) ?? PARCELS[0]!;
  const [intendedUse, setIntendedUse] = useState("Residential subdivision");
  const [askingPrice, setAskingPrice] = useState(Math.max(parcel.assessed, 250_000));
  const [targetLots, setTargetLots] = useState(Math.max(1, Math.floor(parcel.acres * 2.2)));
  const [salePricePerLot, setSalePricePerLot] = useState(95_000);
  const [siteworkPerLot, setSiteworkPerLot] = useState(55_000);
  const [softCostPercent, setSoftCostPercent] = useState(12);
  const [carryPercent, setCarryPercent] = useState(8);
  const [sellingCostPercent, setSellingCostPercent] = useState(6);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [report, setReport] = useState<FeasibilityReport | null>(null);
  const [downloadToken, setDownloadToken] = useState("");
  const coverage = useMemo(() => (report ? reportCoverage(report) : null), [report]);

  async function generate() {
    setBusy(true);
    try {
      const result = await generateFeasibilityReport({
        data: {
          parcelId,
          intendedUse,
          askingPrice,
          targetLots,
          salePricePerLot,
          siteworkPerLot,
          softCostPercent,
          carryPercent,
          sellingCostPercent,
          question: question || undefined,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setReport(result.report);
      setDownloadToken(result.downloadToken);
      toast.success("Source-grounded feasibility report generated");
    } catch {
      toast.error("The report could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!downloadToken || !report) return;
    setDownloading(true);
    try {
      const response = await fetch("/api/feasibility-report/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: downloadToken }),
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `field-acq-feasibility-${report.parcel.address
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 72)}.pdf`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Feasibility report downloaded");
    } catch {
      toast.error("The report could not be downloaded.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-primary/25">
        <CardHeader className="border-b border-outline-variant bg-surface-low/60">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-container">
                Source-grounded acquisition analysis
              </p>
              <CardTitle className="mt-1 text-xl">Build a deeper feasibility report</CardTitle>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Every conclusion is labeled Verified, Assumption, or Missing. Official references
                support the analysis without delivering municipal or county source documents.
              </p>
            </div>
            <Button onClick={generate} disabled={busy} className="min-w-56">
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSearch className="size-4" />
              )}
              {busy ? "Grounding report…" : "Generate source-grounded report"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label
              htmlFor="feasibility-parcel"
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Property
            </label>
            <select
              id="feasibility-parcel"
              name="feasibility-parcel"
              value={parcelId}
              onChange={(event) => setParcelId(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {PARCELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.address} — {item.municipality}, {item.county}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="feasibility-use"
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Intended use
            </label>
            <Input
              id="feasibility-use"
              name="feasibility-use"
              className="mt-1"
              value={intendedUse}
              maxLength={160}
              onChange={(event) => setIntendedUse(event.target.value)}
            />
          </div>
          <NumberField
            id="feasibility-asking-price"
            label="Asking price"
            value={askingPrice}
            onChange={setAskingPrice}
            step={1000}
            suffix="$"
          />
          <NumberField
            id="feasibility-target-lots"
            label="Target lots"
            value={targetLots}
            onChange={setTargetLots}
            suffix="lots"
          />
          <NumberField
            id="feasibility-sale-price"
            label="Sale price / lot"
            value={salePricePerLot}
            onChange={setSalePricePerLot}
            step={1000}
            suffix="$"
          />
          <NumberField
            id="feasibility-sitework"
            label="Sitework / lot"
            value={siteworkPerLot}
            onChange={setSiteworkPerLot}
            step={1000}
            suffix="$"
          />
          <NumberField
            id="feasibility-soft-cost"
            label="Soft costs"
            value={softCostPercent}
            onChange={setSoftCostPercent}
            step={0.5}
            suffix="%"
          />
          <NumberField
            id="feasibility-carry"
            label="Carry"
            value={carryPercent}
            onChange={setCarryPercent}
            step={0.5}
            suffix="%"
          />
          <NumberField
            id="feasibility-selling"
            label="Selling costs"
            value={sellingCostPercent}
            onChange={setSellingCostPercent}
            step={0.5}
            suffix="%"
          />
          <div>
            <label
              htmlFor="feasibility-question"
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Specific concern (optional)
            </label>
            <Textarea
              id="feasibility-question"
              name="feasibility-question"
              className="mt-1 min-h-10"
              maxLength={600}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Access, utility capacity, rezoning risk…"
            />
          </div>
        </CardContent>
      </Card>

      {!report ? (
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
            <FileSearch className="size-9 text-primary-container" />
            <h2 className="mt-3 text-lg font-semibold">No report generated yet</h2>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Choose a property and enter transparent economic assumptions. The AI will use the
              private reference library only for source-backed regulatory findings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-5">
            <Card className="border-primary/30">
              <CardContent className="grid gap-5 pt-6 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-container">
                    Decision brief
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">{report.verdict}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {report.executiveSummary}
                  </p>
                </div>
                <div className="flex size-28 flex-col items-center justify-center rounded-full border-4 border-primary-container/60 bg-surface-low">
                  <span className="font-mono text-3xl font-bold">{report.feasibilityScore}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">out of 100</span>
                </div>
              </CardContent>
            </Card>
            {REPORT_SECTIONS.map((section) => (
              <Card key={section}>
                <CardHeader>
                  <CardTitle>{section}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.claims
                    .filter((claim) => claim.section === section)
                    .map((claim) => (
                      <div
                        key={claim.id}
                        className="flex gap-3 rounded-md border border-outline-variant p-3"
                      >
                        <StatusIcon status={claim.status} />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {claim.status} · {claim.confidence} confidence
                          </div>
                          <p className="mt-1 text-sm">{claim.statement}</p>
                          {claim.sourceIds.length ? (
                            <p className="mt-1 font-mono text-[10px] text-primary-container">
                              Sources: {claim.sourceIds.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader>
                <CardTitle>Financial model and sensitivity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-xs text-muted-foreground">
                  Calculated from user-entered assumptions. These values are not market facts or an
                  appraisal.
                </p>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Gross revenue", money(report.financial.grossRevenue)],
                    ["Total cost", money(report.financial.totalCost)],
                    ["Projected profit", money(report.financial.projectedProfit)],
                    ["Margin", `${report.financial.marginPercent.toFixed(1)}%`],
                    ["Breakeven / lot", money(report.financial.breakevenPerLot)],
                    ["Direct sitework", money(report.financial.directSitework)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md bg-surface-low p-3">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-1 font-mono text-lg font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {report.financial.scenarios.map((scenario) => (
                    <div
                      key={scenario.name}
                      className="rounded-md border border-outline-variant p-3"
                    >
                      <div className="font-semibold">{scenario.name}</div>
                      <p className="mt-2 text-sm">
                        {scenario.lots} lots · {money(scenario.profit)} profit
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          scenario.marginPercent < 0
                            ? "text-destructive"
                            : "text-primary-container",
                        )}
                      >
                        {scenario.marginPercent.toFixed(1)}% margin
                      </p>
                    </div>
                  ))}
                </div>
                <details className="mt-4 rounded-md bg-surface-low p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Calculation lineage
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {report.financial.lineage.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              </CardContent>
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>45-day diligence plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal space-y-2 pl-5 text-sm">
                    {report.diligenceItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Kill criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.killCriteria.map((item) => (
                      <li key={item} className="flex gap-2 text-sm">
                        <AlertTriangle
                          className="mt-0.5 size-4 shrink-0 text-destructive"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </main>
          <aside aria-labelledby="evidence-heading" className="space-y-4 xl:sticky xl:top-20">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle id="evidence-heading">Evidence & assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-surface-low p-2">
                    <div className="font-mono text-xl font-bold text-primary-container">
                      {coverage?.verified}
                    </div>
                    <div className="text-[9px] uppercase">Verified</div>
                  </div>
                  <div className="rounded bg-surface-low p-2">
                    <div className="font-mono text-xl font-bold text-amber-700">
                      {coverage?.assumption}
                    </div>
                    <div className="text-[9px] uppercase">Assumed</div>
                  </div>
                  <div className="rounded bg-surface-low p-2">
                    <div className="font-mono text-xl font-bold text-destructive">
                      {coverage?.missing}
                    </div>
                    <div className="text-[9px] uppercase">Missing</div>
                  </div>
                </div>
                <Button
                  onClick={download}
                  disabled={downloading}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {downloading ? "Preparing PDF…" : "Download feasibility report"}
                </Button>
                <p role="status" className="mt-2 text-[10px] text-muted-foreground">
                  Generated report only. Municipal and county source documents are not included.
                </p>
              </CardContent>
            </Card>
            {report.evidence.map((source) => (
              <Card key={source.id}>
                <CardContent className="pt-4">
                  <div className="font-mono text-[10px] text-primary-container">{source.id}</div>
                  <div className="mt-1 text-sm font-semibold">{source.sourceTitle}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {source.locator} · {source.category}
                    <br />
                    {source.jurisdiction}
                  </p>
                  {source.officialSourceUrl ? (
                    <a
                      href={source.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-container underline"
                    >
                      Open official source website <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-destructive">
                      Official website link unavailable
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
