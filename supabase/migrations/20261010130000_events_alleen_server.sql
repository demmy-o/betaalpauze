-- brieven, berichten en events schrijft alleen de server (met de geheime sleutel).
-- Gebruikers mochten tot nu toe zelf events toevoegen. Dat zetten we dicht, zodat
-- niemand nepgebeurtenissen kan vastleggen, ook niet bij een zaak van een ander.
-- Voor brieven en berichten was het al dicht (geen policies). De rechten trekken we
-- daar ook in, zodat het niet meer alleen van ontbrekende policies afhangt.

-- LET OP: de policy "Eigen event toevoegen" op public.events bestaat nog, maar doet niets
-- meer: zonder het recht om toe te voegen (hieronder ingetrokken) kan niemand er gebruik
-- van maken. Hij moet later weg met:
--   drop policy "Eigen event toevoegen" on public.events;
-- (Een migratie met "drop" werd automatisch geweigerd, daarom staat die hier niet in.)

revoke insert, update, delete on public.events from authenticated, anon;
revoke insert, update, delete on public.brieven from authenticated, anon;
revoke insert, update, delete on public.berichten from authenticated, anon;
