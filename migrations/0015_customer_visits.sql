-- Online visited customer details: requirement, place, contact, mail.
alter table visitors add column if not exists name text not null default '';
alter table visitors add column if not exists requirement text not null default '';
alter table visitors add column if not exists place text not null default '';
alter table visitors add column if not exists contact text not null default '';
alter table visitors add column if not exists email text not null default '';

insert into visitors (path, country, requirement, place, name, contact, email)
select * from (
  values
    ('/navratna', 'India', 'Navratna', 'Solapur, Maharashtra', 'Anita Deshmukh', '9822011122', 'anita.d@gmail.com'),
    ('/shop/pukhraj', 'India', 'Pukhraj (yellow sapphire)', 'Pune, Maharashtra', 'Rahul Kulkarni', '9876543210', 'rahul.k@outlook.com'),
    ('/enquire', 'India', 'Repair and polish', 'Hyderabad', 'Fatima Shaikh', '9000012345', 'fatima.s@yahoo.com'),
    ('/gemstones', 'United Arab Emirates', 'Emerald (Panna)', 'Dubai', 'Imran Ali', '971501112233', 'imran.ali@gmail.com'),
    ('/checkout', 'India', '2 × Rudraksha mala', 'Mumbai', 'Sneha Patil', '8888877777', 'sneha.patil@gmail.com')
) as seed(path, country, requirement, place, name, contact, email)
where not exists (select 1 from visitors v where v.contact = seed.contact);
