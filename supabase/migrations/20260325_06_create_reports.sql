-- reports: safety feature — users can flag inappropriate accounts
create table public.reports (
  id          uuid        primary key default gen_random_uuid(),
  reporter_id uuid        not null references public.profiles(id) on delete cascade,
  reported_id uuid        not null references public.profiles(id) on delete cascade,
  reason      text        not null,
  description text,
  -- open: needs review | reviewed: admin looked at it | resolved: action taken
  status      text        not null default 'open'
                          check (status in ('open', 'reviewed', 'resolved')),
  created_at  timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Users can file a report (insert only as the reporter)
create policy "reports: users can submit reports"
  on public.reports
  for insert
  with check (auth.uid() = reporter_id);

-- Only service_role (admin) can read reports — no RLS select policy for regular users
-- Admins access via supabase service key, which bypasses RLS entirely
