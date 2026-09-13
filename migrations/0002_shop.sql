-- Shop catalogue, homepage stories, enquiries, visitors, and orders.
create table if not exists products (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  category    text not null,
  price_inr   integer not null default 0,
  compare_at  integer,
  stock       integer not null default 1,
  image_path  text not null default '/images/ruby.jpg',
  badge       text not null default '',
  active      boolean not null default true,
  description text not null default '',
  updated_by  text,
  created_at  timestamptz not null default now()
);
create index if not exists products_category_idx on products (category);
create index if not exists products_active_idx on products (active);

create table if not exists slides (
  id          serial primary key,
  kicker      text not null default '',
  title       text not null,
  image_path  text not null,
  link        text not null default '/shop',
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists enquiries (
  id          serial primary key,
  name        text not null,
  phone       text not null default '',
  email       text not null default '',
  subject     text not null default 'General',
  message     text not null default '',
  status      text not null default 'New',
  created_at  timestamptz not null default now()
);

create table if not exists visitors (
  id          serial primary key,
  path        text not null,
  country     text not null default 'Unknown',
  created_at  timestamptz not null default now()
);
create index if not exists visitors_created_idx on visitors (created_at desc);

create table if not exists orders (
  id             serial primary key,
  code           text not null unique,
  customer_name  text not null,
  phone          text not null default '',
  item           text not null,
  status         text not null default 'New',
  created_at     timestamptz not null default now()
);

insert into products (slug, name, category, price_inr, compare_at, stock, image_path, badge, description) values
  ('rudraksha-bead-strand', 'Rudraksha Bead Strand', 'Mala', 890, 1200, 16, '/images/heritage.jpg', 'Pooja', 'Five-mukhi rudraksha strand, oil-finished, for daily japa.'),
  ('sphatik-crystal-bracelet', 'Sphatik Crystal Bracelet', 'Crystal', 1450, null, 12, '/images/moonstone.jpg', '', 'Clear sphatik (quartz) bracelet, 8mm beads, strung on silk.'),
  ('amethyst-points-pair', 'Amethyst Points Pair', 'Crystal', 1980, null, 8, '/images/amethyst.jpg', '', 'A pair of natural amethyst points for the shrine or desk.'),
  ('freshwater-pearl-mala', 'Freshwater Pearl Mala', 'Pearls-Beads', 6200, 7500, 5, '/images/pearl.jpg', 'Bridal', '108 freshwater pearls with a gold-tone spacer. Keep away from perfume.'),
  ('brass-kalash', 'Brass Kalash', 'Brass', 2200, null, 8, '/images/brass-collection.jpg', '', 'Heavy-gauge kalash with lid, for sankalpa and griha pravesh.'),
  ('brass-pooja-diya-set', 'Brass Pooja Diya Set', 'Brass', 1850, null, 10, '/images/brass-lamp.jpg', 'Festival', 'A nested set of brass diyas for daily aarti and Deepavali.'),
  ('mixed-gemstone-beads', 'Mixed Gemstone Beads', 'Pearls-Beads', 2400, null, 14, '/images/hero-gems.jpg', '', 'A working mix of semi-precious beads for custom malas.'),
  ('freshwater-pearl-string', 'Freshwater Pearl String', 'Pearls-Beads', 3100, null, 7, '/images/pearl.jpg', '', 'A single strand of matched freshwater pearls, undrilled extras on request.'),
  ('karungali-mala', 'Karungali Mala', 'Mala', 1650, null, 11, '/images/garnet.jpg', '', 'Ebony (karungali) mala, 108 beads, traditionally worn on Saturdays.'),
  ('5-mukhi-rudraksha-mala', '5 Mukhi Rudraksha Mala', 'Mala', 2100, null, 9, '/images/heritage.jpg', '', 'Five-mukhi rudraksha of even size, knotted between beads.'),
  ('sphatik-mala-108', 'Sphatik Mala (108)', 'Mala', 2800, null, 6, '/images/moonstone.jpg', '', '108-bead sphatik mala for japa. Cool to the touch.'),
  ('citrine-point', 'Citrine Point', 'Crystal', 1750, null, 10, '/images/citrine.jpg', '', 'A natural citrine point. Colour is unforced; we do not sell glass.'),
  ('rose-quartz-bracelet', 'Rose Quartz Bracelet', 'Crystal', 980, null, 18, '/images/opal.jpg', '', 'Soft pink rose quartz, elastic bracelet, gift-ready.'),
  ('amethyst-cluster', 'Amethyst Cluster', 'Crystal', 4200, null, 4, '/images/amethyst.jpg', 'Cabinet', 'A small cabinet cluster with good colour in the tips.'),
  ('cats-eye-lehsunia', 'Cat''s Eye (Lehsunia)', 'Gemstones', 18500, null, 2, '/images/cats-eye.jpg', 'Navratna', 'Chrysoberyl cat''s eye with a living band. Ask for a laboratory note.'),
  ('hessonite-gomed', 'Hessonite (Gomed)', 'Gemstones', 9800, null, 3, '/images/hessonite.jpg', 'Navratna', 'Cinnamon hessonite, sleepy lustre, not glass fire.'),
  ('yellow-sapphire-pukhraj', 'Yellow Sapphire (Pukhraj)', 'Gemstones', 42000, null, 2, '/images/yellow-sapphire.jpg', 'Navratna', 'Honey-gold corundum. Heat is declared. Report on request.'),
  ('emerald-panna', 'Emerald (Panna)', 'Gemstones', 38000, null, 2, '/images/emerald.jpg', 'Navratna', 'Garden emerald with declared oil. Colour first, then clarity.'),
  ('blue-sapphire-neelam', 'Blue Sapphire (Neelam)', 'Gemstones', 55000, null, 1, '/images/blue-sapphire.jpg', 'Navratna', 'A serious blue. We will not press this stone on a first visit.'),
  ('natural-ruby-manik', 'Natural Ruby (Manik)', 'Gemstones', 48000, null, 2, '/images/ruby.jpg', 'Navratna', 'Pigeon-blood to deep red corundum. See it in north daylight.')
on conflict (slug) do nothing;

insert into slides (kicker, title, image_path, link, sort_order) values
  ('New collection', 'New collection', '/images/ruby.jpg', '/shop', 1),
  ('Festival', 'Festival brass', '/images/brass-lamp.jpg', '/brass', 2),
  ('Product', 'Featured stone', '/images/ruby.jpg', '/shop', 3),
  ('Brass items', 'Brass items', '/images/brass-collection.jpg', '/brass', 4),
  ('Pearl special', 'Pearl special', '/images/pearl.jpg', '/shop', 5);

insert into enquiries (name, phone, subject, message, status) values
  ('Anita Deshmukh', '98xxxxxx21', 'Astrology report', 'Please look at a chart for yellow sapphire.', 'New'),
  ('Ravi Kulkarni', '90xxxxxx44', 'Rudraksha Mala', 'Need a 5 mukhi mala of even beads.', 'Open'),
  ('Meera Shah', '99xxxxxx12', 'Blue Sapphire', 'Can I trial a small Neelam before setting?', 'New');

insert into orders (code, customer_name, phone, item, status) values
  ('SGJ-1842', 'Anita Deshmukh', '98xxxxxx21', '5 Mukhi Rudraksha Mala', 'Packed'),
  ('SGJ-1843', 'Meera Shah', '99xxxxxx12', 'Blue Sapphire (trial)', 'New');

insert into visitors (path, country, created_at) values
  ('/', 'India', now() - interval '2 minutes'),
  ('/', 'India', now() - interval '5 minutes'),
  ('/shop', 'Singapore', now() - interval '6 minutes'),
  ('/', 'India', now() - interval '8 minutes'),
  ('/astrology', 'United States', now() - interval '9 minutes'),
  ('/shop', 'India', now() - interval '10 minutes'),
  ('/', 'United Arab Emirates', now() - interval '12 minutes'),
  ('/', 'India', now() - interval '14 minutes');
