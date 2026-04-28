-- ThesHubHub password-only admin setup
-- Public customers can place orders and read payment settings.
-- Admin remains frontend-password based, so these anon policies are intentionally broad.
-- This is convenient, but weaker than a real authenticated backend.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  created_at timestamptz not null default now(),
  category text not null,
  plan text not null,
  customer_name text not null,
  phone text not null,
  email text not null,
  pubg_uid text,
  mlbb_user_id text,
  mlbb_region_id text,
  note text,
  screenshot_url text,
  screenshot_filename text,
  status text not null default 'Pending',
  price text,
  product_id text
);

create table if not exists public.store_settings (
  setting_key text primary key,
  wallet text,
  bank text,
  account text,
  qr_url text,
  qr_path text,
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "anon_select_orders" on public.orders;
create policy "anon_select_orders"
on public.orders
for select
to anon, authenticated
using (true);

drop policy if exists "public_insert_orders" on public.orders;
create policy "public_insert_orders"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "anon_update_orders" on public.orders;
create policy "anon_update_orders"
on public.orders
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "anon_delete_orders" on public.orders;
create policy "anon_delete_orders"
on public.orders
for delete
to anon, authenticated
using (true);

drop policy if exists "public_select_store_settings" on public.store_settings;
create policy "public_select_store_settings"
on public.store_settings
for select
to anon, authenticated
using (true);

drop policy if exists "anon_insert_store_settings" on public.store_settings;
create policy "anon_insert_store_settings"
on public.store_settings
for insert
to anon, authenticated
with check (true);

drop policy if exists "anon_update_store_settings" on public.store_settings;
create policy "anon_update_store_settings"
on public.store_settings
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "anon_delete_store_settings" on public.store_settings;
create policy "anon_delete_store_settings"
on public.store_settings
for delete
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-screenshots',
  'payment-screenshots',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-assets',
  'store-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anon_view_payment_screenshots" on storage.objects;
create policy "anon_view_payment_screenshots"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'payment-screenshots');

drop policy if exists "public_upload_payment_screenshots" on storage.objects;
create policy "public_upload_payment_screenshots"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'payment-screenshots');

drop policy if exists "anon_update_payment_screenshots" on storage.objects;
create policy "anon_update_payment_screenshots"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'payment-screenshots')
with check (bucket_id = 'payment-screenshots');

drop policy if exists "anon_delete_payment_screenshots" on storage.objects;
create policy "anon_delete_payment_screenshots"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'payment-screenshots');

drop policy if exists "public_view_store_assets" on storage.objects;
create policy "public_view_store_assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'store-assets');

drop policy if exists "anon_upload_store_assets" on storage.objects;
create policy "anon_upload_store_assets"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'store-assets');

drop policy if exists "anon_update_store_assets" on storage.objects;
create policy "anon_update_store_assets"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'store-assets')
with check (bucket_id = 'store-assets');

drop policy if exists "anon_delete_store_assets" on storage.objects;
create policy "anon_delete_store_assets"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'store-assets');
