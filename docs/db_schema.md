# Supabase Schema — Relational CoNav v0.2

Minimal relational layout for persistence and evaluation storage. Run the SQL below in the Supabase SQL editor or via the Supabase CLI.

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Store them in `.env` for local dev and in Vercel project settings for production.

## Schema SQL

```sql
-- Enable UUID generation helpers (optional if already available)
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.life_contexts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  domains jsonb default '[]'::jsonb,
  roles jsonb default '[]'::jsonb,
  constraints jsonb default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists life_contexts_user_id_idx on public.life_contexts (user_id);

create table if not exists public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  input_text text not null,
  scores jsonb not null,
  composite double precision,
  notes jsonb default '{}'::jsonb,
  summary text,
  recommendations jsonb default '[]'::jsonb,
  context_used jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists evaluations_user_id_idx on public.evaluations (user_id);
create index if not exists evaluations_created_at_idx on public.evaluations (created_at desc);
```

### Row level security

Keep RLS off while testing with the anon key. When ready to lock down, enable RLS and add policies tied to Supabase Auth (e.g., `auth.uid()` matches `user_id`), or use a service role key for server-side writes.
