-- Postadres per zaak, voor de route "per post" als we het adres van het bedrijf niet compleet hebben.
-- De gebruiker neemt het dan over van de factuur. We zetten het op de zaak en niet in de
-- gedeelde lijst schuldeisers, zodat niemand de gegevens van een bedrijf voor anderen kan veranderen.
-- Alleen de server vult dit in: gebruikers hebben op zaken alleen schrijfrecht op de factuurkolommen.

alter table public.zaken
  add column post_straat text,
  add column post_postcode text,
  add column post_plaats text;
