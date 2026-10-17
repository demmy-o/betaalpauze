-- Ticket 07: de tabellen uit docs/mvp-v1.md (hoofdstuk 7), met row level security.
-- Regel: een gebruiker ziet alleen de eigen zaken en alles wat daaronder hangt.
-- De server (met SUPABASE_SECRET_KEY) mag alles; die gaat langs RLS heen.
-- De bestaande tabellen signups, aanvragen en verzekeraars blijven onaangeraakt.

-- ---------------------------------------------------------------
-- Keuzelijsten
-- ---------------------------------------------------------------

create type public.zaak_status as enum ('concept', 'verstuurd', 'akkoord', 'afgewezen', 'afgerond');
create type public.plan_soort as enum ('pauze', 'termijnen', 'pauze_en_termijnen');
create type public.termijn_status as enum ('open', 'betaald', 'niet_betaald');
create type public.bericht_status as enum ('gepland', 'verstuurd', 'overgeslagen', 'mislukt');

-- ---------------------------------------------------------------
-- schuldeisers: de bedrijven. Iedereen die is ingelogd mag ze lezen,
-- alleen de server vult ze aan.
-- ---------------------------------------------------------------

create table public.schuldeisers (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  kvk_nummer text unique,
  straat text,
  postcode text,
  plaats text,
  email text,
  email_bron text,                        -- 'eigen_lijst' of 'factuur'
  onbestelbaar boolean not null default false,
  gecontroleerd_op date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- profielen: één rij per gebruiker, zelfde id als in auth.users.
-- ---------------------------------------------------------------

create table public.profielen (
  id uuid primary key references auth.users (id) on delete cascade,
  voornaam text,
  achternaam text,
  straat text,
  postcode text,
  plaats text,
  created_at timestamptz not null default now()
);

-- Maak automatisch een leeg profiel zodra iemand voor het eerst inlogt.
create function public.maak_profiel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profielen (id) values (new.id);
  return new;
end;
$$;

create trigger nieuwe_gebruiker_profiel
  after insert on auth.users
  for each row execute function public.maak_profiel();

-- ---------------------------------------------------------------
-- zaken: één factuur bij één bedrijf.
-- ---------------------------------------------------------------

create table public.zaken (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  schuldeiser_id uuid references public.schuldeisers (id),
  schuldeiser_email text,                 -- overgenomen van de factuur
  factuurnummer text not null,
  factuurdatum date,
  bedrag_centen integer not null check (bedrag_centen > 0),
  klantnummer text,
  status public.zaak_status not null default 'concept',
  verstuurd_op timestamptz,
  created_at timestamptz not null default now()
);

create index zaken_user_id on public.zaken (user_id);

-- ---------------------------------------------------------------
-- betaalplannen: het voorstel. Een aanpassing = een nieuwe versie.
-- ---------------------------------------------------------------

create table public.betaalplannen (
  id uuid primary key default gen_random_uuid(),
  zaak_id uuid not null references public.zaken (id) on delete cascade,
  versie integer not null default 1,
  soort public.plan_soort not null,
  pauze_tot date,
  aantal_termijnen integer check (aantal_termijnen between 1 and 12),
  created_at timestamptz not null default now(),
  unique (zaak_id, versie)
);

-- ---------------------------------------------------------------
-- termijnen: elke losse betaling.
-- ---------------------------------------------------------------

create table public.termijnen (
  id uuid primary key default gen_random_uuid(),
  betaalplan_id uuid not null references public.betaalplannen (id) on delete cascade,
  volgnummer integer not null,
  vervaldatum date not null,
  bedrag_centen integer not null check (bedrag_centen > 0),
  status public.termijn_status not null default 'open',
  betaald_op timestamptz,
  unique (betaalplan_id, volgnummer)
);

-- ---------------------------------------------------------------
-- brieven: de verstuurde brief. Alleen de server schrijft.
-- ---------------------------------------------------------------

create table public.brieven (
  id uuid primary key default gen_random_uuid(),
  zaak_id uuid not null references public.zaken (id) on delete cascade,
  betaalplan_id uuid references public.betaalplannen (id),
  tekst text not null,
  toelichting text,
  pdf_pad text,
  resend_id text,
  verstuurd_op timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- berichten: alle geplande mails. Hier kijkt de wekker in.
-- Alleen de server leest en schrijft (er staan eenmalige tokens in).
-- ---------------------------------------------------------------

create table public.berichten (
  id uuid primary key default gen_random_uuid(),
  zaak_id uuid not null references public.zaken (id) on delete cascade,
  termijn_id uuid references public.termijnen (id) on delete cascade,
  stap text not null,                     -- bv. 'herinnering_vooraf'
  template text not null,
  kanaal text not null default 'email',
  gepland_op date not null,
  status public.bericht_status not null default 'gepland',
  verstuurd_op timestamptz,
  token_hash text unique,                 -- voor de ja/nee-knoppen
  token_gebruikt_op timestamptz,
  created_at timestamptz not null default now()
);

create index berichten_gepland on public.berichten (gepland_op) where status = 'gepland';

-- ---------------------------------------------------------------
-- events: wat gebruikers doen. Gebruikers mogen alleen toevoegen.
-- ---------------------------------------------------------------

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  zaak_id uuid references public.zaken (id) on delete set null,
  naam text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------

alter table public.schuldeisers enable row level security;
alter table public.profielen enable row level security;
alter table public.zaken enable row level security;
alter table public.betaalplannen enable row level security;
alter table public.termijnen enable row level security;
alter table public.brieven enable row level security;
alter table public.berichten enable row level security;
alter table public.events enable row level security;

-- Niet-ingelogde bezoekers kunnen niets in deze tabellen.
revoke all on public.schuldeisers, public.profielen, public.zaken, public.betaalplannen,
  public.termijnen, public.brieven, public.berichten, public.events from anon;

-- Hulpfunctie: is deze zaak van de ingelogde gebruiker?
create function public.is_eigen_zaak(zaak uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.zaken where id = zaak and user_id = auth.uid());
$$;

-- schuldeisers: lezen mag, schrijven alleen de server.
create policy "Ingelogd mag schuldeisers lezen" on public.schuldeisers
  for select to authenticated using (true);

-- profielen: alleen het eigen profiel.
create policy "Eigen profiel lezen" on public.profielen
  for select to authenticated using (id = auth.uid());
create policy "Eigen profiel aanpassen" on public.profielen
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- zaken: alleen de eigen zaken. Verwijderen kan niet.
create policy "Eigen zaken lezen" on public.zaken
  for select to authenticated using (user_id = auth.uid());
create policy "Eigen zaak aanmaken" on public.zaken
  for insert to authenticated with check (user_id = auth.uid());
create policy "Eigen zaak aanpassen" on public.zaken
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- betaalplannen: via de zaak.
create policy "Eigen plannen lezen" on public.betaalplannen
  for select to authenticated using (public.is_eigen_zaak(zaak_id));
create policy "Eigen plan aanmaken" on public.betaalplannen
  for insert to authenticated with check (public.is_eigen_zaak(zaak_id));

-- termijnen: via het plan en de zaak.
create policy "Eigen termijnen lezen" on public.termijnen
  for select to authenticated using (
    exists (select 1 from public.betaalplannen p where p.id = betaalplan_id and public.is_eigen_zaak(p.zaak_id))
  );
create policy "Eigen termijnen aanmaken" on public.termijnen
  for insert to authenticated with check (
    exists (select 1 from public.betaalplannen p where p.id = betaalplan_id and public.is_eigen_zaak(p.zaak_id))
  );
create policy "Eigen termijn aanpassen" on public.termijnen
  for update to authenticated using (
    exists (select 1 from public.betaalplannen p where p.id = betaalplan_id and public.is_eigen_zaak(p.zaak_id))
  );

-- brieven: alleen lezen, via de zaak.
create policy "Eigen brieven lezen" on public.brieven
  for select to authenticated using (public.is_eigen_zaak(zaak_id));

-- berichten: geen policies, dus alleen de server.

-- events: alleen toevoegen, voor jezelf.
create policy "Eigen event toevoegen" on public.events
  for insert to authenticated with check (user_id = auth.uid());
