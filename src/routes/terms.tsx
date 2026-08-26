import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <AppShell>
      <article className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Terms of Use</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Data is provided for planning due diligence and is not a legal survey, title report, or
          municipal determination. Always confirm with the host municipality before filing. Pro
          subscriptions may be cancelled at the end of a billing cycle and are managed through Clerk Billing. Grok feasibility briefs are
          informational and must not be treated as professional engineering or legal advice.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Independent service disclaimer</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Susquehanna Valley Planning and Zoning Hub is an independent entity within the greater Field ACQ family. It is not affiliated with, endorsed by, or operated by any Pennsylvania municipality, county, or state agency. Questions or concerns may be emailed to admin@fieldacq.com; we aim to respond within 24–48 hours.
        </p>
      </article>
    </AppShell>
  );
}
