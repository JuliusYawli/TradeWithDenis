alter table public.products
  add column if not exists colors text[] not null default '{}',
  add column if not exists storage_options jsonb not null default '[]'::jsonb;

alter table public.site_settings
  add column if not exists homepage_hero_video_url text;

create table if not exists public.booking_rate_limits (
  id bigint generated always as identity primary key,
  rate_limit_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists booking_rate_limits_key_created_idx
  on public.booking_rate_limits (rate_limit_key, created_at desc);

alter table public.booking_rate_limits enable row level security;

drop policy if exists "Public can insert leads" on public.leads;

create or replace function public.create_public_booking(
  p_rate_limit_keys text[],
  p_product_id uuid,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_preferred_contact_method text,
  p_desired_payment_option text,
  p_message text,
  p_appointment_date date,
  p_appointment_time text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_lead_id uuid;
  rate_key text;
begin
  if coalesce(cardinality(p_rate_limit_keys), 0) not between 2 and 3
    or exists (select 1 from unnest(p_rate_limit_keys) key where key !~ '^[0-9a-f]{64}$') then
    raise exception 'Invalid booking request';
  end if;

  if p_product_id is not null and not exists (
    select 1 from public.products where id = p_product_id and stock_status = 'in_stock'
  ) then
    raise exception 'The selected product is not available';
  end if;

  if length(p_customer_name) not between 1 and 100
    or length(p_phone) not between 7 and 40
    or length(p_email) not between 3 and 254
    or p_preferred_contact_method not in ('whatsapp', 'phone', 'email')
    or (p_desired_payment_option is not null and p_desired_payment_option not in ('weekly', 'cash', 'discuss'))
    or (p_message is not null and length(p_message) > 1100)
    or (p_appointment_date is not null and (p_appointment_date < current_date or p_appointment_date > current_date + 180))
    or (p_appointment_time is not null and p_appointment_time not in (
      '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM',
      '2:00 PM - 4:00 PM', '4:00 PM - 7:00 PM'
    )) then
    raise exception 'Invalid booking details';
  end if;

  for rate_key in select key from unnest(p_rate_limit_keys) key order by key loop
    perform pg_advisory_xact_lock(hashtextextended(rate_key, 0));
  end loop;

  delete from public.booking_rate_limits
  where created_at < now() - interval '24 hours';

  if exists (
    select 1
    from public.booking_rate_limits
    where rate_limit_key = any(p_rate_limit_keys)
      and created_at >= now() - interval '15 minutes'
    group by rate_limit_key
    having count(*) >= 5
  ) then
    raise exception 'Too many booking requests. Please wait before trying again.';
  end if;

  insert into public.booking_rate_limits (rate_limit_key)
  select distinct key from unnest(p_rate_limit_keys) key;

  insert into public.leads (
    product_id, customer_name, phone, email, preferred_contact_method,
    desired_payment_option, message
  ) values (
    p_product_id, p_customer_name, p_phone, p_email, p_preferred_contact_method,
    p_desired_payment_option, p_message
  ) returning id into new_lead_id;

  insert into public.appointments (lead_id, appointment_date, appointment_time, notes)
  values (
    new_lead_id,
    p_appointment_date,
    p_appointment_time,
    'Customer requested an in-shop appointment from the website. No sale is completed online.'
  );

  return new_lead_id;
end;
$$;

revoke all on function public.create_public_booking(text[], uuid, text, text, text, text, text, text, date, text) from public;
revoke all on function public.create_public_booking(text[], uuid, text, text, text, text, text, text, date, text) from anon;
revoke all on function public.create_public_booking(text[], uuid, text, text, text, text, text, text, date, text) from authenticated;
grant execute on function public.create_public_booking(text[], uuid, text, text, text, text, text, text, date, text) to service_role;
