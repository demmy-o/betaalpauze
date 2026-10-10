# betaalpauze.nl

## Wat is dit?

Betaalpauze.nl helpt mensen in financiële stress om een betaalpauze aan te vragen bij schuldeisers. De app stuurt namens de gebruiker een professioneel e-mailverzoek naar de betreffende organisatie. Gratis, zonder account, zonder gedoe.

## Tech stack

- **Next.js** (App Router, TypeScript)
- **shadcn/ui** voor componenten
- **Tailwind CSS** voor styling
- **Motion** voor animaties
- **Supabase** voor database (tabel `signups` voor de wachtlijst)
- **Resend** voor e-mailnotificaties

## Projectstructuur

```
betaalpauze.nl/
  app/
    page.tsx              # Landingspagina
    aanvragen/
      page.tsx            # Multi-step aanvraagformulier
    api/
      send-email/
        route.ts          # Server-side email verzending (Resend)
    components/
      landing/            # Hero, Features, HowItWorks, FAQ
      steps/              # Formulierstappen
    lib/
      types.ts            # TypeScript types
      validations.ts      # Zod validaties
    context/
      CopyContext.tsx     # Gecentraliseerde teksten
  public/
```

## Conventies

- Gebruik **server components** waar mogelijk, client components alleen als nodig (`"use client"`)
- API keys gaan altijd **server-side** via API routes, nooit in de browser
- Teksten gecentraliseerd in `CopyContext` zodat copy makkelijk aan te passen is
- **Motion** voor alle animaties, geen CSS keyframes
- **Zod** voor validatie van formulierdata

## Referentie: v1 prototype

Er is een eerder prototype op:
`~/Documents/PROJECTEN/Prototypes/side-projects/betaalpauze/v1`

Dit bevat een werkende multi-step form met de volgende stappen:
1. Organisatie zoeken (met autocomplete)
2. Bedrag invullen
3. Factuurnummer (optioneel)
4. Geboortedatum
5. Voornaam, achternaam, e-mail, telefoon
6. Review met e-mailvoorbeeld
7. Success

Gebruik de v1 code als referentie voor de UX en copy, maar schrijf alles opnieuw (schone lei).

## Hosting en deploy: Netlify

De site draait op **Netlify** (project `betaalpauze`, gekoppeld aan deze GitHub-repo). Netlify bouwt en publiceert automatisch bij elke push naar `main`. Er is geen deploy-script, GitHub Action of serverstap meer nodig.

- Live: https://betaalpauze.nl (www redirect naar apex)
- Deploys en logs: https://app.netlify.com/projects/betaalpauze/deploys
- Build: Next.js Runtime, `npm run build`, publish directory `.next`
- DNS staat bij mijn.host (A-record naar Netlify, www CNAME naar betaalpauze.netlify.app). Mail loopt via mijn.host.
- Lees `docs/HOE-ZIT-HET.md` voor het volledige overzicht (accounts, DNS, wachtlijst, wat `v1/` is).

## Bouwen aan de MVP (spelregels voor Claude Code)

Wat we bouwen staat in `docs/mvp-v1.md`. De tickets staan in Notion: database Roadmap, weergave MVP-sprint.

Hoe het eruitziet staat in `docs/design.md` (regels voor kleur, copy, formulieren, states en motion). De tokens staan in `app/globals.css`. `docs/design-tokens.css` is alleen de referentie, niet importeren. Twee namen uit `design.md` heten in de code anders, omdat shadcn ze al gebruikt:

- design `muted` (tekstkleur) is `text-muted-foreground`
- design `accent` (violet) is `violet`, `violet-strong` en `violet-tint`

1. **Eén stap tegelijk.** Werk aan één ticket en begin niet aan het volgende.
2. **Na elke stap testen in de browser.** Gebruik Playwright op http://localhost:3000 en kijk of het werkt zoals het ticket zegt.
3. **Daarna stoppen voor akkoord.** Laat zien wat je gedaan en getest hebt, en wacht tot Demmy akkoord geeft.
4. **Nooit `.env` committen.** Geen `.env*`, `node_modules`, `.next` of losse zip-bestanden.
5. **Mail altijd in testmodus.** Verstuur geen echte mail naar schuldeisers of gebruikers zolang de testmodus aan staat.
6. **Na elk ticket het ticket in Notion op Klaar zetten**, pas na akkoord van Demmy.

### Vaste regels voor koppelingen

- **Mail:** alleen via Resend, alleen vanaf een adres op @betaalpauze.nl, en altijd met `MAIL_TEST_MODE` uit `.env.local`. In testmodus gaat alle mail naar `MAIL_TEST_ADDRESS`.
- **Supabase:** gebruik `SUPABASE_SECRET_KEY` alleen op de server, nooit in de browser of in een `NEXT_PUBLIC_*` variabele. Raak de bestaande tabel `signups` (de wachtlijst) niet aan.
- **KVK:** gebruik de KVK-testomgeving zolang `KVK_API_KEY` leeg is.
- **`v1/`** is een oud prototype. Niet aanraken.

## Git en pushen (regels voor Claude Code)

Tijdens de MVP werken we op de branch `mvp`. Een push naar `main` gaat meteen live via Netlify. Volg bij elke wijziging deze stappen en stop als iets afwijkt:

1. `git status` en `git branch -a`: bevestig dat je op `mvp` staat. Sta je op `main`, stop en vraag wat de bedoeling is. Merge niets.
2. Toon de lijst met gewijzigde bestanden voordat je commit.
3. Commit met een korte Nederlandse message in de stijl `feat: ...`, `fix: ...` of `chore: ...`.
4. Push alleen na akkoord van Demmy, en alleen naar `mvp`. Push nooit naar `main` zonder akkoord.
5. Meld daarna de commit-hash.

## Omgevingsvariabelen

Lokaal in `.env.local` (nooit committen), op productie in het Netlify-dashboard (Environment variables). Beide bevatten dezelfde tien:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NOTIFY_EMAIL=
SUPABASE_SECRET_KEY=
KVK_API_KEY=
MAIL_TEST_MODE=
MAIL_TEST_ADDRESS=
WEKKER_GEHEIM=
```

`WEKKER_GEHEIM` beschermt `/api/wekker` (de herinneringen). Met de hand draaien: `npm run wekker -- JJJJ-MM-DD` (eigen datum alleen in testmodus).

Is een nieuwe env-var nodig? Zeg dat expliciet: die moet handmatig in Netlify worden toegevoegd, gevolgd door "Trigger deploy" (de `NEXT_PUBLIC_*` vars worden in de build ingebakken).

## GitHub

Repository: https://github.com/demmy-o/betaalpauze

Workflow:
1. Lokaal ontwikkelen: `npm run dev`
2. Committen op `mvp`, pushen alleen na akkoord (zie regels hierboven)
3. Na samenvoegen met `main` deployt Netlify automatisch
