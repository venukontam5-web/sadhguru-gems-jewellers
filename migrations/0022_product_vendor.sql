alter table products add column if not exists vendor_id integer;
create index if not exists products_vendor_idx on products (vendor_id);
