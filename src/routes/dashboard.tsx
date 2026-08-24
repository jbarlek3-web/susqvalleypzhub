import { createFileRoute, Link } from "@tanstack/react-router";
import { FileDown, Map as MapIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PARCELS } from "@/lib/data/parcels";
import { useHub } from "@/lib/store";
import { authorizeProAction } from "@/lib/pro-actions";
import type { ProjectStatus } from "@/lib/types";
import { formatAcres } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const projects = useHub((s) => s.projects);
  const save = useHub((s) => s.saveBatchAsProject);
  const selectedIds = useHub((s) => s.selectedIds);
  const [status, setStatus] = useState<"All" | ProjectStatus>("All");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const list = useMemo(
    () => (status === "All" ? projects : projects.filter((p) => p.status === status)),
    [projects, status],
  );

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Overview</p>
          <h1 className="text-2xl font-semibold">Project Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Manage saved property batches, track status, and generate compliance reports for active
            developments.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Create New Project
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["All", "Lead", "Due Diligence", "Permitting", "Approved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary"
                : "rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold"
            }
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <StatusBadge status={p.status} />
                  <h2 className="mt-2 text-lg font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {p.municipality} · {p.county}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant">Parcels</dt>
                  <dd className="font-mono font-semibold">{p.parcelIds.length}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant">Acreage</dt>
                  <dd className="font-mono font-semibold">{formatAcres(p.acres)} ac</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant">Modified</dt>
                  <dd className="font-semibold">{p.modified}</dd>
                </div>
              </dl>
              {p.constraints.length > 0 && (
                <p className="mt-3 text-xs text-destructive">Constraints: {p.constraints.join(", ")}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/map">
                    <MapIcon className="size-3.5" /> Open Map
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!useHub.getState().canExport()) {
                      toast.error("Subscribe to export reports.");
                      return;
                    }
                    void authorizeProAction()
                      .then(() => {
                        toast.success("Preparing PDF export…");
                        window.print();
                      })
                      .catch(() => toast.error("Pro access could not be verified. Please sign in again."));
                  }}
                >
                  <FileDown className="size-3.5" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <Label>Project name</Label>
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="mt-2 text-xs text-muted-foreground">
            Uses the current map selection ({selectedIds.length} parcel
            {selectedIds.length === 1 ? "" : "s"}
            {selectedIds.length
              ? ` — ${PARCELS.filter((x) => selectedIds.includes(x.id))
                  .map((x) => x.address)
                  .join(", ")}`
              : ""}
            ).
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              save(name.trim() || "Untitled project");
              toast.success("Project saved");
              setOpen(false);
              setName("");
            }}
          >
            Save project
          </Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
