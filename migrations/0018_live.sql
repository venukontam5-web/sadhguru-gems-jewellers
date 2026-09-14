alter table shop_settings add column if not exists vercel_account_id text not null default '';
alter table shop_settings add column if not exists vercel_token text not null default '';
alter table shop_settings add column if not exists live_domain text not null default 'www.sadhgurugemsandjewellers.com';

update shop_settings
set vercel_account_id = '1SiD1HMOQQ5GVQjNAHkzGboQ',
    live_domain = 'www.sadhgurugemsandjewellers.com'
where id = 1
  and (vercel_account_id is null or btrim(vercel_account_id) = '');

insert into shop_settings (id, vercel_account_id, live_domain)
values (1, '1SiD1HMOQQ5GVQjNAHkzGboQ', 'www.sadhgurugemsandjewellers.com')
on conflict (id) do update set
  vercel_account_id = case
    when btrim(shop_settings.vercel_account_id) = '' then excluded.vercel_account_id
    else shop_settings.vercel_account_id
  end,
  live_domain = case
    when btrim(shop_settings.live_domain) = '' then excluded.live_domain
    else shop_settings.live_domain
  end;
