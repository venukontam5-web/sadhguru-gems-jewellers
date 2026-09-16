create table if not exists api_keys (
  slot text primary key,
  label text not null,
  secret text not null default '',
  fingerprint text not null default '',
  kind text not null default 'paste',
  verified boolean not null default false,
  verified_at timestamptz,
  note text not null default '',
  updated_at timestamptz not null default now()
);
