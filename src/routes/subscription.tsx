import { PricingTable } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/subscription")({ component: Subscription });

function Subscription() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) return <main className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></main>;
  if (!user) return <RedirectToSignIn />;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Professional access</p>
          <h1 className="mt-2 text-3xl font-semibold">Research freely. Pay when the work becomes actionable.</h1>
          <p className="mt-3 text-muted-foreground">Free members can explore the regional map, public planning sources, and up to three live York address lookups per day. Pro raises the live-research limit and unlocks AI feasibility analysis.</p>
        </div>
        <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
          {["Up to 120 live lookups per minute", "AI-assisted feasibility briefs", "Pro export and print workflow"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />{item}</li>)}
        </ul>
        <div className="mt-8"><PricingTable /></div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" />Checkout, subscription status, and billing management are handled by Clerk Billing.</p>
        <p className="mt-3 text-center text-xs text-muted-foreground">By subscribing, you agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
      </div>
    </AppShell>
  );
}
