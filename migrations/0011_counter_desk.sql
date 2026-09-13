-- Staff login IDs, and room for extra bill kinds (stock, repair, expense).
alter table staff_members add column if not exists login_id text;

update staff_members s
set login_id = 'SGJ-' || lpad(sub.n::text, 2, '0')
from (
  select email, row_number() over (order by created_at, email) as n
  from staff_members
) sub
where s.email = sub.email
  and (s.login_id is null or btrim(s.login_id) = '');

create unique index if not exists staff_login_id_idx on staff_members (lower(login_id));
