import { createFileRoute, Link } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";
import { ArrowLeft, Building2, Check, LockKeyhole } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
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
            <p className="mt-2 text-sm text-muted-foreground">Sign in securely or create your account to save research and manage Pro access.</p>
            <div className="mt-7">
              <SignIn
                routing="hash"
                signUpUrl="/sign-up"
                forceRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none",
                    card: "w-full p-0 shadow-none bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    footer: "bg-transparent",
                  },
                }}
              />
            </div>
            <p className="mt-7 text-center text-xs leading-relaxed text-muted-foreground">By continuing, you agree to the <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
