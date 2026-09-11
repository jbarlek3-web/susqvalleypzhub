-- Idempotent receipt log for verified Clerk user and Billing webhooks.
-- Payloads are deliberately not stored: the event id and type are enough for
-- delivery auditing without duplicating account or payment data.
create table if not exists clerk_webhook_events (
  id text primary key,
  event_type text not null,
  disposition text not null check (disposition in ('processed', 'ignored')),
  received_at timestamptz not null default now()
);

create index if not exists clerk_webhook_events_received_idx
  on clerk_webhook_events (received_at desc);
