-- messages: direct messages between matched users
create table public.messages (
  id          uuid        primary key default gen_random_uuid(),
  sender_id   uuid        not null references public.profiles(id) on delete cascade,
  receiver_id uuid        not null references public.profiles(id) on delete cascade,
  content     text        not null,
  is_read     boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Users can read any message they sent or received
create policy "messages: users can read own messages"
  on public.messages
  for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can only insert messages where they are the sender (no impersonation)
create policy "messages: users can send as themselves"
  on public.messages
  for insert
  with check (auth.uid() = sender_id);
