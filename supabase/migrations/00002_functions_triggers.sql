-- 1. Updated At Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trigger_pools_updated_at
  before update on public.pools
  for each row execute function public.handle_updated_at();

create trigger trigger_listings_updated_at
  before update on public.listings
  for each row execute function public.handle_updated_at();

-- 2. Haversine Distance in Kilometers
create or replace function public.haversine_distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) returns double precision as $$
declare
  r double precision := 6371; -- Earth radius in KM
  dlat double precision;
  dlon double precision;
  a double precision;
  c double precision;
begin
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat / 2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  return r * c;
end;
$$ language plpgsql immutable;

-- 3. Dual-Key Pooling Function
create or replace function public.pool_listing(p_listing_id uuid)
returns uuid as $$
declare
  v_listing record;
  v_crop_profile record;
  v_pool record;
  v_pool_id uuid;
  v_shelf_life interval;
begin
  select * into v_listing from public.listings where id = p_listing_id;
  if not found or v_listing.ai_grade is null then
    return null;
  end if;

  select * into v_crop_profile from public.crop_profiles where crop = v_listing.crop;

  -- Find nearest active pool with same crop and grade within 10 km
  select p.* into v_pool
  from public.pools p
  where p.crop = v_listing.crop
    and p.grade = v_listing.ai_grade
    and p.status = 'active'
    and public.haversine_distance_km(p.centroid_lat, p.centroid_lng, v_listing.lat, v_listing.lng) <= 10.0
  order by public.haversine_distance_km(p.centroid_lat, p.centroid_lng, v_listing.lat, v_listing.lng) asc
  limit 1;

  if found then
    -- Add to existing pool and update centroid
    v_pool_id := v_pool.id;
    update public.pools
    set
      centroid_lat = ((centroid_lat * total_kg) + (v_listing.lat * v_listing.quantity_kg)) / (total_kg + v_listing.quantity_kg),
      centroid_lng = ((centroid_lng * total_kg) + (v_listing.lng * v_listing.quantity_kg)) / (total_kg + v_listing.quantity_kg),
      total_kg = total_kg + v_listing.quantity_kg,
      updated_at = now()
    where id = v_pool_id;
  else
    -- Create new pool
    v_shelf_life := coalesce((v_crop_profile.shelf_life_hours || ' hours')::interval, interval '48 hours');
    insert into public.pools (
      crop,
      grade,
      total_kg,
      centroid_lat,
      centroid_lng,
      status,
      expires_at,
      base_price_paise,
      reserve_price_paise,
      urgency_state
    ) values (
      v_listing.crop,
      v_listing.ai_grade,
      v_listing.quantity_kg,
      v_listing.lat,
      v_listing.lng,
      'active',
      now() + v_shelf_life,
      coalesce(v_crop_profile.base_price_per_kg_paise, 3000),
      coalesce(v_crop_profile.base_price_per_kg_paise, 3000),
      'fresh'
    ) returning id into v_pool_id;
  end if;

  -- Update listing with pool reference
  update public.listings
  set pool_id = v_pool_id, status = 'pooled', updated_at = now()
  where id = p_listing_id;

  return v_pool_id;
end;
$$ language plpgsql;

-- 4. Atomic Accept Bid RPC (Row Locking)
create or replace function public.atomic_accept_bid(
  p_pool_id uuid,
  p_bid_id uuid
) returns jsonb as $$
declare
  v_pool record;
  v_bid record;
  v_payment_id uuid;
  v_total_amount_paise bigint;
  v_item record;
  v_share_pct numeric(5, 2);
  v_share_paise bigint;
  v_running_total bigint := 0;
  v_remainder bigint;
  v_first_payout_id uuid;
begin
  -- 1. Lock the pool row exclusively
  select * into v_pool
  from public.pools
  where id = p_pool_id
  for update;

  if not found then
    raise exception 'Pool not found';
  end if;

  if v_pool.status != 'active' then
    raise exception 'Pool is not active (current status: %)', v_pool.status;
  end if;

  -- 2. Validate bid
  select * into v_bid
  from public.bids
  where id = p_bid_id and pool_id = p_pool_id
  for update;

  if not found then
    raise exception 'Bid not found for this pool';
  end if;

  if v_bid.status != 'active' then
    raise exception 'Bid is no longer active';
  end if;

  -- 3. Transition pool and bids
  update public.pools
  set status = 'locked', updated_at = now()
  where id = p_pool_id;

  update public.bids
  set status = 'accepted'
  where id = p_bid_id;

  update public.bids
  set status = 'rejected'
  where pool_id = p_pool_id and id != p_bid_id and status = 'active';

  update public.listings
  set status = 'sold', updated_at = now()
  where pool_id = p_pool_id;

  -- 4. Calculate total payment in paise
  v_total_amount_paise := round((v_bid.price_per_kg_paise::numeric) * (v_bid.quantity_kg::numeric));

  -- Create payment record
  insert into public.payments (
    pool_id,
    bid_id,
    provider,
    status,
    amount_paise
  ) values (
    p_pool_id,
    p_bid_id,
    'mock',
    'escrow_locked',
    v_total_amount_paise
  ) returning id into v_payment_id;

  -- 5. Split payouts integer paise arithmetic with zero-loss remainder distribution
  for v_item in (
    select id, farmer_id, quantity_kg
    from public.listings
    where pool_id = p_pool_id
    order by quantity_kg desc
  ) loop
    v_share_pct := round((v_item.quantity_kg / v_pool.total_kg) * 100, 2);
    v_share_paise := floor((v_item.quantity_kg / v_pool.total_kg) * v_total_amount_paise);
    v_running_total := v_running_total + v_share_paise;

    insert into public.payouts (
      payment_id,
      farmer_id,
      share_pct,
      amount_paise,
      status
    ) values (
      v_payment_id,
      v_item.farmer_id,
      v_share_pct,
      v_share_paise,
      'processing'
    ) returning id into v_first_payout_id;
  end loop;

  -- Distribute leftover paise to the largest lot (first record)
  v_remainder := v_total_amount_paise - v_running_total;
  if v_remainder > 0 and v_first_payout_id is not null then
    update public.payouts
    set amount_paise = amount_paise + v_remainder
    where id = v_first_payout_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'pool_id', p_pool_id,
    'bid_id', p_bid_id,
    'payment_id', v_payment_id,
    'total_amount_paise', v_total_amount_paise
  );
end;
$$ language plpgsql;
