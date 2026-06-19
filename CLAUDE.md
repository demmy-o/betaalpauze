# betaalpauze.nl

## Wat is dit?

Betaalpauze.nl helpt mensen in financiële stress om een betaalpauze aan te vragen bij schuldeisers. De app stuurt namens de gebruiker een professioneel e-mailverzoek naar de betreffende organisatie. Gratis, zonder account, zonder gedoe.

## Tech stack

- **Next.js** (App Router, TypeScript)
- **shadcn/ui** voor componenten
- **Tailwind CSS** voor styling
- **Motion** voor animaties
- **Supabase** voor database (nog te koppelen)
- **E-mail service** zoals Resend (nog te koppelen)

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

## Hosting: mijn.host

Zie `docs/mijnhost-deploy.md` voor de volledige deployment handleiding.

Samengevat:
- Hosting via **DirectAdmin** op mijn.host
- Node.js app (geen static export)
- Deploy via SSH: `git pull && npm run build && pm2 restart betaalpauze`
- Omgevingsvariabelen instellen via DirectAdmin of `.env.production`

## Omgevingsvariabelen

Maak een `.env.local` aan (nooit committen):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=noreply@betaalpauze.nl
```

## GitHub

Repository: https://github.com/demmy-o/betaalpauze

Workflow:
1. Lokaal ontwikkelen: `npm run dev`
2. Committen en pushen: `git push`
3. Op server deployen: zie `docs/mijnhost-deploy.md`
