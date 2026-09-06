-- Eenmalig uitvoeren in Supabase: SQL Editor -> New query -> plakken -> Run
-- (al uitgevoerd op het Betaalpauze-project op 6 sep 2026)

create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists signups_email_unique
  on public.signups (lower(email));

alter table public.signups enable row level security;

create policy "Anoniem mag alleen toevoegen"
  on public.signups
  for insert
  to anon
  with check (true);
