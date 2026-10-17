-- Hulpfuncties niet via de API aan te roepen (Supabase-advies 0028/0029).
-- is_eigen_zaak verhuist naar een eigen schema dat de API niet toont.
-- De policies gebruiken hem nog wel, dus ingelogde gebruikers houden EXECUTE.

create schema if not exists private;
grant usage on schema private to authenticated;

create function private.is_eigen_zaak(zaak uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.zaken where id = zaak and user_id = auth.uid());
$$;

revoke execute on function private.is_eigen_zaak(uuid) from public, anon;
grant execute on function private.is_eigen_zaak(uuid) to authenticated;

-- Policies omzetten naar de nieuwe functie.
alter policy "Eigen plannen lezen" on public.betaalplannen
  using (private.is_eigen_zaak(zaak_id));
alter policy "Eigen plan aanmaken" on public.betaalplannen
  with check (private.is_eigen_zaak(zaak_id));

alter policy "Eigen termijnen lezen" on public.termijnen
  using (exists (select 1 from public.betaalplannen p where p.id = betaalplan_id and private.is_eigen_zaak(p.zaak_id)));
alter policy "Eigen termijnen aanmaken" on public.termijnen
  with check (exists (select 1 from public.betaalplannen p where p.id = betaalplan_id and private.is_eigen_zaak(p.zaak_id)));
alter policy "Eigen termijn aanpassen" on public.termijnen
  using (exists (select 1 from public.betaalplannen p where p.id = betaalplan_id and private.is_eigen_zaak(p.zaak_id)));

alter policy "Eigen brieven lezen" on public.brieven
  using (private.is_eigen_zaak(zaak_id));

-- De oude functie public.is_eigen_zaak blijft bestaan, maar niemand kan hem nog aanroepen.
revoke execute on function public.is_eigen_zaak(uuid) from public, anon, authenticated;

-- De trigger-functie hoeft niemand zelf aan te roepen.
revoke execute on function public.maak_profiel() from public, anon, authenticated;

-- berichten is alleen voor de server.
revoke all on public.berichten from authenticated;
