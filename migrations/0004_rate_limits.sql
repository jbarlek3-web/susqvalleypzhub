create table if not exists rate_limits (
  bucket_key text not null,
  window_id bigint not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (bucket_key, window_id)
);

create index if not exists rate_limits_updated_idx on rate_limits (updated_at);
