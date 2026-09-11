import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Cloud,
  ExternalLink,
  FileUp,
  Loader2,
  Map as MapIcon,
  Plus,
  Trash2,
  Unplug,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PARCELS } from "@/lib/data/parcels";
import { useHub } from "@/lib/store";
import type { Project, ProjectStatus } from "@/lib/types";
import { formatAcres } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type DriveStatus = { configured: boolean; connected: boolean };

async function responseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error || "Google Drive request failed");
  if (!payload) throw new Error("Google Drive returned an empty response");
  return payload;
}

function Dashboard() {
  const projects = useHub((s) => s.projects);
  const save = useHub((s) => s.saveBatchAsProject);
  const deleteProject = useHub((s) => s.deleteProject);
  const selectedIds = useHub((s) => s.selectedIds);
  const [status, setStatus] = useState<"All" | ProjectStatus>("All");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [drive, setDrive] = useState<DriveStatus | null>(null);
  const [driveBusy, setDriveBusy] = useState<string | null>(null);
  const [driveLinks, setDriveLinks] = useState<Record<string, string>>({});
  const list = useMemo(
    () => (status === "All" ? projects : projects.filter((p) => p.status === status)),
    [projects, status],
  );

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("drive");
    if (result === "connected") toast.success("Google Drive connected");
    if (result === "denied") toast.error("Google Drive connection was canceled");
    if (result === "error") toast.error("Google Drive could not be connected");
    if (result) window.history.replaceState({}, "", "/dashboard");

    fetch("/api/google-drive/status", { credentials: "same-origin" })
      .then((response) => responseJson<DriveStatus>(response))
      .then(setDrive)
      .catch(() => setDrive({ configured: false, connected: false }));
  }, []);

  async function exportProject(project: Project) {
    setDriveBusy(`export:${project.id}`);
    try {
      const response = await fetch("/api/google-drive/export", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(project),
      });
      const result = await responseJson<{ webViewLink: string | null }>(response);
      if (result.webViewLink) {
        setDriveLinks((current) => ({ ...current, [project.id]: result.webViewLink! }));
      }
      toast.success("Project exported to Google Drive");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Project export failed");
    } finally {
      setDriveBusy(null);
    }
  }

  async function uploadProjectFile(project: Project, file: File) {
    setDriveBusy(`upload:${project.id}`);
    try {
      const form = new FormData();
      form.set("projectId", project.id);
      form.set("projectName", project.name);
      form.set("file", file);
      const response = await fetch("/api/google-drive/upload", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const result = await responseJson<{ webViewLink: string | null }>(response);
      if (result.webViewLink) {
        setDriveLinks((current) => ({ ...current, [project.id]: result.webViewLink! }));
      }
      toast.success(`${file.name} stored in Google Drive`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Project file upload failed");
    } finally {
      setDriveBusy(null);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Overview
          </p>
          <h1 className="text-2xl font-semibold">Project Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Organize property batches and track active development research during this session.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Projects are not stored after refresh or sign-out.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Create New Project
        </Button>
      </div>
      <Card className="mt-5 border-primary/25">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-primary-fixed p-2 text-primary">
              <Cloud className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold">Google Drive project storage</h2>
              <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
                {drive?.connected
                  ? "Connected. Export project snapshots and store project files in your own Field ACQ Projects folder."
                  : "Connect your Drive to store project snapshots and files outside Field ACQ."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Municipal and county reference documents are never included.
              </p>
            </div>
          </div>
          {drive?.connected ? (
            <Button
              type="button"
              variant="outline"
              disabled={driveBusy === "disconnect"}
              onClick={async () => {
                setDriveBusy("disconnect");
                try {
                  await responseJson(
                    await fetch("/api/google-drive/disconnect", {
                      method: "POST",
                      credentials: "same-origin",
                    }),
                  );
                  setDrive({ configured: true, connected: false });
                  setDriveLinks({});
                  toast.success("Google Drive disconnected");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Disconnect failed");
                } finally {
                  setDriveBusy(null);
                }
              }}
            >
              {driveBusy === "disconnect" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unplug className="size-4" />
              )}
              Disconnect
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!drive?.configured}
              onClick={() => window.location.assign("/api/google-drive/start")}
            >
              <Cloud className="size-4" /> Connect Google Drive
            </Button>
          )}
          {drive && !drive.configured ? (
            <p className="w-full text-xs text-amber-700">
              Google Drive connection is awaiting administrator configuration.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["All", "Lead", "Due Diligence", "Permitting", "Approved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded-full border border-primary/30 bg-primary-fixed px-3 py-1.5 text-xs font-semibold text-primary"
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => setDeleting(p)}
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Parcels
                  </dt>
                  <dd className="font-mono font-semibold">{p.parcelIds.length}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Acreage
                  </dt>
                  <dd className="font-mono font-semibold">{formatAcres(p.acres)} ac</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Modified
                  </dt>
                  <dd className="font-semibold">{p.modified}</dd>
                </div>
              </dl>
              {p.constraints.length > 0 && (
                <p className="mt-3 text-xs text-destructive">
                  Constraints: {p.constraints.join(", ")}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/map">
                    <MapIcon className="size-3.5" /> Open Map
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!drive?.connected || Boolean(driveBusy)}
                  onClick={() => exportProject(p)}
                >
                  {driveBusy === `export:${p.id}` ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Cloud className="size-3.5" />
                  )}
                  Export to Drive
                </Button>
                <input
                  id={`project-file-${p.id}`}
                  name={`projectFile-${p.id}`}
                  type="file"
                  className="sr-only"
                  disabled={!drive?.connected || Boolean(driveBusy)}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadProjectFile(p, file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!drive?.connected || Boolean(driveBusy)}
                  onClick={() => document.getElementById(`project-file-${p.id}`)?.click()}
                >
                  {driveBusy === `upload:${p.id}` ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileUp className="size-3.5" />
                  )}
                  Add file
                </Button>
                {driveLinks[p.id] ? (
                  <Button asChild variant="ghost" size="sm">
                    <a href={driveLinks[p.id]} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" /> Open in Drive
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No projects in this session. Select parcels on the map, then create a project.
            </CardContent>
          </Card>
        ) : null}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <Label htmlFor="project-name">Project name</Label>
          <Input
            id="project-name"
            name="projectName"
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
      <Dialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleting ? `“${deleting.name}” will be removed from this session.` : ""}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!deleting) return;
                deleteProject(deleting.id);
                toast.success("Project deleted");
                setDeleting(null);
              }}
            >
              Delete project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
