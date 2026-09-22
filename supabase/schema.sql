-- Yahya AI Studio — Phase 1 schema (multi-user accounts)
-- Run in the Supabase SQL editor (or via psql against the Postgres DB).
--
-- MANUAL STEP (Supabase dashboard → Storage → New bucket):
--   Create a private bucket named `user-media`.
--   All media/exports live under <user_id>/uploads/... and <user_id>/exports/...

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  storage_used_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,   -- full timeline JSON
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_user_id_idx on public.projects(user_id);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bucket_path text not null,                -- e.g. <user_id>/uploads/foo.mp4
  kind text not null default 'other',       -- video | image | audio | other
  filename text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists media_files_user_id_idx on public.media_files(user_id);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,                   -- gemini | groq | pexels | pixabay | ...
  secret_encrypted text not null,           -- Fernet-encrypted provider key
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);
create index if not exists api_keys_user_id_idx on public.api_keys(user_id);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  bucket_path text not null,                -- e.g. <user_id>/exports/<task_id>.mp4
  status text not null default 'completed', -- queued | rendering | completed | failed
  created_at timestamptz not null default now()
);
create index if not exists exports_user_id_idx on public.exports(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security: users can do ALL only on their own rows
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.projects    enable row level security;
alter table public.media_files enable row level security;
alter table public.api_keys    enable row level security;
alter table public.exports     enable row level security;

-- Drop + recreate so the script is idempotent.
drop policy if exists "owner_all" on public.profiles;
drop policy if exists "owner_all" on public.projects;
drop policy if exists "owner_all" on public.media_files;
drop policy if exists "owner_all" on public.api_keys;
drop policy if exists "owner_all" on public.exports;

create policy "owner_all" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "owner_all" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner_all" on public.media_files
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner_all" on public.api_keys
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner_all" on public.exports
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create a profiles row when a new auth user signs up
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
