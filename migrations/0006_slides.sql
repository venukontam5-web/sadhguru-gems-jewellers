-- Homepage beds: landscape ad posters and portrait product videos.
-- Existing story-rail slides keep kind = 'story'.

alter table slides add column if not exists kind text not null default 'story';
alter table slides add column if not exists media_type text not null default 'image';
alter table slides add column if not exists video_path text not null default '';

create index if not exists slides_kind_idx on slides (kind, active, sort_order);

update slides set kind = 'story' where kind is null or kind = '';

insert into slides (kicker, title, image_path, link, sort_order, kind, media_type, video_path) values
  ('Navratna', 'Nine stones. Nine grahas.', '/uploads/poster-navratna.jpg', '/navratna', 10, 'poster', 'image', ''),
  ('Festival', 'Brass for the house shrine.', '/uploads/poster-brass.jpg', '/brass', 11, 'poster', 'image', ''),
  ('Gold', 'Weighed on the counter scale.', '/uploads/poster-gold.jpg', '/shop', 12, 'poster', 'image', ''),
  ('Manik', 'Natural Ruby (Manik)', '/images/ruby.jpg', '/shop/natural-ruby-manik', 20, 'video', 'video', '/uploads/video-ruby.mp4'),
  ('Pukhraj', 'Yellow Sapphire (Pukhraj)', '/images/yellow-sapphire.jpg', '/shop/yellow-sapphire-pukhraj', 21, 'video', 'video', '/uploads/video-pukhraj.mp4'),
  ('Gold', 'Gold bangles', '/images/gold-bangles.jpg', '/shop', 22, 'video', 'video', '/uploads/video-bangles.mp4');
