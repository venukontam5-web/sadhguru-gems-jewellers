-- Admin desk: ads IDs, categories, vendors, astrology note.
create table if not exists shop_settings (
  id            integer primary key default 1,
  ga_id         text not null default '',
  ads_id        text not null default '',
  ads_label     text not null default '',
  gtm_id        text not null default '',
  search_console text not null default '',
  updated_at    timestamptz not null default now()
);
insert into shop_settings (id) values (1) on conflict (id) do nothing;

create table if not exists shop_categories (
  id         serial primary key,
  name       text not null unique,
  sort_order integer not null default 0,
  active     boolean not null default true
);
insert into shop_categories (name, sort_order) values
  ('Gemstones', 1),
  ('Crystal', 2),
  ('Mala', 3),
  ('Pearls-Beads', 4),
  ('Brass', 5),
  ('Copper', 6)
on conflict (name) do nothing;

create table if not exists shop_vendors (
  id         serial primary key,
  name       text not null,
  phone      text not null default '',
  city       text not null default '',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists shop_astrology (
  id         integer primary key default 1,
  heading    text not null default 'A rashi is a starting point, not a prescription.',
  lede       text not null default 'We will sit with a chart if you have one. We will not sell a blue sapphire in a hurry.',
  offer_note text not null default 'Ask for a reading at the counter. Tradition, not a medical claim.',
  updated_at timestamptz not null default now()
);
insert into shop_astrology (id) values (1) on conflict (id) do nothing;
