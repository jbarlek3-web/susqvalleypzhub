import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProvenanceBadge } from "@/components/brand/provenance-badge";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MEETINGS } from "@/lib/data/catalog";

export const Route = createFileRoute("/minutes")({ component: Minutes });

function Minutes() {
  const [q, setQ] = useState("");
  const [body, setBody] = useState("All");
  const list = useMemo(
    () =>
      MEETINGS.filter((m) => body === "All" || m.body === body).filter(
        (m) =>
          !q.trim() ||
          `${m.municipality} ${m.summary} ${m.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, body],
  );
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Meeting Minutes & Archives</h1>
      <div className="mt-2">
        <ProvenanceBadge status="sample-demo" />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Sample/demo catalog of meeting-style summaries. These are not official municipal minutes
        and are excluded from generated decisions.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sample records" className="max-w-sm" />
        <select
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option>All</option>
          <option>City Council</option>
          <option>Planning Commission</option>
          <option>Zoning Hearing Board</option>
        </select>
      </div>
      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
        Recent summaries
      </h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {list.slice(0, 4).map((m) => (
          <Card key={m.id}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">
                {m.municipality} \u00b7 {m.date}
              </div>
              <div className="mt-1 font-semibold">{m.body}</div>
              <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {m.tags.map((t) => (
                  <span key={t} className="rounded-sm bg-surface-container px-2 py-0.5 text-[11px] font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-low text-xs uppercase tracking-wider text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Municipality</th>
              <th className="px-4 py-3">Body</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-t border-outline-variant">
                <td className="px-4 py-3 font-mono text-xs">{m.date}</td>
                <td className="px-4 py-3">{m.municipality}</td>
                <td className="px-4 py-3">{m.body}</td>
                <td className="px-4 py-3">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
