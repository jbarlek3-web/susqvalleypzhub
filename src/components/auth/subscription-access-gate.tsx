import { PricingTable } from "@clerk/tanstack-react-start";
import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole, Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { getEntitlement } from "@/lib/billing";
import { PRO_PLAN_KEY, PRO_TRIAL_DAYS } from "@/lib/billing-config";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const ACCESS_EXEMPT_PATHS = new Set(["/login", "/sign-up", "/subscription", "/terms", "/privacy"]);

type AccessState = "checking" | "locked" | "allowed";

function LoadingGate() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-low text-muted-foreground">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Checking secure access…
      </div>
    </main>
  );
}

function LockNotice({
  signedIn,
  onSkip,
  onResume,
}: {
  signedIn: boolean;
  onSkip: () => void;
  onResume?: () => void;
}) {
  if (onResume) {
    return (
      <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-outline-variant bg-card p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-on-surface">
          Access is locked. Sign in and start the {PRO_TRIAL_DAYS}-day Pro trial to use Field ACQ
          Ordinance Aide.
        </p>
        <Button type="button" className="shrink-0" onClick={onResume}>
          Unlock access
        </Button>
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid overflow-y-auto bg-on-surface/25 p-4 sm:p-8">
      <section
        aria-describedby="subscription-access-description"
        aria-labelledby="subscription-access-title"
        aria-modal="true"
        className="m-auto w-full max-w-5xl rounded-2xl border border-outline-variant bg-card p-6 shadow-xl sm:p-8"
        role="dialog"
        tabIndex={-1}
      >
        <div className="mx-auto max-w-3xl text-center">
          <FieldAcqOrdinanceAideLogo className="mx-auto h-14 max-w-[235px]" />
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed">
            <LockKeyhole className="size-5" />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">
            Professional access
          </p>
          <h1 id="subscription-access-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
            Start your {PRO_TRIAL_DAYS}-day Pro trial to use Field ACQ Ordinance Aide.
          </h1>
          <p
            id="subscription-access-description"
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground"
          >
            The app remains locked until your account has Pro access. No alternative tier is
            available.
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
          <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="flex-1">
              <Link to="/sign-up">Create account</Link>
            </Button>
            <Button asChild className="flex-1" variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            Clerk applies the trial rule at checkout; accounts that already used a trial continue
            through paid checkout.
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
      </section>
    </div>
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
  const [skipped, setSkipped] = useState(false);
  const lastUserId = useRef<string | null>(null);
  const isExempt = ACCESS_EXEMPT_PATHS.has(pathname);

  useEffect(() => {
    if (isExempt || isPending) return;
    if (!userId) {
      setAccess("locked");
      return;
    }

    let active = true;
    setAccess("checking");
    void getEntitlement()
      .then(({ isPro }) => {
        if (active) setAccess(isPro ? "allowed" : "locked");
      })
      .catch(() => {
        if (active) setAccess("locked");
      });

    return () => {
      active = false;
    };
  }, [isExempt, isPending, userId]);

  useEffect(() => {
    if (lastUserId.current !== userId) {
      lastUserId.current = userId ?? null;
      setSkipped(false);
    }
  }, [userId]);

  if (isExempt) return <>{children}</>;
  if (isPending || access === "checking") return <LoadingGate />;
  if (access === "allowed") return <>{children}</>;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none select-none opacity-35" inert>
        {children}
      </div>
      {skipped ? (
        <LockNotice
          signedIn={Boolean(user)}
          onResume={() => setSkipped(false)}
          onSkip={() => setSkipped(true)}
        />
      ) : (
        <LockNotice signedIn={Boolean(user)} onSkip={() => setSkipped(true)} />
      )}
    </>
  );
}
