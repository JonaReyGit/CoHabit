-- profiles: extends Supabase auth.users with app-specific user data
create table public.profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  email            text        not null,
  full_name        text, 
  avatar_url       text,
  bio              text,
  date_of_birth    date,
  gender           text,
  phone            text,
  location_city    text,
  location_state   text,
  is_verified      boolean     not null default false,
  is_active        boolean     not null default true,
  last_active_at   timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Enable RLS — no data is readable/writable without an explicit policy
alter table public.profiles enable row level security;

-- Any authenticated user can read active profiles (needed for browsing/matching)
create policy "profiles: anyone can read active profiles"
  on public.profiles
  for select
  using (is_active = true);

-- Users can only update their own profile
create policy "profiles: users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);
