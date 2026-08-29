import { PricingTable } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { PRO_PLAN_KEY, PRO_TRIAL_DAYS } from "@/lib/billing-config";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { getEntitlement } from "@/lib/billing";
import { entitlementWithTimeout } from "@/lib/entitlement-client";

export const Route = createFileRoute("/subscription")({ component: Subscription });

function Subscription() {
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const [access, setAccess] = useState<"checking" | "active" | "locked" | "error">("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isPending || !userId) return;
    let current = true;
    setAccess("checking");
    void entitlementWithTimeout(getEntitlement())
      .then(({ isPro }) => {
        if (current) setAccess(isPro ? "active" : "locked");
      })
      .catch(() => {
        if (current) setAccess("error");
      });
    return () => {
      current = false;
    };
  }, [attempt, isPending, userId]);

  if (isPending || (user && access === "checking"))
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Checking your account…
        </div>
      </main>
    );
  if (!user) return <RedirectToSignIn />;

  if (access === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-surface-low px-4">
        <section className="w-full max-w-lg rounded-2xl border border-outline-variant bg-card p-7 text-center shadow-xl">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-14 max-w-[235px]" />
          <h1 className="mt-6 text-2xl font-semibold">Billing access could not be verified.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Checkout was not started. Retry the secure account check before changing your plan.
          </p>
          <Button className="mt-6" type="button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        </section>
      </main>
    );
  }

  if (access === "active") {
    return (
      <main className="grid min-h-screen place-items-center bg-surface-low px-4">
        <section className="w-full max-w-lg rounded-2xl border border-outline-variant bg-card p-7 text-center shadow-xl">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-14 max-w-[235px]" />
          <CheckCircle2 className="mx-auto mt-6 size-10 text-secondary" />
          <h1 className="mt-4 text-2xl font-semibold">Your Pro access is active.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            No checkout is needed. Continue directly to your workspace.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Continue to Field ACQ</Link>
          </Button>
        </section>
      </main>
    );
  }

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
            "Pro directories and saved projects",
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
