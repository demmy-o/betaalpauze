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

## Git en pushen (regels voor Claude Code)

Er is één branch: `main`. Volg bij elke wijziging deze stappen en stop als iets afwijkt:

1. `git status` en `git branch -a`: bevestig dat je op `main` staat. Bestaat er een andere lokale branch, laat die zien en vraag wat ermee moet. Maak zelf geen branches aan en merge niets.
2. `git fetch origin` en `git status -sb`. Loopt `main` achter op `origin/main`, doe eerst `git pull --rebase origin main`.
3. Toon de lijst met gewijzigde bestanden voordat je commit. Commit nooit `.env*`, `node_modules`, `.next` of losse zip-bestanden.
4. Commit met een korte Nederlandse message in de stijl `feat: ...`, `fix: ...` of `chore: ...`.
5. `git push origin main`.
6. Meld daarna de commit-hash en dat Netlify nu automatisch bouwt (live na ongeveer een minuut).

## Omgevingsvariabelen

Lokaal in `.env.local` (nooit committen), op productie in het Netlify-dashboard (Environment variables). Beide bevatten dezelfde vijf:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NOTIFY_EMAIL=
```

Is een nieuwe env-var nodig? Zeg dat expliciet: die moet handmatig in Netlify worden toegevoegd, gevolgd door "Trigger deploy" (de `NEXT_PUBLIC_*` vars worden in de build ingebakken).

## GitHub

Repository: https://github.com/demmy-o/betaalpauze

Workflow:
1. Lokaal ontwikkelen: `npm run dev`
2. Committen en pushen naar `main` (zie regels hierboven)
3. Netlify deployt automatisch
