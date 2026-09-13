insert into staff_members (email, name, role)
values ('venukontam5@gmail.com', 'Venugopal Kontam', 'owner')
on conflict (email) do update set
  name = excluded.name,
  role = 'owner';
