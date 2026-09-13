create table if not exists site_theme (
  id            integer primary key default 1,
  preset        text not null default 'heritage',
  display_font  text not null default 'Cormorant Garamond',
  body_font     text not null default 'Outfit',
  font_size     text not null default 'medium',
  parchment     text not null default '#f6f1e8',
  ink           text not null default '#1a1410',
  garnet        text not null default '#8c2f39',
  bronze        text not null default '#a68554',
  updated_at    timestamptz not null default now()
);

insert into site_theme (id) values (1)
on conflict (id) do nothing;
