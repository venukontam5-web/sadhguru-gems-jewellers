insert into staff_members (email, name, role, login_id)
values
  ('sgjworld@gmail.com', 'Sadhguru Gems owner', 'owner', 'SGJ-01'),
  ('venukontam5@gmail.com', 'Venugopal Kontam', 'owner', 'SGJ-02'),
  ('admin@sadhgurugems.test', 'House admin', 'owner', 'SGJ-03')
on conflict (email) do update set
  role = 'owner',
  name = coalesce(nullif(staff_members.name, ''), excluded.name),
  login_id = coalesce(nullif(staff_members.login_id, ''), excluded.login_id);
