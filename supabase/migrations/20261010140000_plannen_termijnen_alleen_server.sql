-- Betaalplannen en termijnen schrijft alleen de server (met de geheime sleutel).
-- Gebruikers mogen hun eigen plan en termijnen lezen, maar niets toevoegen, aanpassen
-- of verwijderen. Een termijn op "betaald" zetten gaat via de server (lib/betaling.ts).

-- LET OP: deze policies bestaan nog, maar doen niets meer zonder de rechten hieronder.
-- Ze moeten later weg met:
--   drop policy "Eigen plan aanmaken" on public.betaalplannen;
--   drop policy "Eigen termijnen aanmaken" on public.termijnen;
--   drop policy "Eigen termijn aanpassen" on public.termijnen;
-- (Een migratie met "drop" werd eerder automatisch geweigerd, daarom staat die hier niet in.)

revoke insert, update, delete on public.betaalplannen from authenticated, anon;
revoke insert, update, delete on public.termijnen from authenticated, anon;
