-- ============================================================================
-- Margin Studio — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES
-- One row per auth.users row. role = 'admin' | 'customer'.
-- Created automatically by a trigger when someone signs up.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  organisation text,
  audience text default 'author' check (audience in ('author', 'publisher', 'other')),
  website text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can read their own profile. Admins can read all (needed for future admin user management).
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Users can update their own profile, but cannot change their own role.
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger: create a profile row automatically on signup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prevent a user from promoting themselves to admin via the update policy above.
-- (role changes must go through the service role / SQL editor.)
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_role_escalation_trigger on public.profiles;
create trigger prevent_role_escalation_trigger
  before update on public.profiles
  for each row execute procedure public.prevent_role_escalation();

-- Helper used throughout the RLS policies below.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ----------------------------------------------------------------------------
-- PRODUCTS  (shop items + free resources, distinguished by is_free)
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null,
  positioning_statement text,
  what_this_is text,
  included_items text[] default '{}',
  audience text,
  category text not null check (category in ('launch_kits','content_systems','branding_kits','templates','premade_covers')),
  price numeric(10,2) not null default 0,
  cover_image_url text,
  storage_path text, -- path inside the private 'product-files' bucket. Null for free resources delivered by email link.
  is_free boolean not null default false,
  stripe_price_id text, -- null until synced to Stripe; required before a paid product can be purchased
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_all" on public.products for select using (true);
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- POSTS  (journal / blog)
-- ----------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  author text,
  tags text[] default '{}',
  status text not null default 'published' check (status in ('draft','published')),
  published_date date default now(),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts_select_published" on public.posts for select using (status = 'published' or public.is_admin());
create policy "posts_admin_write" on public.posts for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- PORTFOLIO  (case studies)
-- ----------------------------------------------------------------------------
create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  client text,
  service_type text check (service_type in ('branding','campaigns','social-media','email-marketing','book-covers','websites')),
  cover_image_url text,
  excerpt text,
  content text,
  created_at timestamptz not null default now()
);

alter table public.portfolio enable row level security;

create policy "portfolio_select_all" on public.portfolio for select using (true);
create policy "portfolio_admin_write" on public.portfolio for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- SUBSCRIBERS  (newsletter + free-resource signups)
-- ----------------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Anyone can sign up (insert), but only admins can read the list — signups happen
-- via the anon key from the public site, reads happen from the admin panel.
create policy "subscribers_insert_public" on public.subscribers for insert with check (true);
create policy "subscribers_select_admin" on public.subscribers for select using (public.is_admin());
create policy "subscribers_delete_admin" on public.subscribers for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- INQUIRIES  (contact form)
-- ----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  project_type text default 'other' check (project_type in ('branding','campaign','social_media','email_marketing','book_cover','website','package','other')),
  budget text,
  message text not null,
  status text not null default 'new' check (status in ('new','responded','archived')),
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

create policy "inquiries_insert_public" on public.inquiries for insert with check (true);
create policy "inquiries_select_admin" on public.inquiries for select using (public.is_admin());
create policy "inquiries_update_admin" on public.inquiries for update using (public.is_admin());

-- ----------------------------------------------------------------------------
-- PURCHASES  (one row per completed Stripe payment)
-- Only ever written by the stripe-webhook edge function (service role key),
-- never directly by the client — this is what makes it trustworthy as proof of purchase.
-- ----------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  amount_paid numeric(10,2) not null,
  currency text not null default 'gbp',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'completed' check (status in ('completed','refunded')),
  download_count int not null default 0,
  max_downloads int not null default 5,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id or public.is_admin());

-- No insert/update/delete policy for regular users at all — only the service role
-- (used inside the stripe-webhook and get-download-link edge functions) can write here.

-- ----------------------------------------------------------------------------
-- STORAGE BUCKETS
-- ----------------------------------------------------------------------------
-- Public bucket for cover images / journal images uploaded via the admin panel.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Private bucket for purchasable product files. Never made public — files are only
-- ever served via short-lived signed URLs generated by the get-download-link function.
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

create policy "images_public_read" on storage.objects
  for select using (bucket_id = 'images');

create policy "images_admin_write" on storage.objects
  for insert with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_update" on storage.objects
  for update using (bucket_id = 'images' and public.is_admin());

create policy "images_admin_delete" on storage.objects
  for delete using (bucket_id = 'images' and public.is_admin());

create policy "product_files_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-files' and public.is_admin());

create policy "product_files_admin_manage" on storage.objects
  for all using (bucket_id = 'product-files' and public.is_admin());

-- Note: there is deliberately NO public/select policy on 'product-files'.
-- Downloads only ever happen through the get-download-link edge function,
-- which uses the service role key to mint a signed URL after checking the
-- purchases table (ownership + download_count < max_downloads).

-- ----------------------------------------------------------------------------
-- MAKING YOURSELF ADMIN
-- After you sign up through the site once with your own email, run:
--   update public.profiles set role = 'admin' where email = 'you@marginstudio.co.uk';
-- ----------------------------------------------------------------------------
