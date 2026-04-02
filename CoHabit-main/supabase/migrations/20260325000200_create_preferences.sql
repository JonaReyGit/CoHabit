-- preferences: stores roommate lifestyle preferences used in matching algorithm
create table public.preferences (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null unique references public.profiles(id) on delete cascade,
  budget_min         integer,
  budget_max         integer,
  preferred_location text,
  move_in_date       date,
  -- 1 (very lenient) to 5 (very strict)
  cleanliness        integer     check (cleanliness between 1 and 5),
  noise_level        integer     check (noise_level between 1 and 5),
  -- e.g. 'early_bird', 'night_owl', 'flexible'
  sleep_schedule     text,
  -- e.g. 'never', 'sometimes', 'often'
  guests_frequency   text,
  smoking            boolean,
  pets               boolean,
  -- array of tags the user will not tolerate, e.g. '{smoking,loud_music}'
  deal_breakers      text[],
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.preferences enable row level security;

-- Users can only read and write their own preferences (private lifestyle data)
create policy "preferences: users manage own preferences"
  on public.preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
