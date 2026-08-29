# Field ACQ Ordinance Aide

## Deploying securely to Vercel

1. Sign in to Vercel with the account connected to GitHub.
2. Choose **Add New → Project** and import `jbarlek3-web/susqvalleypzhub`.
3. Keep the framework settings detected from the repository. Do not deploy production traffic yet.
4. In **Project → Settings → Environment Variables**, create every required variable listed in [`.env.example`](.env.example).
5. Mark credentials and signing material as **Sensitive**. Scope production credentials to **Production** only; use separate test credentials for Preview and Development.
6. Create a production instance in Clerk, set its authorized application domain to the final HTTPS origin, and add its `pk_live_...` value as `VITE_CLERK_PUBLISHABLE_KEY` and `sk_live_...` value as `CLERK_SECRET_KEY`. Only the publishable key may use the `VITE_` prefix.
7. Set `APP_URL` to the final HTTPS origin, for example `https://your-project.vercel.app` or the production custom domain.
8. In Clerk Dashboard, disable Organizations (or set membership to optional) because Field ACQ supports solo user accounts only. Enable Billing for user plans and publish a plan with the slug `pro`.
9. Add a Clerk webhook endpoint at `https://www.fieldacq.org/api/webhooks/clerk` for user, session, Subscription, Subscription Item, and Payment Attempt events. Add its signing secret to Vercel as `CLERK_WEBHOOK_SIGNING_SECRET`. Do not select Organization events.
10. Optional owner access: set `ADMIN_CLERK_EMAIL` to one exact email address that is verified on the production Clerk account. The owner must still complete normal Clerk sign-in; the server retrieves that signed-in user directly from Clerk before satisfying the Pro entitlement check. Configure only one address and never share the account.
11. Deploy the hardened branch. The production prebuild applies pending database migrations transactionally before compiling the release.
12. Verify sign-up, sign-in, sign-out, webhook delivery, Clerk Pricing Table checkout, subscription management, and server-enforced Pro access before enabling live payments.

Production builds stop early and list missing variable names without printing their values. The runtime also fails closed with HTTP 503 if configuration later becomes missing or invalid. Operational security, incident response, and rollback instructions are in [`SECURITY.md`](SECURITY.md).

### Local development

Create separate Clerk Development and Production instances. In each Clerk Dashboard, open **Configure → API keys → Quick Copy** to retrieve the publishable and secret keys. Use `pk_test_...` / `sk_test_...` locally and `pk_live_...` / `sk_live_...` only in Vercel Production.

Copy `.env.example` to `.env.local` and fill it locally. `.env.local` is ignored by Git. Never commit populated environment files. The Clerk secret key is server-only; `VITE_CLERK_PUBLISHABLE_KEY` is intentionally public.
