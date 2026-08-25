# Susquehanna Valley Planning Hub

## Deploying securely to Vercel

1. Sign in to Vercel with the account connected to GitHub.
2. Choose **Add New → Project** and import `jbarlek3-web/susqvalleypzhub`.
3. Keep the framework settings detected from the repository. Do not deploy production traffic yet.
4. In **Project → Settings → Environment Variables**, create every required variable listed in [`.env.example`](.env.example).
5. Mark credentials and signing material as **Sensitive**. Scope production credentials to **Production** only; use separate test credentials for Preview and Development.
6. Set `APP_URL` and `BETTER_AUTH_URL` to the same final HTTPS origin, for example `https://your-project.vercel.app` or the production custom domain.
7. Set `STRIPE_WEBHOOK_SECRET` to the new `whsec_...` value from the Stripe webhook endpoint. Never paste it into source code, GitHub issues, build arguments, or a variable beginning with `VITE_`.
8. Run the production database migrations with `npm run deploy:migrate`, then deploy the hardened branch.
9. In Stripe test mode, verify Checkout, signed webhook delivery, Pro access, and Customer Portal before enabling live payments.

Production fails closed with HTTP 503 when required configuration is missing or invalid. Operational security, incident response, and rollback instructions are in [`SECURITY.md`](SECURITY.md).

### Stripe webhook endpoint

Configure the Stripe endpoint after Vercel assigns the final domain:

```text
https://YOUR-DOMAIN/api/stripe/webhook
```

Subscribe only to the events required by the application:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

After the replacement endpoint succeeds, revoke the historical webhook secret and retain no copies in local notes or source control.

### Local development

Copy `.env.example` to `.env.local` and fill it locally. `.env.local` is ignored by Git. Never commit populated environment files.
