-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('farmer', 'buyer')),
  full_name text not null,
  phone text,
  language text not null default 'en' check (language in ('en', 'hi')),
  village text,
  company_name text,
  business_type text check (business_type in ('hotel', 'restaurant', 'supermarket', 'wholesaler', 'other') or business_type is null),
  gst_number text,
  trust_score integer not null default 50 check (trust_score >= 0 and trust_score <= 100),
  trust_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CROP PROFILES TABLE
create table if not exists public.crop_profiles (
  crop text primary key,
  display_name_en text not null,
  display_name_hi text not null,
  shelf_life_hours integer not null,
  decay_rate numeric(5, 4) not null,
  floor_pct numeric(5, 2) not null,
  base_price_per_kg_paise integer not null
);

-- 3. POOLS TABLE
create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  crop text not null references public.crop_profiles(crop),
  grade text not null check (grade in ('A', 'B', 'C')),
  total_kg numeric(10, 2) not null default 0,
  centroid_lat double precision not null,
  centroid_lng double precision not null,
  status text not null default 'active' check (status in ('active', 'locked', 'paid', 'closed', 'expired')),
  expires_at timestamptz not null,
  base_price_paise integer not null,
  reserve_price_paise integer not null,
  urgency_state text not null default 'fresh' check (urgency_state in ('fresh', 'moderate', 'urgent', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. LISTINGS TABLE
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  crop text not null references public.crop_profiles(crop),
  quantity_kg numeric(10, 2) not null check (quantity_kg > 0),
  ai_grade text check (ai_grade in ('A', 'B', 'C') or ai_grade is null),
  ai_confidence numeric(4, 3) check (ai_confidence >= 0 and ai_confidence <= 1),
  defects jsonb default '[]'::jsonb,
  photo_urls text[] default array[]::text[],
  lat double precision not null,
  lng double precision not null,
  village text,
  captured_at timestamptz not null default now(),
  status text not null default 'logged' check (status in ('logged', 'pooled', 'sold', 'cancelled')),
  pool_id uuid references public.pools(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. BIDS TABLE
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  price_per_kg_paise integer not null check (price_per_kg_paise > 0),
  quantity_kg numeric(10, 2) not null check (quantity_kg > 0),
  pickup_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'outbid', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now()
);

-- 6. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  bid_id uuid not null references public.bids(id) on delete cascade,
  provider text not null default 'mock' check (provider in ('mock', 'razorpay')),
  provider_order_id text,
  status text not null default 'pending' check (status in ('pending', 'escrow_locked', 'completed', 'failed')),
  amount_paise integer not null check (amount_paise >= 0),
  created_at timestamptz not null default now()
);

-- 7. PAYOUTS TABLE
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  share_pct numeric(5, 2) not null,
  amount_paise integer not null check (amount_paise >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'credited', 'failed')),
  created_at timestamptz not null default now()
);

-- 8. TRUST EVENTS TABLE
create table if not exists public.trust_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  value numeric(5, 2) not null,
  notes text,
  created_at timestamptz not null default now()
);

-- 9. MANDI PRICES TABLE
create table if not exists public.mandi_prices (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  market text not null,
  price_per_quintal_paise integer not null,
  date date not null default current_date,
  source text not null default 'seeded'
);

-- 10. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_listings_farmer on public.listings(farmer_id);
create index if not exists idx_listings_pool on public.listings(pool_id);
create index if not exists idx_listings_crop_grade on public.listings(crop, ai_grade);
create index if not exists idx_pools_crop_grade on public.pools(crop, grade);
create index if not exists idx_pools_status on public.pools(status);
create index if not exists idx_bids_pool on public.bids(pool_id);
create index if not exists idx_bids_buyer on public.bids(buyer_id);
create index if not exists idx_payments_pool on public.payments(pool_id);
create index if not exists idx_payouts_farmer on public.payouts(farmer_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read);
