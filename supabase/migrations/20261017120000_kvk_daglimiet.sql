-- Daglimiet voor betaalde KVK-opvragingen (ticket 01).
-- Telt per dag (Nederlandse tijd) hoeveel betaalde opvragingen we deden (vestigingsprofiel, basisprofiel).
-- Alleen de server leest en schrijft (met de geheime sleutel). RLS staat aan zonder policies: anon en
-- authenticated kunnen niets.

create table public.kvk_opvragingen (
  dag date primary key,
  aantal integer not null default 0 check (aantal >= 0)
);

alter table public.kvk_opvragingen enable row level security;
revoke all on public.kvk_opvragingen from anon, authenticated;

-- Reserveert één betaalde opvraging voor vandaag. Geeft true als dat mag, false als de limiet bereikt is.
-- In één stap, zodat twee verzoeken tegelijk de limiet niet kunnen passeren.
create or replace function public.kvk_reserveer_opvraging(maximum integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  vandaag date := (now() at time zone 'Europe/Amsterdam')::date;
  nieuw integer;
begin
  if maximum < 1 then
    return false;
  end if;

  insert into public.kvk_opvragingen as k (dag, aantal)
  values (vandaag, 1)
  on conflict (dag) do update set aantal = k.aantal + 1
    where k.aantal < maximum
  returning k.aantal into nieuw;

  return nieuw is not null;
end;
$$;

revoke all on function public.kvk_reserveer_opvraging(integer) from public, anon, authenticated;
grant execute on function public.kvk_reserveer_opvraging(integer) to service_role;
