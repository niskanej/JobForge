-- ============================================
-- JobForge: Applications table with RLS
-- Run this in the Supabase SQL Editor
-- ============================================

-- Create the applications table
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  company       text not null,
  title         text not null,
  compensation_min text default '',
  compensation_max text default '',
  location      text default '',
  work_type     text default 'Remote' check (work_type in ('Remote', 'Hybrid', 'On-site')),
  url           text default '',
  notes         text default '',
  column_id     text not null default 'considering' check (column_id in ('considering', 'applied', 'interviewing', 'offer', 'rejected')),
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.applications enable row level security;

-- Policy: users can only see their own applications
create policy "Users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

-- Policy: users can only insert their own applications
create policy "Users can insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Policy: users can only update their own applications
create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

-- Policy: users can only delete their own applications
create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Index for fast user lookups
create index if not exists idx_applications_user_id on public.applications(user_id);

-- Auto-update updated_at on row changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_applications_updated
  before update on public.applications
  for each row
  execute function public.handle_updated_at();
