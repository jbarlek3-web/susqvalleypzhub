# Susquehanna Valley Planning and Zoning Hub

## Deploying securely to Vercel

1. Sign in to Vercel with the account connected to GitHub.
2. Choose **Add New → Project** and import `jbarlek3-web/susqvalleypzhub`.
3. Keep the framework settings detected from the repository. Do not deploy production traffic yet.
4. In **Project → Settings → Environment Variables**, create every required variable listed in [`.env.example`](.env.example).
5. Mark credentials and signing material as **Sensitive**. Scope production credentials to **Production** only; use separate test credentials for Preview and Development.
6. Create a production instance in Clerk, set its authorized application domain to the final HTTPS origin, and add its `pk_live_...` value as `VITE_CLERK_PUBLISHABLE_KEY` and `sk_live_...` value as `CLERK_SECRET_KEY`. Only the publishable key may use the `VITE_` prefix.
7. Set `APP_URL` to the final HTTPS origin, for example `https://your-project.vercel.app` or the production custom domain.
8. In Clerk Dashboard, enable Billing for user plans and publish a plan with the slug `pro`. Configure its price and payment gateway there; the application does not use a Stripe API key, price ID, Checkout route, Portal route, or payment webhook.
9. Run the production database migrations with `npm run deploy:migrate`, then deploy the hardened branch.
10. Verify sign-up, sign-in, sign-out, Clerk Pricing Table checkout, subscription management, and server-enforced Pro access before enabling live payments.

All application tools require an active Clerk plan with slug `pro`. The public surface is limited to the marketing home page, authentication, pricing, privacy, and terms. There is no free lookup allowance. An optional server-only `OWNER_CLERK_USER_ID` may exempt one exact Clerk user ID; leaving it blank exempts nobody.

Production builds stop early and list missing variable names without printing their values. The runtime also fails closed with HTTP 503 if configuration later becomes missing or invalid. Operational security, incident response, and rollback instructions are in [`SECURITY.md`](SECURITY.md).

### Local development

Create separate Clerk Development and Production instances. In each Clerk Dashboard, open **Configure → API keys → Quick Copy** to retrieve the publishable and secret keys. Use `pk_test_...` / `sk_test_...` locally and `pk_live_...` / `sk_live_...` only in Vercel Production.

Copy `.env.example` to `.env.local` and fill it locally. `.env.local` is ignored by Git. Never commit populated environment files. The Clerk secret key is server-only; `VITE_CLERK_PUBLISHABLE_KEY` is intentionally public.
