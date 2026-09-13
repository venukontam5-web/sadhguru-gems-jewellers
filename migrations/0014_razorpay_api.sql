-- Do not treat the merchant ID as an API key.
update shop_settings
set rzp_key_id = ''
where id = 1
  and rzp_key_id in ('rzp_live_HKe6Oqo4oHUTM5', 'rzp_test_HKe6Oqo4oHUTM5');

update shop_settings
set rzp_merchant_id = 'HKe6Oqo4oHUTM5'
where id = 1
  and (rzp_merchant_id is null or btrim(rzp_merchant_id) = '');
