insert into staff_members (email, name, role)
values
  ('sgjworld@gmail.com', 'Sadhguru Gems owner', 'owner'),
  ('venukontam5@gmail.com', 'Venugopal Kontam', 'owner'),
  ('admin@sadhgurugems.test', 'House admin', 'owner')
on conflict (email) do update set
  role = 'owner',
  name = coalesce(nullif(staff_members.name, ''), excluded.name);
