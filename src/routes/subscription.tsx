import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createBillingPortal, createCheckout, getEntitlement } from "@/lib/billing";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/subscription")({ component: Subscription });

type Entitlement = Awaited<ReturnType<typeof getEntitlement>>;

function Subscription() {
  const { user, isPending } = useCurrentUserState();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getEntitlement().then((value) => active && setEntitlement(value)).catch((cause) => active && setError(cause instanceof Error ? cause.message : "Unable to load billing status"));
    return () => { active = false; };
  }, [user]);

  if (isPending) return <main className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></main>;
  if (!user) return <RedirectToSignIn />;

  async function openCheckout() {
    setBusy(true); setError(null);
    try { const { url } = await createCheckout(); window.location.assign(url); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Checkout could not start"); setBusy(false); }
  }
  async function openPortal() {
    setBusy(true); setError(null);
    try { const { url } = await createBillingPortal(); window.location.assign(url); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Billing portal could not open"); setBusy(false); }
  }

  const isPro = entitlement?.isPro === true;
  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Professional access</p>
          <h1 className="mt-2 text-3xl font-semibold">Research freely. Pay when the work becomes actionable.</h1>
          <p className="mt-3 text-muted-foreground">Free members can explore the regional map, review representative parcel records, and preview zoning coverage. Pro unlocks the work products that save hours.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {["Unlimited parcel and zoning detail", "PDF, CSV, and GeoJSON exports", "Saved projects and cross-device workspace", "SALDO downloads and amendment alerts"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-secondary" />{item}</li>)}
          </ul>
        </div>
        <Card>
          <CardContent className="p-7">
            <p className="text-sm font-semibold">Planning Hub Pro</p>
            <div className="mt-2 flex items-end gap-1"><span className="text-4xl font-bold">$10</span><span className="mb-1 text-muted-foreground">/ month</span></div>
            <p className="mt-1 text-xs text-muted-foreground">Recurring subscription. Cancel from the Stripe customer portal.</p>
            {entitlement === null && !error ? <Loader2 className="mx-auto mt-8 animate-spin" /> : isPro ? (
              <><div className="mt-6 rounded-lg bg-secondary-container p-4 text-sm text-on-secondary-container">Your Pro access is active on this account.</div><Button className="mt-4 w-full" variant="outline" disabled={busy} onClick={() => void openPortal()}>{busy && <Loader2 className="animate-spin" />}Manage billing</Button></>
            ) : <Button className="mt-6 w-full" size="lg" disabled={busy} onClick={() => void openCheckout()}>{busy && <Loader2 className="animate-spin" />}Continue to secure checkout</Button>}
            {error && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" />Checkout and card storage are handled by Stripe.</p>
            <p className="mt-3 text-center text-xs text-muted-foreground">By subscribing, you agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
