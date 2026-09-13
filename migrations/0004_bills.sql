-- Counter bills: sale (tax invoice), purchase, return (credit note), cancelled.
create table if not exists bills (
  id              serial primary key,
  kind            text not null,
  number          text not null unique,
  bill_date       date not null default current_date,
  party_name      text not null,
  phone           text not null default '',
  gstin           text not null default '',
  address         text not null default '',
  notes           text not null default '',
  payment         text not null default 'Cash',
  status          text not null default 'Issued',
  ref_number      text not null default '',
  against_id      integer,
  against_number  text not null default '',
  subtotal        integer not null default 0,
  making          integer not null default 0,
  discount        integer not null default 0,
  gst_rate        integer not null default 3,
  gst_amount      integer not null default 0,
  total           integer not null default 0,
  created_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists bills_kind_idx on bills (kind, bill_date desc);
create index if not exists bills_status_idx on bills (status);

create table if not exists bill_lines (
  id           serial primary key,
  bill_id      integer not null references bills(id) on delete cascade,
  sort_order   integer not null default 0,
  description  text not null,
  hsn          text not null default '7113',
  purity       text not null default '',
  qty          numeric(12,3) not null default 1,
  weight_g     numeric(12,3) not null default 0,
  rate         integer not null default 0,
  making       integer not null default 0,
  amount       integer not null default 0
);
create index if not exists bill_lines_bill_idx on bill_lines (bill_id);

insert into bills (
  kind, number, bill_date, party_name, phone, address, notes, payment, status,
  ref_number, subtotal, making, discount, gst_rate, gst_amount, total
) values
  (
    'sale', 'SGJ/S/2026/0001', date '2026-09-02',
    'Anita Deshmukh', '98xxxxxx21', 'Solapur',
    'Packed with a silk pouch.', 'Cash', 'Paid', '',
    2100, 0, 0, 3, 63, 2163
  ),
  (
    'sale', 'SGJ/S/2026/0002', date '2026-09-05',
    'Meera Shah', '99xxxxxx12', 'Pune',
    'Laboratory note on request. Trial period explained.', 'UPI', 'Paid', '',
    54000, 0, 0, 3, 1620, 55620
  ),
  (
    'sale', 'SGJ/S/2026/0003', date '2026-09-06',
    'Ravi Kulkarni', '90xxxxxx44', 'Akkalkot Road, Solapur',
    'Customer did not collect. Cancelled at the counter.', 'Credit', 'Cancelled', '',
    2200, 0, 0, 3, 66, 2266
  ),
  (
    'sale', 'SGJ/S/2026/0004', date '2026-09-07',
    'Sanjana Patil', '97xxxxxx08', 'Kumbhari, Solapur',
    'Returned the next morning — size too tight.', 'UPI', 'Returned', '',
    980, 0, 0, 3, 29, 1009
  ),
  (
    'sale', 'SGJ/S/2026/0005', date '2026-09-08',
    'Meera Shah', '99xxxxxx12', 'Pune',
    'Credit sale — balance on WhatsApp.', 'Credit', 'Issued', '',
    6200, 0, 0, 3, 186, 6386
  ),
  (
    'purchase', 'SGJ/P/2026/0001', date '2026-09-01',
    'Shree Ratna, Jaipur', '0141-xxxxxx', 'Johari Bazaar, Jaipur',
    'Lot for the Navratna tray. Supplier invoice SUP-8821.', 'Bank', 'Paid',
    'SUP-8821', 33600, 0, 0, 3, 1008, 34608
  )
on conflict (number) do nothing;

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select b.id, 1, '5 Mukhi Rudraksha Mala', '1404', 'Rudraksha', 1, 0, 2100, 0, 2100
from bills b
where b.number = 'SGJ/S/2026/0001'
  and not exists (select 1 from bill_lines l where l.bill_id = b.id);

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select b.id, 1, 'Blue Sapphire (Neelam)', '7103', 'Gemstone', 1, 1.80, 30000, 0, 54000
from bills b
where b.number = 'SGJ/S/2026/0002'
  and not exists (select 1 from bill_lines l where l.bill_id = b.id);

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select b.id, 1, 'Brass Kalash', '7419', 'Brass', 1, 0, 2200, 0, 2200
from bills b
where b.number = 'SGJ/S/2026/0003'
  and not exists (select 1 from bill_lines l where l.bill_id = b.id);

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select b.id, 1, 'Rose Quartz Bracelet', '7116', 'Gemstone', 1, 0, 980, 0, 980
from bills b
where b.number = 'SGJ/S/2026/0004'
  and not exists (select 1 from bill_lines l where l.bill_id = b.id);

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select b.id, 1, 'Freshwater Pearl Mala', '7116', 'Pearl', 1, 0, 6200, 0, 6200
from bills b
where b.number = 'SGJ/S/2026/0005'
  and not exists (select 1 from bill_lines l where l.bill_id = b.id);

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select b.id, 1, 'Yellow Sapphire lot (3 stones)', '7103', 'Gemstone', 3, 4.20, 8000, 0, 33600
from bills b
where b.number = 'SGJ/P/2026/0001'
  and not exists (select 1 from bill_lines l where l.bill_id = b.id);

insert into bills (
  kind, number, bill_date, party_name, phone, address, notes, payment, status,
  ref_number, against_id, against_number, subtotal, making, discount, gst_rate, gst_amount, total
)
select
  'return', 'SGJ/R/2026/0001', date '2026-09-08',
  party_name, phone, address,
  'Full return — bracelet size too tight. Credit note against the sale bill.',
  payment, 'Issued', number, id, number,
  subtotal, making, discount, gst_rate, gst_amount, total
from bills
where number = 'SGJ/S/2026/0004'
on conflict (number) do nothing;

insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount)
select r.id, 1, 'Rose Quartz Bracelet', '7116', 'Gemstone', 1, 0, 980, 0, 980
from bills r
where r.number = 'SGJ/R/2026/0001'
  and not exists (select 1 from bill_lines l where l.bill_id = r.id);
