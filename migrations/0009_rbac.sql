-- Role-based keys on the house desk.
alter table staff_members add column if not exists role text not null default 'viewer';

update staff_members
set role = 'owner'
where lower(email) in (
  'sgjworld@gmail.com',
  'owner@sadhgurugems.test',
  'admin@sadhgurugems.test'
);
