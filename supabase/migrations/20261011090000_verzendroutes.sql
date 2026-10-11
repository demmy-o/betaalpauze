-- Drie verzendroutes voor de brief (ticket 14):
--   1. e-mailadres bekend: versturen per mail (zoals nu)
--   2. geen e-mailadres: Betaalpauze stuurt de brief per post (voorlopig met de hand)
--   3. eigen portaal bekend: eerlijke melding met de link, met de keuze om toch per post te sturen
-- Alleen toevoegingen. Er verandert niets aan bestaande gegevens.

-- Nieuwe zaakstatus: de gebruiker heeft op versturen gedrukt, de brief gaat per post.
-- Pas als de brief echt op de post is, zet de server de zaak op "verstuurd" (met de postdatum).
alter type public.zaak_status add value if not exists 'per_post' before 'verstuurd';

-- Hoe de brief van een zaak verstuurd is (of wordt). Alleen de server vult dit in:
-- gebruikers hebben op zaken alleen schrijfrecht op de factuurkolommen.
alter table public.zaken
  add column verzendroute text check (verzendroute in ('email', 'post'));

-- Wat we per bekende schuldeiser weten over betalingsregelingen.
alter table public.schuldeisers
  add column regeling_via text check (regeling_via in ('email', 'portaal', 'telefoon', 'formulier')),
  add column regeling_url text,  -- link naar het portaal of formulier
  add column telefoon text,
  add column bron_url text,      -- waar we het gevonden hebben
  add column opmerking text;     -- bijvoorbeeld "minimaal € 25 per maand, alleen via automatische incasso"
