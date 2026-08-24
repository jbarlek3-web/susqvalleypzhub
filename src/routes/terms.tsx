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
          subscriptions may be cancelled at the end of a billing cycle and are billed through Stripe. Grok feasibility briefs are
          informational and must not be treated as professional engineering or legal advice.
        </p>
      </article>
    </AppShell>
  );
}
