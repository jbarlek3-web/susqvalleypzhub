import { PricingTable } from "@clerk/tanstack-react-start";
import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole, Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { getEntitlement } from "@/lib/billing";
import { PRO_PLAN_KEY, PRO_TRIAL_DAYS } from "@/lib/billing-config";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { entitlementWithTimeout } from "@/lib/entitlement-client";

const ACCESS_EXEMPT_PATHS = new Set(["/login", "/sign-up", "/subscription", "/terms", "/privacy"]);

type AccessState = "checking" | "locked" | "allowed" | "error";

function LoadingGate() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-low text-muted-foreground">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Checking secure access…
      </div>
    </main>
  );
}

function AccessNotice({ signedIn }: { signedIn: boolean }) {
  return (
    <main className="grid min-h-screen bg-surface-low px-4 py-8 sm:px-6 sm:py-12">
      <section
        aria-describedby="subscription-access-description"
        aria-labelledby="subscription-access-title"
        className="m-auto w-full max-w-5xl rounded-2xl border border-outline-variant border-t-4 border-t-brand-lime bg-card p-6 shadow-xl sm:p-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-14 max-w-[235px]" />
          <span className="mx-auto mt-6 grid size-11 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed">
            <LockKeyhole className="size-5" />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">
            Secure access
          </p>
          <h1 id="subscription-access-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
            {signedIn
              ? `Start your ${PRO_TRIAL_DAYS}-day Pro trial to continue.`
              : "Sign in or create your account to continue."}
          </h1>
          <p
            id="subscription-access-description"
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground"
          >
            {signedIn
              ? "Your account is secure. Choose Pro access below to unlock research, directories, and saved projects."
              : "Field ACQ Ordinance Aide keeps parcel research, reports, and saved projects private to your account."}
          </p>
        </div>

        {signedIn ? (
          <div className="mt-7">
            <PricingTable
              collapseFeatures={false}
              for="user"
              highlightedPlan={PRO_PLAN_KEY}
              newSubscriptionRedirectUrl="/"
            />
          </div>
        ) : (
          <div className="mx-auto mt-7 grid max-w-md gap-3 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/sign-up">Sign up</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {signedIn
              ? "Clerk applies the trial rule at checkout; accounts that already used a trial continue through paid checkout."
              : `New accounts continue to the ${PRO_TRIAL_DAYS}-day Pro trial after secure sign-up.`}
          </p>
        </div>
      </section>
    </main>
  );
}

function AccessError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-low px-4">
      <section className="w-full max-w-lg rounded-2xl border border-outline-variant bg-card p-7 text-center shadow-xl">
        <FieldAcqOrdinanceAideLogo className="mx-auto h-14 max-w-[235px]" />
        <h1 className="mt-6 text-2xl font-semibold">We could not verify your access.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The secure account check did not finish. Your account was not changed and checkout was not
          started.
        </p>
        <Button className="mt-6" type="button" onClick={onRetry}>
          Try again
        </Button>
      </section>
    </main>
  );
}

/**
 * Keeps all product routes inaccessible until a visitor is signed in and Clerk
 * confirms the Pro plan. Login, signup, checkout, and legal routes remain
 * reachable so the visitor always has a path to unlock access.
 */
export function SubscriptionAccessGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const [access, setAccess] = useState<AccessState>("checking");
  const [attempt, setAttempt] = useState(0);
  const isExempt = ACCESS_EXEMPT_PATHS.has(pathname);

  useEffect(() => {
    if (isExempt || isPending) return;
    if (!userId) {
      setAccess("locked");
      return;
    }

    let active = true;
    setAccess("checking");
    void entitlementWithTimeout(getEntitlement())
      .then(({ isPro }) => {
        if (active) setAccess(isPro ? "allowed" : "locked");
      })
      .catch(() => {
        if (active) setAccess("error");
      });

    return () => {
      active = false;
    };
  }, [attempt, isExempt, isPending, userId]);

  if (isExempt) return <>{children}</>;
  if (isPending || access === "checking") return <LoadingGate />;
  if (access === "allowed") return <>{children}</>;
  if (access === "error") return <AccessError onRetry={() => setAttempt((value) => value + 1)} />;

  return <AccessNotice signedIn={Boolean(user)} />;
}
