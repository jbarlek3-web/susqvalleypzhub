import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Check } from "lucide-react";

export const Route = createFileRoute("/sign-up")({ component: SignUpPage });

function SignUpPage() {
  return (
    <main className="min-h-screen bg-surface-low px-4 py-8 md:grid md:place-items-center">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant bg-card shadow-xl md:grid-cols-[1.05fr_.95fr]">
        <section className="bg-primary p-7 text-on-primary md:p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-on-primary/75 hover:text-on-primary">
            <ArrowLeft className="size-4" /> Back to the public map
          </Link>
          <div className="mt-16 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-on-primary/10"><Building2 /></span>
            <span className="font-semibold">Susquehanna Valley Planning and Zoning Hub</span>
          </div>
          <h1 className="mt-7 max-w-md text-3xl font-bold tracking-tight md:text-4xl">Create your private research workspace.</h1>
          <ul className="mt-8 space-y-3 text-sm">
            {["One account across every device", "$15/month for full Planning Hub access", "Billing managed securely by Clerk"].map((item) => (
              <li key={item} className="flex items-center gap-2"><Check className="size-4 text-secondary-fixed" />{item}</li>
            ))}
          </ul>
        </section>
        <section className="p-7 md:p-12">
          <SignUp
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            appearance={{ elements: { rootBox: "w-full", cardBox: "w-full shadow-none", card: "w-full p-0 shadow-none bg-transparent" } }}
          />
        </section>
      </div>
    </main>
  );
}
