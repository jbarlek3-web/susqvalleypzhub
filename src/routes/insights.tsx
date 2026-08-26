import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMIT_VOLUME, PRICE_SERIES } from "@/lib/data/catalog";

export const Route = createFileRoute("/insights")({ component: Insights });

function Insights() {
  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Regional Insights</h1>
          <p className="text-sm text-muted-foreground">
            Market, risk, and development intelligence for Central Pennsylvania municipalities.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Avg Lot Price / Acre"
          value="$84.2k"
          delta="+4.2%"
          vs="vs region avg $80.8k"
          up
        />
        <Metric label="Active Permits" value="1,248" delta="+12%" vs="week over week" up />
        <Metric label="High-Risk Flood Parcels" value="8.4%" delta="3,420 total" vs="" />
        <Metric
          label="Median Days on Market"
          value="42"
          delta="−5 days"
          vs="vs last quarter"
          up={false}
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Trends: Price per Acre</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRICE_SERIES}>
                <CartesianGrid stroke="#e1e3e4" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="York" stroke="#1b365d" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="Cumberland"
                  stroke="#466649"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Dauphin"
                  stroke="#c62828"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Lancaster"
                  stroke="#1565c0"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Flood Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <BarRow label="100-Year Zone" pct={10} color="bg-flood" />
            <BarRow label="500-Year Zone" pct={20} color="bg-flood/50" />
            <BarRow label="No Flood Risk" pct={70} color="bg-secondary" />
            <p className="pt-2 text-xs text-muted-foreground">
              Share of active parcels in the 4-county inventory.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Permit Volume (Issued vs Pending)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERMIT_VOLUME}>
                <CartesianGrid stroke="#e1e3e4" strokeDasharray="3 3" />
                <XAxis dataKey="county" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="issued" fill="#1b365d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#acd0ac" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Zoning Composition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <BarRow label="Residential" pct={55} color="bg-zone-r" />
            <BarRow label="Agricultural" pct={20} color="bg-zone-a" />
            <BarRow label="Commercial" pct={15} color="bg-zone-c" />
            <BarRow label="Industrial" pct={8} color="bg-zone-i" />
            <BarRow label="Other / TOD" pct={2} color="bg-zone-tod" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  delta,
  vs,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  vs: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-card p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className={`text-xs ${up === false ? "text-destructive" : "text-secondary"}`}>
        {delta} {vs}
      </div>
    </div>
  );
}

function BarRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-high">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
