create table if not exists sales_leads (
  id serial primary key,
  name text not null default '',
  source text not null default 'website',
  handle text not null default '',
  phone text not null default '',
  email text not null default '',
  interest text not null default 'Gemstones',
  place text not null default '',
  notes text not null default '',
  status text not null default 'New',
  next_at date,
  last_reached_at timestamptz,
  source_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists sales_leads_status_idx on sales_leads (status, next_at);
create index if not exists sales_leads_phone_idx on sales_leads (phone);
