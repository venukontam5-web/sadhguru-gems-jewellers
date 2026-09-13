-- House team emails. Visitors never see this list.
create table if not exists staff_members (
  email      text primary key,
  name       text not null default '',
  created_at timestamptz not null default now()
);

insert into staff_members (email, name) values
  ('sgjworld@gmail.com', 'House'),
  ('owner@sadhgurugems.test', 'Owner'),
  ('admin@sadhgurugems.test', 'Admin')
on conflict (email) do nothing;
