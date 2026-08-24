import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Check, Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isPending && user) {
    void navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="min-h-screen bg-surface-low px-4 py-8 md:grid md:place-items-center">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant bg-card shadow-xl md:grid-cols-[1.05fr_.95fr]">
        <section className="bg-primary p-7 text-on-primary md:p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-on-primary/75 hover:text-on-primary">
            <ArrowLeft className="size-4" /> Back to the public map
          </Link>
          <div className="mt-16 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-on-primary/10"><Building2 /></span>
            <span className="font-semibold">Susquehanna Valley Planning Hub</span>
          </div>
          <h1 className="mt-7 max-w-md text-3xl font-bold tracking-tight md:text-4xl">Turn parcel research into a defensible acquisition decision.</h1>
          <p className="mt-4 max-w-lg text-on-primary/75">Sign in to save your work. Pro members also unlock complete zoning detail, downloads, projects, and alerts.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {["One account across every device", "Payments handled securely by Stripe", "Your saved work stays private"].map((item) => (
              <li key={item} className="flex items-center gap-2"><Check className="size-4 text-secondary-fixed" />{item}</li>
            ))}
          </ul>
        </section>
        <section className="p-7 md:p-12">
          <div className="mx-auto max-w-sm">
            <div className="grid size-11 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed"><LockKeyhole /></div>
            <h2 className="mt-6 text-2xl font-semibold">Sign in to your workspace</h2>
            <p className="mt-2 text-sm text-muted-foreground">No password for this site to remember. Choose your trusted identity provider.</p>
            <div className="mt-7 space-y-3">
              {GROK_PROVIDERS.map((provider) => (
                <Button key={provider.providerId} variant="outline" size="lg" className="w-full" disabled={Boolean(working)} onClick={() => {
                  setWorking(provider.providerId);
                  setError(null);
                  void signIn(provider.providerId, { callbackURL: "/dashboard", errorCallbackURL: "/login" }).catch((cause) => {
                    setWorking(null);
                    setError(cause instanceof Error ? cause.message : "Sign-in failed");
                  });
                }}>
                  {working === provider.providerId && <Loader2 className="animate-spin" />}
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <p className="mt-7 text-center text-xs leading-relaxed text-muted-foreground">By continuing, you agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
