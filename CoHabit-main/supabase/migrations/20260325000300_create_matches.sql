-- matches: stores computed compatibility results between two users
create table public.matches (
  id                   uuid        primary key default gen_random_uuid(),
  user_id_1            uuid        not null references public.profiles(id) on delete cascade,
  user_id_2            uuid        not null references public.profiles(id) on delete cascade,
  -- 0–100 score calculated by the matching algorithm
  compatibility_score  integer     not null check (compatibility_score between 0 and 100),
  -- pending: neither user has acted | accepted: both want to connect | rejected: one declined
  status               text        not null default 'pending'
                                   check (status in ('pending', 'accepted', 'rejected')),
  created_at           timestamptz not null default now(),
  -- prevent duplicate match pairs
  unique (user_id_1, user_id_2)
);

alter table public.matches enable row level security;

-- Users can only see matches they are part of
create policy "matches: users can read own matches"
  on public.matches
  for select
  using (auth.uid() = user_id_1 or auth.uid() = user_id_2);
