import { PricingTable } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PRO_PLAN_KEY, PRO_TRIAL_DAYS } from "@/lib/billing-config";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";

export const Route = createFileRoute("/subscription")({ component: Subscription });

function Subscription() {
  const { user, isPending } = useCurrentUserState();

  if (isPending)
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin" />
      </main>
    );
  if (!user) return <RedirectToSignIn />;

  return (
    <main className="min-h-screen bg-surface-low px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl rounded-2xl border border-outline-variant bg-card p-5 shadow-sm sm:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-16 max-w-[265px]" />
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">
            Professional access
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Start your {PRO_TRIAL_DAYS}-day Pro trial.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pro is the only plan offered in this workspace. It unlocks the complete research and
            reporting workflow immediately.
          </p>
        </div>
        <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
          {[
            "Live parcel and zoning research",
            "AI-assisted feasibility briefs",
            "Downloads and export-ready reports",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <PricingTable
            collapseFeatures={false}
            for="user"
            highlightedPlan={PRO_PLAN_KEY}
            newSubscriptionRedirectUrl="/"
          />
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          Checkout, subscription status, and billing management are handled by Clerk Billing.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          By subscribing, you agree to the{" "}
          <Link to="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
