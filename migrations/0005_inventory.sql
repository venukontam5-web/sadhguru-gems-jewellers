-- Inventory book: location, reorder, cost, and a signed ledger of in/out.
alter table products add column if not exists sku text not null default '';
alter table products add column if not exists unit text not null default 'pc';
alter table products add column if not exists weight_g numeric(12,3) not null default 0;
alter table products add column if not exists reorder_at integer not null default 2;
alter table products add column if not exists cost_inr integer not null default 0;
alter table products add column if not exists location text not null default 'Cabinet';

alter table bill_lines add column if not exists product_id integer;

create table if not exists stock_moves (
  id           serial primary key,
  product_id   integer not null references products(id) on delete cascade,
  kind         text not null,
  qty          numeric(12,3) not null,
  weight_g     numeric(12,3) not null default 0,
  bill_id      integer,
  bill_number  text not null default '',
  note         text not null default '',
  created_by   text,
  created_at   timestamptz not null default now()
);
create index if not exists stock_moves_product_idx on stock_moves (product_id, created_at desc);
create index if not exists stock_moves_kind_idx on stock_moves (kind);

update products set sku = 'SGJ-' || lpad(id::text, 4, '0') where sku = '';
update products set cost_inr = round(price_inr * 0.72) where cost_inr = 0 and price_inr > 0;
update products set reorder_at = 2 where category = 'Gemstones';
update products set reorder_at = 4 where category in ('Mala', 'Pearls-Beads', 'Crystal') and reorder_at = 2;
update products set reorder_at = 3 where category in ('Brass', 'Copper') and reorder_at = 2;
update products set location = 'Navratna tray' where category = 'Gemstones' and location = 'Cabinet';
update products set location = 'Crystal cabinet' where category = 'Crystal' and location = 'Cabinet';
update products set location = 'Mala drawer' where category in ('Mala', 'Pearls-Beads') and location = 'Cabinet';
update products set location = 'Brass shelf' where category = 'Brass' and location = 'Cabinet';
update products set location = 'Copper shelf' where category = 'Copper' and location = 'Cabinet';
update products set unit = 'ct' where category = 'Gemstones' and unit = 'pc';

insert into stock_moves (product_id, kind, qty, note)
select id, 'opening', stock, 'Opening stock — cabinet count'
from products
where not exists (select 1 from stock_moves m where m.product_id = products.id);

update bill_lines l
set product_id = p.id
from products p
where l.product_id is null
  and lower(l.description) = lower(p.name);
