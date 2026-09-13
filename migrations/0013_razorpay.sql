-- Razorpay for the shop cart.
alter table shop_settings add column if not exists rzp_merchant_id text not null default '';
alter table shop_settings add column if not exists rzp_key_id text not null default '';
alter table shop_settings add column if not exists rzp_key_secret text not null default '';

update shop_settings
set
  rzp_merchant_id = 'HKe6Oqo4oHUTM5',
  rzp_key_id = case
    when rzp_key_id = '' then 'rzp_live_HKe6Oqo4oHUTM5'
    else rzp_key_id
  end
where id = 1;

alter table orders add column if not exists rzp_order_id text not null default '';
alter table orders add column if not exists rzp_payment_id text not null default '';
