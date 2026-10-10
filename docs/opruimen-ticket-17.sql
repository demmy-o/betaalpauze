-- Opruimen bij ticket 17 (live zetten).
-- Plak dit zelf in Supabase: SQL Editor -> New query -> plakken -> Run.
-- (Migraties met "drop" werden automatisch geweigerd, daarom staat dit hier.)
--
-- Deze policies doen al niets meer: de rechten om te schrijven zijn ingetrokken in
--   20261010130000_events_alleen_server.sql
--   20261010140000_plannen_termijnen_alleen_server.sql
-- Weghalen is alleen netjes maken. Er gaat geen data verloren.

drop policy if exists "Eigen event toevoegen" on public.events;
drop policy if exists "Eigen plan aanmaken" on public.betaalplannen;
drop policy if exists "Eigen termijnen aanmaken" on public.termijnen;
drop policy if exists "Eigen termijn aanpassen" on public.termijnen;

-- Controle achteraf: dit moet alleen nog de lees-policies laten zien.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename in ('events', 'betaalplannen', 'termijnen')
order by tablename, policyname;
