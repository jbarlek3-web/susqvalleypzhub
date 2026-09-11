create table if not exists ai_usage_periods (
  user_id text not null,
  period_start date not null,
  included_used integer not null default 0 check (included_used >= 0),
  purchased_used integer not null default 0 check (purchased_used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

create table if not exists ai_credit_accounts (
  user_id text primary key,
  purchased_balance integer not null default 0 check (purchased_balance >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists ai_usage_periods_updated_idx on ai_usage_periods (updated_at);

