-- 1. Create organizations and organization_memberships tables
create table if not exists organizations (
  id text primary key,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists organization_memberships (
  user_id text not null,
  organization_id text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

-- 2. Schema Migration: add organization_id alongside user_id
-- stripe_entitlements
alter table stripe_entitlements alter column user_id drop not null;
alter table stripe_entitlements add column if not exists organization_id text;
alter table stripe_entitlements drop constraint if exists stripe_entitlements_owner_chk;
alter table stripe_entitlements add constraint stripe_entitlements_owner_chk check (user_id is not null or organization_id is not null);
create unique index if not exists stripe_entitlements_org_uidx
  on stripe_entitlements (organization_id)
  where organization_id is not null;
create unique index if not exists stripe_entitlements_user_uidx
  on stripe_entitlements (user_id)
  where user_id is not null;

-- free_usage
alter table free_usage drop constraint if exists free_usage_pkey;
alter table free_usage alter column user_id drop not null;
alter table free_usage add column if not exists organization_id text;
alter table free_usage drop constraint if exists free_usage_owner_chk;
alter table free_usage add constraint free_usage_owner_chk check (user_id is not null or organization_id is not null);
create unique index if not exists free_usage_org_uidx
  on free_usage (organization_id)
  where organization_id is not null;
create unique index if not exists free_usage_user_uidx
  on free_usage (user_id)
  where user_id is not null;

-- ai_credit_accounts
alter table ai_credit_accounts drop constraint if exists ai_credit_accounts_pkey;
alter table ai_credit_accounts alter column user_id drop not null;
alter table ai_credit_accounts add column if not exists organization_id text;
alter table ai_credit_accounts drop constraint if exists ai_credit_accounts_owner_chk;
alter table ai_credit_accounts add constraint ai_credit_accounts_owner_chk check (user_id is not null or organization_id is not null);
create unique index if not exists ai_credit_accounts_org_uidx
  on ai_credit_accounts (organization_id)
  where organization_id is not null;
create unique index if not exists ai_credit_accounts_user_uidx
  on ai_credit_accounts (user_id)
  where user_id is not null;

-- ai_usage_periods
alter table ai_usage_periods drop constraint if exists ai_usage_periods_pkey;
alter table ai_usage_periods alter column user_id drop not null;
alter table ai_usage_periods add column if not exists organization_id text;
alter table ai_usage_periods drop constraint if exists ai_usage_periods_owner_chk;
alter table ai_usage_periods add constraint ai_usage_periods_owner_chk check (user_id is not null or organization_id is not null);
create unique index if not exists ai_usage_periods_org_period_uidx
  on ai_usage_periods (organization_id, period_start)
  where organization_id is not null;
create unique index if not exists ai_usage_periods_user_period_uidx
  on ai_usage_periods (user_id, period_start)
  where user_id is not null;
