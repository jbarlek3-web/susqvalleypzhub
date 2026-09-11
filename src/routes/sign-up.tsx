import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { AuthEntryNav } from "@/components/auth/auth-entry-nav";

export const Route = createFileRoute("/sign-up")({ component: SignUpPage });

function SignUpPage() {
  return (
    <main className="min-h-screen bg-surface-low px-4 py-8 md:grid md:place-items-center">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant bg-card shadow-xl md:grid-cols-[1.05fr_.95fr]">
        <section className="border-b border-outline-variant bg-surface-low p-7 md:border-b-0 md:border-r md:p-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to secure access
          </Link>
          <FieldAcqOrdinanceAideLogo className="mt-14 h-16 max-w-[275px]" />
          <h1 className="mt-7 max-w-md text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Create your private research workspace.
          </h1>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Start a 1-day Pro trial",
              "Unlock research, reports, and AI usage",
              "Billing managed securely by Clerk",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="p-7 md:p-12">
          <AuthEntryNav active="sign-up" />
          <p className="mt-6 text-sm text-muted-foreground">
            Create your account, then continue to the secure Pro trial checkout.
          </p>
          <div className="mt-5">
            <SignUp
              routing="hash"
              signInUrl="/login"
              fallbackRedirectUrl="/subscription"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "w-full p-0 shadow-none bg-transparent",
                },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
