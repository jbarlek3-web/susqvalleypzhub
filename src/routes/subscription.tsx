import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { StripeBuyButton } from "@/components/stripe-buy-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmCheckout } from "@/lib/stripe-confirm";
import { stripePaymentHref, stripeSessionIdFromSearch } from "@/lib/stripe";
import { useHub } from "@/lib/store";

export const Route = createFileRoute("/subscription")({ component: Subscription });

function Subscription() {
  const subscribe = useHub((s) => s.subscribe);
  const isPro = useHub((s) => s.isPro);
  const profile = useHub((s) => s.profile);
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const sessionId = stripeSessionIdFromSearch(search);
    if (!sessionId || useHub.getState().isPro) return;
    let cancelled = false;
    setConfirming(true);
    void (async () => {
      for (let i = 0; i < 8; i += 1) {
        try {
          const result = await confirmCheckout({ data: { sessionId } });
          if (cancelled) return;
          if (result.paid) {
            subscribe({
              firstName: profile?.firstName || "Pro",
              lastName: profile?.lastName || "Subscriber",
              email: profile?.email || "",
              org: profile?.org || "Field Acq",
            });
            toast.success("Payment confirmed. Pro access is active.");
            setConfirming(false);
            return;
          }
        } catch {
          // Webhook may still be in flight.
        }
        await new Promise((r) => setTimeout(r, 1500));
        if (cancelled) return;
      }
      setConfirming(false);
      toast.message("Payment is processing. Pro unlocks as soon as Stripe confirms.");
    })();
    return () => {
      cancelled = true;
    };
  }, [search, subscribe, profile]);

  return (
    <AppShell>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Susquehanna Valley Planning Hub Pro</h1>
          <p className="mt-2 text-muted-foreground">
            Unlock comprehensive regional zoning data. Unlimited parcel lookups, full zoning details,
            SALDO downloads, and four-county coverage for a single monthly fee.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Unlimited parcel data lookups",
              "Full zoning details & historical ordinances",
              "Unlimited SALDO document downloads",
              "Complete multi-county coverage",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="size-4 text-secondary" /> {t}
              </li>
            ))}
          </ul>
          <Card className="mt-6 max-w-sm">
            <CardContent className="p-6">
              <div className="text-sm font-semibold">Professional Plan</div>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-4xl font-bold">$10</span>
                <span className="mb-1 text-muted-foreground">/ month</span>
              </div>
              {isPro && (
                <p className="mt-3 text-sm font-medium text-secondary">
                  Pro access is active on this device.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Secure Checkout</h2>
            {isPro ? (
              <div className="mt-4 rounded-md bg-secondary-container p-4 text-sm text-on-secondary-container">
                You are subscribed. Parcel exports, SALDO downloads, and full zoning tools are
                unlocked on this device.
              </div>
            ) : confirming ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Confirming your Stripe payment…
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Checkout is processed by Stripe. Card details never touch this app. Pro unlocks
                  after Stripe confirms the payment.
                </p>
                <div className="mt-5">
                  <StripeBuyButton />
                </div>
                <div className="relative my-5 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <span className="relative z-10 bg-card px-2">or</span>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-outline-variant" />
                </div>
                <Button asChild className="w-full" size="lg">
                  <a href={stripePaymentHref(profile?.email)} target="_blank" rel="noreferrer">
                    Continue to Stripe Checkout
                    <ExternalLink />
                  </a>
                </Button>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  Payments secured by Stripe
                </p>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  By subscribing you agree to the{" "}
                  <Link to="/terms" className="underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline">
                    Privacy Policy
                  </Link>
                  . Recurring $10.00 / month.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Accordion type="single" collapsible className="mt-10">
        <AccordionItem value="u">
          <AccordionTrigger>How frequently is parcel data updated?</AccordionTrigger>
          <AccordionContent>
            Core parcel geometries and ownership data are updated monthly with county GIS
            departments. Zoning amendments are integrated within 72 hours of municipal publication.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
          <AccordionContent>
            Yes. Cancel from your Stripe billing portal or email admin@fieldacq.com. You retain Pro
            access until the end of the current billing cycle. No cancellation fees.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="s">
          <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
          <AccordionContent>
            Yes. All card data is processed by Stripe. This app never sees or stores your card
            number, CVC, or expiration date. Payment confirmation is received through Stripe
            webhooks.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </AppShell>
  );
}
