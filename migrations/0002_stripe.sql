-- Stripe webhook receipts and Pro entitlements (unowned; Stripe ids only, no emails)
create table if not exists stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists stripe_entitlements (
  id serial primary key,
  checkout_session_id text,
  subscription_id text,
  customer_id text,
  product_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists stripe_entitlements_session_uidx
  on stripe_entitlements (checkout_session_id)
  where checkout_session_id is not null;

create unique index if not exists stripe_entitlements_sub_uidx
  on stripe_entitlements (subscription_id)
  where subscription_id is not null;

create index if not exists stripe_entitlements_customer_idx
  on stripe_entitlements (customer_id);
