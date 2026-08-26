import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <AppShell>
      <article className="prose max-w-2xl">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Field ACQ Ordinance Aide publishes public-record planning and zoning information for York,
          Cumberland, Dauphin, and Lancaster counties. Parcel ownership and assessment data
          originate from county GIS and assessment offices. We do not sell personal information.
          Alert emails are sent only to addresses you provide. Local project notes and comments in
          this preview remain on your device. Payments are managed by Clerk Billing; card numbers
          are never stored by Field Acq.
        </p>
      </article>
    </AppShell>
  );
}
