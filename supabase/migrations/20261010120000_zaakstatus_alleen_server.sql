-- De status van een zaak (en wanneer hij verstuurd is) mag alleen de server zetten.
-- Gebruikers mogen een zaak aanmaken en de factuurgegevens aanpassen, maar niet
-- zelf "verstuurd", "akkoord" of "afgerond" invullen. Dat doen we met rechten per kolom:
-- wat hier niet genoemd wordt, kan een ingelogde gebruiker niet schrijven.
-- De row level security blijft daarnaast gewoon gelden (alleen je eigen zaken).

revoke insert, update on public.zaken from authenticated;

grant insert (user_id, schuldeiser_id, schuldeiser_email, factuurnummer, factuurdatum, bedrag_centen, klantnummer)
  on public.zaken to authenticated;

grant update (schuldeiser_id, schuldeiser_email, factuurnummer, factuurdatum, bedrag_centen, klantnummer)
  on public.zaken to authenticated;
