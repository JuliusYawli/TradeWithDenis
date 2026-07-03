create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  brand text default 'Apple',
  model text not null,
  storage text not null,
  condition text not null,
  grade text,
  price numeric not null,
  down_payment_percent numeric default 40,
  weekly_payment numeric not null,
  installment_weeks integer default 12,
  stock_status text default 'in_stock',
  quantity integer default 1,
  image_urls text[] default '{}',
  description text,
  warranty_months integer default 3,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  customer_name text not null,
  phone text not null,
  email text,
  preferred_contact_method text default 'whatsapp',
  message text,
  desired_payment_option text,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  appointment_date date,
  appointment_time text,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  location text,
  rating integer default 5,
  quote text not null,
  image_url text,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text default 'TradeWithDennis',
  phone text,
  whatsapp text,
  email text,
  address text,
  opening_hours text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  google_maps_url text,
  business_registration text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

create policy "Public can read in-stock products"
  on public.products for select
  using (stock_status = 'in_stock');

create policy "Public can insert leads"
  on public.leads for insert
  with check (true);

create policy "Public can read featured testimonials"
  on public.testimonials for select
  using (is_featured = true);

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Authenticated admins manage products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated admins manage leads"
  on public.leads for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated admins manage appointments"
  on public.appointments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated admins manage testimonials"
  on public.testimonials for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated admins manage settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();
