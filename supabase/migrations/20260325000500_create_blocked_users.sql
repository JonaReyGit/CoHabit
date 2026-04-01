-- blocked_users: lets users block others from contacting or seeing them
create table public.blocked_users (
  id         uuid        primary key default gen_random_uuid(),
  blocker_id uuid        not null references public.profiles(id) on delete cascade,
  blocked_id uuid        not null references public.profiles(id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now(),
  -- a user can only block another user once
  unique (blocker_id, blocked_id)
);

alter table public.blocked_users enable row level security;

-- Users can only manage their own block list
create policy "blocked_users: users manage own blocks"
  on public.blocked_users
  for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);
