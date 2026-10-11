-- Aanmeldingen voor een pilot via /partners (ticket 15).
-- Alleen de server schrijft en leest (server action met de geheime sleutel).
-- Geen rechten en geen policies voor anon en authenticated: RLS staat aan, dus zij kunnen niets.

create table public.partner_aanmeldingen (
  id uuid primary key default gen_random_uuid(),
  naam text not null check (char_length(naam) between 1 and 200),
  organisatie text not null check (char_length(organisatie) between 1 and 200),
  functie text check (char_length(functie) <= 200),
  email text not null check (char_length(email) between 3 and 320),
  bericht text check (char_length(bericht) <= 2000),
  -- Hash van het IP-adres (met een geheime salt), voor de limiet van 5 aanmeldingen per uur.
  -- Het IP-adres zelf bewaren we niet.
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index partner_aanmeldingen_ip_tijd on public.partner_aanmeldingen (ip_hash, created_at);

alter table public.partner_aanmeldingen enable row level security;
revoke all on public.partner_aanmeldingen from anon, authenticated;
