import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DD_GROUPS,
  DEFAULT_OPEN,
  DEFAULT_ROW,
  DEFAULT_STORM,
  DEFAULT_UNDEV,
  HD_STORE,
  HD_YORK_MATERIALS,
  HBU_QUESTIONS,
  LOT_TO_BASE,
  PERMIT_PATHS,
  SALDO_DESIGN,
  SALDO_STEPS,
  SCREENING_CHECKS,
  TARGET_MARGIN,
  YCPC_CONTACT,
} from "@/lib/data/acquisition";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/acquire")({ component: Acquire });

const TABS = [
  "Yield",
  "Offer",
  "Screen",
  "Diligence",
  "SALDO",
  "Materials",
] as const;

function money(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function Acquire() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Yield");
  return (
    <AppShell>
      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        Field ACQ · Land acquisition
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Acquisition Toolkit</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Lot yield, residual offer, screening, and York County SALDO path — built from the land
        acquisition analyst playbook, the Land Acquisition & Valuation Guide, and the 2012 York
        County SALDO. Numbers are worksheets, not appraisals.
      </p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wider",
              tab === t ? "bg-primary-container text-on-primary" : "bg-surface-low hover:bg-surface-container",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "Yield" && <YieldTab />}
        {tab === "Offer" && <OfferTab />}
        {tab === "Screen" && <ScreenTab />}
        {tab === "Diligence" && <DiligenceTab />}
        {tab === "SALDO" && <SaldoTab />}
        {tab === "Materials" && <MaterialsTab />}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <Input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}

function YieldTab() {
  const [gross, setGross] = useState(22);
  const [row, setRow] = useState(DEFAULT_ROW * 100);
  const [open, setOpen] = useState(DEFAULT_OPEN * 100);
  const [undev, setUndev] = useState(DEFAULT_UNDEV * 100);
  const [storm, setStorm] = useState(DEFAULT_STORM * 100);
  const [dpa, setDpa] = useState(3.5);

  const netAc = useMemo(() => {
    const take = (row + open + undev + storm) / 100;
    return Math.max(0, gross * (1 - take));
  }, [gross, row, open, undev, storm]);
  const lots = Math.floor(netAc * dpa);
  const grossDpa = lots / Math.max(gross, 0.01);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Lot yield</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Field label="Gross acres" value={gross} onChange={setGross} suffix="ac" />
          <Field label="ROW / roads" value={row} onChange={setRow} suffix="%" />
          <Field label="Open space" value={open} onChange={setOpen} suffix="%" />
          <Field label="Wetlands / flood / undevelopable" value={undev} onChange={setUndev} suffix="%" />
          <Field label="Stormwater / detention" value={storm} onChange={setStorm} suffix="%" />
          <Field label="Lots per net acre (zoning)" value={dpa} onChange={setDpa} />
          <p className="text-xs text-muted-foreground">
            Typical suburban density 3–6 lots/gross acre. Confirm min lot from the Zoning tab — e.g.
            Carroll Twp AC is 87,120 sf (2 ac).
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Stat l="Net developable" v={`${netAc.toFixed(2)} ac`} />
          <Stat l="Net lots" v={String(lots)} />
          <Stat l="Gross density" v={`${grossDpa.toFixed(2)} / ac`} />
          <Stat l="Land leftover" v={`${((row + open + undev + storm)).toFixed(0)}%`} />
          <p className="col-span-2 text-sm text-muted-foreground">
            Next: price the residual on the Offer tab using {lots} lots. Then confirm the district
            min-lot in{" "}
            <Link to="/zoning" className="underline">
              Zoning
            </Link>{" "}
            so density is legal, not just geometric.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function OfferTab() {
  const [asp, setAsp] = useState(375000);
  const [ratio, setRatio] = useState(LOT_TO_BASE * 100);
  const [lots, setLots] = useState(48);
  const [dev, setDev] = useState(55000);
  const [soft, setSoft] = useState(8500);
  const [carry, setCarry] = useState(4500);
  const [margin, setMargin] = useState(TARGET_MARGIN * 100);

  const flv = asp * (ratio / 100);
  const allInLot = flv * (1 - margin / 100);
  const landBudget = Math.max(0, allInLot - dev - soft - carry);
  const landTotal = landBudget * lots;
  const farmCap = 300 / 0.03;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Development residual</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Field label="Finished home ASP" value={asp} onChange={setAsp} suffix="$" />
          <Field label="Lot-to-base ratio" value={ratio} onChange={setRatio} suffix="%" />
          <Field label="Net lots" value={lots} onChange={setLots} />
          <Field label="Site development / lot" value={dev} onChange={setDev} suffix="$" />
          <Field label="Soft costs / lot" value={soft} onChange={setSoft} suffix="$" />
          <Field label="Carry / lot" value={carry} onChange={setCarry} suffix="$" />
          <Field label="Target gross margin" value={margin} onChange={setMargin} suffix="%" />
          <p className="text-xs text-muted-foreground">
            Land is valued backwards from highest and best use. Max lot price ≈ ASP × 18–25%. Then
            subtract all-in development, soft, and carry. What is left is today’s land budget.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Max offer</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Stat l="Finished lot value" v={money(flv)} />
            <Stat l="All-in lot budget" v={money(allInLot)} />
            <Stat l="Land / lot" v={money(landBudget)} />
            <Stat l="Land total" v={money(landTotal)} />
            <Stat l="Per acre (if 22 ac)" v={money(landTotal / 22)} />
            <Stat l="Farm cap check" v={`${money(farmCap)}/ac`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Four H&BU questions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {HBU_QUESTIONS.map((h) => (
              <div key={h.n}>
                <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {h.n}. {h.q}
                </div>
                <p className="text-sm text-muted-foreground">{h.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScreenTab() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const pass = SCREENING_CHECKS.filter((c) => on[c.id]).length;
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Quick filter · {pass}/{SCREENING_CHECKS.length} clear
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {SCREENING_CHECKS.map((c) => (
            <label key={c.id} className="flex items-start gap-3 rounded-md bg-surface-low p-3">
              <Checkbox checked={!!on[c.id]} onCheckedChange={(v) => setOn((s) => ({ ...s, [c.id]: Boolean(v) }))} />
              <div>
                <div className="text-sm font-semibold">{c.label}</div>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DiligenceTab() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {DD_GROUPS.map((g) => (
        <Card key={g.title}>
          <CardHeader>
            <CardTitle>{g.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {g.items.map((item) => {
              const key = `${g.title}:${item}`;
              return (
                <label key={key} className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={!!checked[key]}
                    onCheckedChange={(v) => setChecked((s) => ({ ...s, [key]: Boolean(v) }))}
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </CardContent>
        </Card>
      ))}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>York permit tracking</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {PERMIT_PATHS.map((p) => (
            <div key={p.title}>
              <div className="text-sm font-semibold">{p.title}</div>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SaldoTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>York County SALDO (2012) path</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {SALDO_STEPS.map((s) => (
            <div key={s.id} className="rounded-md bg-surface-low p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {s.section}
              </div>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Design standards snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {SALDO_DESIGN.map((r) => (
              <div key={r.label} className="flex justify-between gap-3 text-sm">
                <span className="font-medium">{r.label}</span>
                <span className="text-right text-muted-foreground">{r.value}</span>
              </div>
            ))}
            <a
              href="https://drive.google.com/file/d/1Y5j4rvT6Hic9ZvlvJjDV5ZoPnGGuAnJN/view"
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-sm text-primary-container underline"
            >
              Open York County SALDO PDF
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>County contact (referral only)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-semibold">{YCPC_CONTACT.name}</div>
            <p>{YCPC_CONTACT.address}</p>
            <p>{YCPC_CONTACT.phone}</p>
            <p>{YCPC_CONTACT.email}</p>
            <p className="mt-2 text-muted-foreground">{YCPC_CONTACT.note}</p>
            <a href={YCPC_CONTACT.url} className="mt-2 inline-block text-primary-container underline" target="_blank" rel="noreferrer">
              ycpc.org
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MaterialsTab() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{HD_STORE.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {HD_STORE.address} · prices checked {HD_STORE.checked}. Use for rough site/material
            takeoffs, not bid documents.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Cat</th>
                  <th className="pb-2">Unit</th>
                  <th className="pb-2 text-right">York #4125</th>
                </tr>
              </thead>
              <tbody>
                {HD_YORK_MATERIALS.map((m) => (
                  <tr key={m.sku} className="border-t border-outline-variant">
                    <td className="py-2">{m.name}</td>
                    <td>{m.cat}</td>
                    <td>{m.unit}</td>
                    <td className="text-right font-mono">
                      ${m.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-md bg-surface-low p-3">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{l}</div>
      <div className="font-mono text-lg font-semibold">{v}</div>
    </div>
  );
}
