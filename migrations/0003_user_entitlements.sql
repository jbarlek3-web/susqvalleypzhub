alter table stripe_entitlements add column if not exists user_id text;

create unique index if not exists stripe_entitlements_user_uidx
  on stripe_entitlements (user_id)
  where user_id is not null;

create table if not exists free_usage (
  user_id text primary key,
  parcel_lookups integer not null default 0,
  updated_at timestamptz not null default now()
);
