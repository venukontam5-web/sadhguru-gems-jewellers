alter table shop_settings add column if not exists vercel_deploy_hook text not null default '';
alter table shop_settings add column if not exists github_repo text not null default 'venukontam5-web/www.sadhgurugemsandjewellers.com';
alter table shop_settings add column if not exists vercel_project_id text not null default 'prj_W2UkDNzy1127kPERiyvGPWCW8LeI';

update shop_settings
set github_repo = 'venukontam5-web/www.sadhgurugemsandjewellers.com',
    vercel_project_id = 'prj_W2UkDNzy1127kPERiyvGPWCW8LeI'
where id = 1;
