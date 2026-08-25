# Security and production operations

Report suspected vulnerabilities privately to **admin@fieldacq.com**. Do not include credentials, payment data, or personal data in an issue. Field ACQ aims to acknowledge reports within 24–48 hours.

## Required production configuration

Store all sensitive values in the deployment platform's encrypted or sensitive environment-variable facility. Never commit `.env` files. Production rejects requests when required configuration is missing or the application origin is not HTTPS.

- `APP_URL`
- `CLERK_SECRET_KEY` (server-only production `sk_live_...` key)
- `VITE_CLERK_PUBLISHABLE_KEY` (public production `pk_live_...` key)
- `DATABASE_URL` (use the provider's pooled endpoint)
- `RATE_LIMIT_SALT` (independent random value, at least 32 bytes)
- `STRIPE_PRICE_ID`
- `STRIPE_RESTRICTED_KEY` (least-privilege `rk_` key, never a broad `sk_` key)
- `STRIPE_WEBHOOK_SECRET`
- `XAI_API_KEY` (optional; required only when the Pro AI feature is enabled)

Use separate credentials for preview, staging, and production. Restrict Stripe keys by permission and IP policy where supported. Require passkeys or authenticator-app MFA for deployment, database, source-control, Stripe, and identity-provider administrators.

Clerk middleware restricts accepted session origins to `APP_URL` in production. Configure only required sign-in methods, require email verification, enable bot protection, and keep the production instance's allowed application domains narrow.

## Incident response

1. Disable or rotate the suspected credential immediately.
2. Review provider audit logs and application logs for unauthorized activity.
3. Revoke active sessions when authentication material may be affected.
4. Preserve relevant logs and notify impacted users when required.
5. Add a regression test or scanner rule before closing the incident.

The webhook secret present in repository history before the commercial-hardening branch must be rotated before production deployment. Removing it from the current tree does not invalidate the historical value.

## Deployment and rollback

Run `npm run deploy:migrate` as a controlled release step before routing production traffic. Take a restorable database backup before schema changes. To roll back application code, redeploy the prior known-good commit; database migrations are forward-only, so ship compensating migrations rather than deleting applied migration records.
