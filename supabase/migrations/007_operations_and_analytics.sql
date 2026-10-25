alter table public.site_settings
  add column if not exists booking_days integer[] not null default '{1,2,3,4,5,6}',
  add column if not exists booking_max_days integer not null default 90;

create or replace function public.validate_appointment_availability()
returns trigger language plpgsql set search_path = public as $$
declare
  allowed_days integer[] := '{1,2,3,4,5,6}';
  max_days integer := 90;
begin
  select coalesce(booking_days, allowed_days), coalesce(booking_max_days, max_days)
    into allowed_days, max_days from public.site_settings order by created_at asc limit 1;
  if new.appointment_date is not null and (
    new.appointment_date < current_date
    or new.appointment_date > current_date + max_days
    or not (extract(dow from new.appointment_date)::integer = any(allowed_days))
  ) then raise exception 'The selected appointment date is unavailable'; end if;
  return new;
end;
$$;

drop trigger if exists validate_appointment_availability on public.appointments;
create trigger validate_appointment_availability before insert or update of appointment_date on public.appointments
for each row execute function public.validate_appointment_availability();

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  event_type text not null default 'appointment_created',
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists notification_outbox_pending_idx on public.notification_outbox (status, created_at);
alter table public.notification_outbox enable row level security;

create or replace function public.queue_appointment_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_outbox (lead_id, appointment_id) values (new.lead_id, new.id);
  return new;
end;
$$;

drop trigger if exists queue_appointment_notification on public.appointments;
create trigger queue_appointment_notification after insert on public.appointments
for each row when (new.lead_id is not null) execute function public.queue_appointment_notification();

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('page_view', 'catalog_view', 'product_view', 'booking_started', 'booking_submitted')),
  path text not null,
  visitor_hash text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
alter table public.analytics_events enable row level security;

create policy "Approved admins read analytics" on public.analytics_events for select using (public.is_admin());
create policy "Approved admins manage outbox" on public.notification_outbox for all using (public.is_admin()) with check (public.is_admin());
