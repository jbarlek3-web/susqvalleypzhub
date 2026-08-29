import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { COUNTIES } from "@/lib/data/catalog";
import { useHub } from "@/lib/store";
import type { County } from "@/lib/types";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const alerts = useHub((s) => s.alerts);
  const mark = useHub((s) => s.markAlertsRead);
  const counties = useHub((s) => s.alertCounties);
  const setCounty = useHub((s) => s.setAlertCounty);
  const freq = useHub((s) => s.alertFreq);
  const setFreq = useHub((s) => s.setAlertFreq);
  const visibleAlerts = useMemo(
    () => alerts.filter((alert) => !alert.county || counties[alert.county]),
    [alerts, counties],
  );
  const unread = visibleAlerts.filter((alert) => alert.unread).length;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications Hub</h1>
          <p className="text-sm text-muted-foreground">
            A source-backed watchlist for documents that were indexed or re-verified in the app
            catalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={mark} disabled={!unread}>
            Mark all as read
          </Button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Card className="border-primary-container/30 bg-primary-fixed/35">
            <CardContent className="p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-primary-container">
                Regional source watch
              </div>
              <div className="mt-1 text-lg font-semibold">
                {visibleAlerts.length} current records across{" "}
                {Object.values(counties).filter(Boolean).length} counties
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {unread} unread. These are catalog-source updates, not unverified claims that a
                municipality adopted a rule.
              </p>
            </CardContent>
          </Card>
          {visibleAlerts.length ? (
            visibleAlerts.map((a) => (
              <Card key={a.id} className={a.unread ? "border-primary-container/40" : ""}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <span>{a.kind}</span>
                    <span aria-hidden="true">·</span>
                    <span>{a.county} County</span>
                    <span aria-hidden="true">·</span>
                    <span>{a.at}</span>
                  </div>
                  <div className="mt-1 font-semibold">{a.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Source: {a.source}</span>
                    {a.actionUrl ? (
                      <a
                        href={a.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-primary-container underline-offset-2 hover:underline"
                      >
                        {a.actionLabel}
                      </a>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No counties are enabled. Turn on a county below to see its source-backed records.
              </CardContent>
            </Card>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Delivery frequency
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {(["Immediate", "Daily Digest", "Weekly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFreq(f)}
                    className={
                      freq === f
                        ? "rounded-sm border border-primary/30 bg-primary-fixed px-3 py-2 text-left text-sm text-primary"
                        : "rounded-sm px-3 py-2 text-left text-sm hover:bg-surface-low"
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                County filters
              </p>
              <ul className="mt-2 space-y-2">
                {COUNTIES.map((c) => (
                  <li key={c} className="flex items-center justify-between text-sm">
                    {c} County
                    <Switch
                      checked={counties[c]}
                      onCheckedChange={(v) => setCounty(c as County, v)}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Preferences filter the in-app watchlist. Email delivery is not active, and dates
              reflect catalog indexing or verification—not ordinance adoption.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
