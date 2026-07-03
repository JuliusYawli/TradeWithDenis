create table if not exists public.testimonial_requests (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique references public.appointments(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  token text unique not null,
  customer_name text not null,
  customer_email text,
  status text default 'created' check (status in ('created', 'sent', 'submitted', 'approved', 'declined')),
  sent_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.testimonial_requests enable row level security;

alter table public.testimonials
  add column if not exists testimonial_request_id uuid references public.testimonial_requests(id) on delete set null,
  add column if not exists appointment_id uuid references public.appointments(id) on delete set null,
  add column if not exists product_model text,
  add column if not exists status text default 'approved',
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz default now();

update public.testimonials
set status = 'approved'
where status is null;

create unique index if not exists testimonials_request_id_unique
  on public.testimonials(testimonial_request_id)
  where testimonial_request_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'testimonials_status_check'
  ) then
    alter table public.testimonials
      add constraint testimonials_status_check
      check (status in ('pending', 'approved', 'declined'));
  end if;
end
$$;

drop policy if exists "Public can read featured testimonials" on public.testimonials;
drop policy if exists "Public can read approved featured testimonials" on public.testimonials;
create policy "Public can read approved featured testimonials"
  on public.testimonials for select
  using (is_featured = true and status = 'approved');

drop policy if exists "Approved admins manage testimonial requests" on public.testimonial_requests;
create policy "Approved admins manage testimonial requests"
  on public.testimonial_requests for all
  using (public.is_admin_email(auth.email()))
  with check (public.is_admin_email(auth.email()));

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists set_testimonial_requests_updated_at on public.testimonial_requests;
create trigger set_testimonial_requests_updated_at
  before update on public.testimonial_requests
  for each row execute function public.set_updated_at();
