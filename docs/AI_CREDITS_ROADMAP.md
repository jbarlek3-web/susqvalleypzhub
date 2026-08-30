# AI credit packs roadmap

The Pro plan currently includes 100 Ordinance Aide questions per user per UTC calendar month. The
allowance is enforced server-side and can be configured with `AI_MONTHLY_QUESTION_LIMIT`.

Future credit-pack work:

- Create fixed Stripe prices for AI credit packs.
- Grant credits only from a verified, idempotent payment webhook.
- Record an immutable grant/refund ledger and reconcile it against `ai_credit_accounts`.
- Show pack pricing, receipts, balance history, and refund behavior before enabling checkout.
- Add billing, webhook retry, concurrent debit, refund, and end-to-end authenticated tests.

The current runtime can already consume `purchased_balance` after the monthly allowance is exhausted,
but no route or UI can grant or purchase that balance yet.
