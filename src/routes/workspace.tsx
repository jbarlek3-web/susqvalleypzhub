import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEED_PROJECTS, TEAM } from "@/lib/data/catalog";
import { initials } from "@/lib/utils";

export const Route = createFileRoute("/workspace")({ component: Workspace });

function Workspace() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team Workspace</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Manage your municipal planning team, assign roles, and control access to shared zoning
            batches and regional reports.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Invite member</Button>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="py-2 font-semibold">Member</th>
                <th className="py-2 font-semibold">Role</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((m) => (
                <tr key={m.id} className="border-t border-outline-variant">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary-fixed text-xs font-bold text-primary">
                        {initials(m.name)}
                      </span>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.role}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shared Batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SEED_PROJECTS.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-md border border-outline-variant p-3">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.county} · {p.parcelIds.length} parcels · {p.modified}
                </div>
                <div className="mt-2 text-xs">Access: Edit</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Marcus Reed</span> commented on Parcel #14-2B —
              “Setback requirements here look inconsistent with the 2021 municipal variance.”
              <span className="block text-xs text-muted-foreground">2 hrs ago</span>
            </p>
            <p>
              System generated report <span className="font-medium">Q3 Zoning Summary</span>
              <span className="block text-xs text-muted-foreground">Yesterday</span>
            </p>
            <p>
              <span className="font-semibold">Sarah Jenkins</span> updated status of Market St
              Development to Pending Review.
              <span className="block text-xs text-muted-foreground">Oct 12</span>
            </p>
          </CardContent>
        </Card>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <Label>Email address</Label>
          <Input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Label className="mt-3 block">Role</Label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            Viewer can read shared batches. Editor can create batches. Admin manages roles.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              toast.success(`Invitation sent to ${email || "teammate"} as ${role}`);
              setOpen(false);
            }}
          >
            Send invitation
          </Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
