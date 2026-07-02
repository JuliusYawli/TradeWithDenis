create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

insert into public.admin_users (email)
values ('ampiawdennis5@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(admin_users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "Authenticated admins manage products" on public.products;
drop policy if exists "Authenticated admins manage leads" on public.leads;
drop policy if exists "Authenticated admins manage appointments" on public.appointments;
drop policy if exists "Authenticated admins manage testimonials" on public.testimonials;
drop policy if exists "Authenticated admins manage settings" on public.site_settings;

drop policy if exists "Admins can read admin users" on public.admin_users;
drop policy if exists "Admins can manage admin users" on public.admin_users;

create policy "Admins can read admin users"
  on public.admin_users for select
  using (public.is_admin());

create policy "Admins can manage admin users"
  on public.admin_users for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Approved admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Approved admins manage leads"
  on public.leads for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Approved admins manage appointments"
  on public.appointments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Approved admins manage testimonials"
  on public.testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Approved admins manage settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());
