create table if not exists google_drive_connections (
  user_id text primary key,
  refresh_token_ciphertext text not null,
  refresh_token_iv text not null,
  refresh_token_tag text not null,
  root_folder_id text,
  granted_scope text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists google_drive_oauth_states (
  state_hash text primary key,
  user_id text not null,
  code_verifier text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists google_drive_oauth_states_user_idx
  on google_drive_oauth_states (user_id, expires_at);
