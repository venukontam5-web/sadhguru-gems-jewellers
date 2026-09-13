-- Shop cart, checkout, payment and satisfaction.
alter table orders add column if not exists email text not null default '';
alter table orders add column if not exists address text not null default '';
alter table orders add column if not exists city text not null default '';
alter table orders add column if not exists pincode text not null default '';
alter table orders add column if not exists payment text not null default '';
alter table orders add column if not exists payment_status text not null default 'Unpaid';
alter table orders add column if not exists amount integer not null default 0;
alter table orders add column if not exists user_id text;
alter table orders add column if not exists satisfied text not null default '';
alter table orders add column if not exists feedback text not null default '';
alter table orders add column if not exists lines_json text not null default '[]';
