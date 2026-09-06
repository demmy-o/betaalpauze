# Hoe zit betaalpauze.nl in elkaar?

Lees dit eerst als je na een tijdje weer aan het project werkt. Laatst bijgewerkt: 6 september 2026.

## In één alinea

De site op https://betaalpauze.nl is een Next.js-app in deze map (`live/`). De code staat op GitHub (`demmy-o/betaalpauze`, branch `main`). Netlify kijkt naar die branch en bouwt en publiceert automatisch bij elke push. Bezoekers laten hun e-mailadres achter; dat komt in Supabase terecht en jij krijgt een mailtje via Resend.

## Wat draait waar

| Onderdeel | Waar | Inloggen met |
|---|---|---|
| Code | github.com/demmy-o/betaalpauze | GitHub-account demmy-o |
| Hosting en build | Netlify, project `betaalpauze` | demmyonink@gmail.com |
| Domein en DNS | mijn.host, domein betaalpauze.nl | mijn.host-controlepaneel |
| Database (wachtlijst) | Supabase, tabel `signups` | Supabase-account |
| Notificatiemail | Resend (afzender onboarding@resend.dev) | Resend-account |
| E-mail voor het domein | mijn.host (MX-records) | mijn.host |

## Een wijziging live zetten

1. Werk in deze map (`live/`). Lokaal testen: `npm run dev`.
2. Commit en push naar `main`. Regels voor Claude Code staan in `CLAUDE.md`.
3. Netlify bouwt vanzelf, ongeveer een minuut. Status: https://app.netlify.com/projects/betaalpauze/deploys
4. Controleer op https://betaalpauze.nl of het formulier nog "Bedankt! Je staat op de lijst" geeft.

Er is geen server, geen deploy-script en geen handmatige stap.

## Omgevingsvariabelen

Vijf stuks, allemaal in `.env.local` (lokaal, niet in git) en in Netlify onder Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NOTIFY_EMAIL`

Nieuwe variabele nodig? Toevoegen in Netlify en daarna "Trigger deploy", anders zit hij niet in de build.

## Hoe de wachtlijst werkt

`app/components/WaitlistForm.tsx` (formulier) roept `app/actions/subscribe.ts` aan (server action). Die zet het adres in Supabase-tabel `signups` (dubbele adressen worden netjes afgevangen) en stuurt via Resend een mail naar `NOTIFY_EMAIL`. Als Resend niet is ingesteld, slaat hij de mail over maar werkt het opslaan nog wel. De tabel is aangemaakt met `supabase/waitlist.sql`.

Aanmeldingen bekijken: Supabase → Table editor → `signups`.

## DNS bij mijn.host

- `betaalpauze.nl` A-record → `75.2.60.5` (Netlify)
- `www` CNAME → `betaalpauze.netlify.app` (Netlify stuurt www door naar het hoofddomein)
- MX, SPF, DKIM en DMARC blijven op mijn.host voor e-mail. Niet aanraken bij hostingwijzigingen.

## Wat is de map `v1/`?

Een ouder prototype (multi-step formulier, Notion als CMS) in een eigen git-repo. De remote heet daar bewust `old-origin`, zodat je er niet per ongeluk mee naar de live-repo pusht. Gebruik het alleen als referentie. Wil je er iets uit hergebruiken, kopieer dan de bestanden naar `live/`.

## Wat er níet meer gebruikt wordt

- Het webhostingpakket "Basic" bij mijn.host (DirectAdmin, Node.js-app). Wordt niet meer bereikt via DNS. Kan worden opgezegd als je het nergens anders voor gebruikt; let op dat de e-mail van het domein wél via mijn.host loopt.
- Vercel: niets meer van in gebruik.
- Brevo: even overwogen als mailservice, niet in gebruik; Resend is de keuze.

## Waarom Netlify en niet mijn.host

Op mijn.host moest elke wijziging handmatig gebouwd worden via een webterminal, en het instellen van omgevingsvariabelen werkte onbetrouwbaar. Dat gaf een crash bij het formulier. Netlify doet dit allemaal automatisch bij een push.
