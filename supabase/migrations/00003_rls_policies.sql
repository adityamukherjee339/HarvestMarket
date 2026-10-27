-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.crop_profiles enable row level security;
alter table public.pools enable row level security;
alter table public.listings enable row level security;
alter table public.bids enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.trust_events enable row level security;
alter table public.mandi_prices enable row level security;
alter table public.notifications enable row level security;

-- PROFILES
create policy "Allow public read of profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- CROP PROFILES
create policy "Allow public read of crop profiles"
  on public.crop_profiles for select
  using (true);

-- POOLS
create policy "Allow authenticated read of pools"
  on public.pools for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- LISTINGS
create policy "Allow read of listings"
  on public.listings for select
  using (true);

create policy "Farmers can insert their own listings"
  on public.listings for insert
  with check (
    auth.uid() = farmer_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'farmer'
    )
  );

create policy "Farmers can update their own unpooled listings"
  on public.listings for update
  using (auth.uid() = farmer_id);

-- BIDS
create policy "Buyers and pool farmers can view bids"
  on public.bids for select
  using (
    auth.uid() = buyer_id
    or exists (
      select 1 from public.listings l
      where l.pool_id = bids.pool_id and l.farmer_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'buyer'
    )
  );

create policy "Buyers can insert bids"
  on public.bids for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'buyer'
    )
  );

-- PAYMENTS
create policy "Users can view relevant payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.bids b
      where b.id = payments.bid_id and b.buyer_id = auth.uid()
    )
    or exists (
      select 1 from public.listings l
      where l.pool_id = payments.pool_id and l.farmer_id = auth.uid()
    )
  );

-- PAYOUTS
create policy "Farmers can view their own payouts"
  on public.payouts for select
  using (auth.uid() = farmer_id);

-- TRUST EVENTS
create policy "Users can view their own trust events"
  on public.trust_events for select
  using (auth.uid() = user_id);

-- MANDI PRICES
create policy "Public read for mandi prices"
  on public.mandi_prices for select
  using (true);

-- NOTIFICATIONS
create policy "Users can manage their notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
