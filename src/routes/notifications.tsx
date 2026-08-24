import { createFileRoute, Link } from "@tanstack/react-router";
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
  const profile = useHub((s) => s.profile);
  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications Hub</h1>
          <p className="text-sm text-muted-foreground">
            Manage regional planning alerts, zoning updates, and subscription preferences.
          </p>
        </div>
        <Button variant="outline" onClick={mark}>
          Mark all as read
        </Button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {alerts.map((a) => (
            <Card key={a.id} className={a.unread ? "border-primary-container/40" : ""}>
              <CardContent className="p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {a.kind} · {a.at}
                </div>
                <div className="mt-1 font-semibold">{a.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                {a.kind === "document" ? (
                  <Link to="/documents" className="mt-2 inline-block text-sm font-medium text-primary-container">
                    Open Library
                  </Link>
                ) : (
                  <Link to="/map" className="mt-2 inline-block text-sm font-medium text-primary-container">
                    View on Map
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
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
                        ? "rounded-sm bg-primary-container px-3 py-2 text-left text-sm text-on-primary"
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
                    <Switch checked={counties[c]} onCheckedChange={(v) => setCounty(c as County, v)} />
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Email delivery active for {profile?.email ?? "planner@susquehanna.gov"}.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
