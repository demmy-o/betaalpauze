# Betaalpauze v1: zo werkt het

> Overgenomen uit Notion: [Betaalpauze v1: zo werkt het](https://app.notion.com/p/3f47242d1db481f5835df5d781a7f9f7) (Betaalpauze.nl / De bouw), stand 9 oktober 2026. Notion blijft de bron. De plaatjes staan alleen in Notion.

> **Lees dit eerst.** Deze pagina legt de eerste versie van Betaalpauze.nl uit, voor iemand die er nog niets van weet. Eerst wat het doet, dan hoe het voelt voor de gebruiker, en pas daarna de techniek.

## 1. Het idee in één plaatje

Sommige mensen krijgen een rekening die ze nu even niet kunnen betalen. Bellen met de schuldeiser voelt eng, dus ze doen niets. Dan komen er herinneringen, boetes en soms een incassobureau.

Betaalpauze maakt het makkelijk om een betaalafspraak te maken én om die na te komen. Je vult een paar vragen in. Wij maken er een nette brief van en mailen die naar de schuldeiser. Daarna herinneren we je aan elke betaling.

*(Plaatje in Notion: jij, Betaalpauze en de schuldeiser.)*

> 💶 **Er gaat nooit geld via Betaalpauze.** De gebruiker betaalt de schuldeiser zelf, via de eigen bank. Wij maken de afspraak en helpen herinneren. Dat houdt het simpel en voorkomt extra regels die gelden als je zelf geld int.

## 2. Wat de eerste versie wel en niet doet

De eerste versie (de MVP) doet één ding goed: een betaalvoorstel maken, versturen en nakomen.

### Wel

- Een formulier in een paar korte stappen
- Het bedrijf opzoeken bij de KVK
- Een nette brief met harde afspraken
- De brief mailen naar de schuldeiser, met kopie naar de gebruiker
- Een pagina **Mijn plan** met het betaalschema
- Herinneringen per mail rond elke betaaldatum

### Nog niet

- Een account met wachtwoord (een code per mail is genoeg)
- Brieven per post
- Sms of WhatsApp
- Betalen via Betaalpauze
- Een portaal voor schuldeisers
- AI die de brief schrijft

## 3. De aanvraag in 7 schermen

Zo ziet het eruit op een telefoon. Elk scherm stelt één vraag. Invullen duurt ongeveer 5 minuten.

*(Plaatje in Notion: de aanvraag in 7 schermen.)*

1. **Schuldeiser.** Je typt de naam van het bedrijf. Wij zoeken het op bij de KVK en laten het adres zien. Het e-mailadres neem je over van de factuur. Bij bekende bedrijven vullen we dat zelf al in.
2. **Factuur.** Factuurnummer, datum, bedrag en eventueel je klantnummer. Meer niet.
3. **Jouw gegevens.** Naam, adres en e-mailadres.
4. **E-mailcode.** We sturen een code van 6 cijfers naar je mail. Zo weten we dat jij het bent, en kan niemand een brief uit jouw naam sturen.
5. **Je voorstel.** Je kiest: een pauze, termijnen, of eerst pauze en dan termijnen. Wij rekenen direct uit wat je betaalt en tot wanneer.
6. **Brief bekijken.** Je leest de brief. Je mag iets toevoegen in je eigen woorden. Pas als jij op versturen drukt, gaat hij weg.
7. **Verstuurd.** Je ziet wat er nu gebeurt en wanneer je de eerste herinnering krijgt.

## 4. De hele reis van de gebruiker

De aanvraag is maar het begin. Hieronder de hele reis: wat de gebruiker doet, wat wij doen, en hoe het voelt.

*(Plaatje in Notion: customer journey van landen tot klaar.)*

De reis heeft drie delen:

- **Aanvragen** (5 minuten). Van "ik kan dit niet betalen" naar "mijn voorstel is verstuurd".
- **Wachten** (tot 14 dagen). De schuldeiser reageert rechtstreeks naar de gebruiker. Hoort die niets, dan vragen we na 14 dagen of er al nieuws is.
- **Nakomen** (zolang het plan loopt). Rond elke betaling een herinnering, en daarna de vraag of het gelukt is.

> 🧠 **Het gevoel is de leidraad.** De gebruiker begint gespannen. Na het versturen komt opluchting. Tijdens het wachten komt de onzekerheid terug, en daar helpen we met één vriendelijke vraag. Aan het eind willen we trots: je hebt je afspraak nagekomen.

## 5. Na het versturen: de herinneringen

Dit deel willen we later slimmer maken, op basis van wat we leren. Daarom is het zo gebouwd dat je makkelijk iets kunt toevoegen of verschuiven.

*(Plaatje in Notion: herinneringen per termijn en hoe de wekker werkt.)*

Per termijn krijgt de gebruiker drie mails:

- **3 dagen ervoor:** je termijn komt eraan.
- **Op de betaaldatum:** vandaag betalen, met rekeningnummer en kenmerk.
- **2 dagen erna:** heb je betaald? Eén klik op ja of nee. Bij nee bieden we hulp: een deel betalen of het plan aanpassen.

### Voor de bouwer: hoe je de herinneringen aanpast

Alle herinneringen staan in één lijstje in de code. Een stap toevoegen, een dag verschuiven of een andere tekst proberen is één regel aanpassen. Daarna zet Netlify het vanzelf online.

```json
[
  { "stap": "reactie_check",      "anker": "verstuurd",       "dagen": 14, "kanaal": "email", "template": "al-reactie" },
  { "stap": "herinnering_vooraf", "anker": "termijn",         "dagen": -3, "kanaal": "email", "template": "termijn-komt-eraan" },
  { "stap": "herinnering_dag",    "anker": "termijn",         "dagen": 0,  "kanaal": "email", "template": "vandaag-betalen" },
  { "stap": "checkin",            "anker": "termijn",         "dagen": 2,  "kanaal": "email", "template": "heb-je-betaald" },
  { "stap": "afsluiting",         "anker": "laatste_termijn", "dagen": 1,  "kanaal": "email", "template": "klaar" }
]
```

**anker** is het moment waar we vanaf tellen. **dagen** is hoeveel dagen ervoor (min) of erna (plus). Later kan er een kanaal bij, zoals sms, zonder dat de rest verandert.

## 6. De techniek: welke diensten en waarom

Betaalpauze draait op een handvol online diensten. Elke dienst doet één ding.

*(Plaatje in Notion: de stack, welke dienst doet wat.)*

| Dienst | Wat het doet, in gewone taal | Kosten |
| --- | --- | --- |
| **Claude Code** | Schrijft samen met Demmy de code. | Zit in het Claude-abonnement |
| **GitHub** | Bewaart de code en elke eerdere versie, zodat niets kwijtraakt. | Gratis |
| **Netlify** | Zet de website online. Bij elke wijziging in GitHub bouwt Netlify de site vanzelf opnieuw. Hier draait ook de wekker die elke ochtend de herinneringen verstuurt. | Gratis |
| **Next.js, Tailwind, shadcn/ui** | De bouwstenen van de website zelf: de pagina's, de opmaak en de knoppen en velden. | Gratis |
| **Supabase** | De database en de kluis. Bewaart alle zaken en plannen, verstuurt de inlogcode en zorgt dat iedereen alleen zijn eigen gegevens ziet. | Gratis |
| **Resend** | Verstuurt alle e-mail: de brief, de code en de herinneringen. Vanaf een adres van betaalpauze.nl. | Gratis tot 3.000 mails per maand |
| **KVK API** | Zoekt het bedrijf op: naam, KVK-nummer en adres. Geeft geen e-mailadres of telefoonnummer. | € 6,40 per maand |
| **mijn.host** | Beheert de domeinnaam betaalpauze.nl en stuurt bezoekers door naar Netlify. | Bestaand contract |

> 💰 **Vaste kosten: € 6,40 per maand.** De rest is gratis tot het druk wordt. De eerste grens die we tegenkomen is 100 mails per dag bij Resend. Dat is pas bij honderd of meer mensen tegelijk in een plan. Daarna kost Resend $ 20 per maand.

### Wat we niet meer gebruiken

Eerder werkte Betaalpauze met een andere opzet. Die is vervangen:

- **Framer** → de website zit nu in Next.js. Meer vrijheid, en Claude Code kan erin werken.
- **n8n** → alle automatisering zit in de code. Geen extra abonnement en alles op één plek. n8n kan later terug als we visueel willen sleutelen.
- **Brevo** → Resend doet alle mail. De oude Brevo-sleutel moet nog worden ingetrokken.
- **Vercel** → Netlify doet de hosting.

### Woordenlijst

- **Stack:** het rijtje diensten en tools waar een product op draait.
- **MVP:** de kleinste versie die echt werkt en waar je van kunt leren.
- **Hosting:** de computer op internet waar de website op staat.
- **Database:** een grote, slimme tabel waar alle gegevens in staan.
- **API:** een manier waarop twee diensten met elkaar praten. De KVK API laat onze site vragen: welk bedrijf hoort bij deze naam?
- **Deploy:** een nieuwe versie online zetten. Bij ons gaat dat vanzelf.
- **Scheduled Function (de wekker):** een stukje code dat op een vast moment vanzelf draait, bij ons elke ochtend om 08:00.
- **Row level security:** een regel in de database zelf: je mag alleen rijen zien die van jou zijn.

## 7. Waar de gegevens staan

Alle gegevens staan in Supabase, verdeeld over een paar tabellen. Je kunt het zien als tabbladen in één spreadsheet.

| Tabel | Wat erin staat |
| --- | --- |
| `schuldeisers` | De bedrijven: naam, KVK-nummer, adres en e-mailadres. Bekende bedrijven vullen we zelf aan. |
| `profielen` | De gebruikers: naam en adres. |
| `zaken` | Eén factuur bij één bedrijf, met de status: concept, verstuurd, akkoord, afgewezen of afgerond. |
| `betaalplannen` | Het voorstel: pauze, termijnen of allebei. Wordt het plan aangepast, dan komt er een nieuwe versie bij. |
| `termijnen` | Elke losse betaling: datum, bedrag en of die betaald is. |
| `brieven` | De verstuurde brief en de PDF. |
| `berichten` | Alle geplande mails met een datum. Hier kijkt de wekker elke ochtend in. |
| `events` | Alles wat gebruikers doen: welke stap ze zien, of ze klikken, of ze betaald hebben. Hier leren we van. |

> 📇 **Later: onze eigen lijst met schuldeisers.** De KVK geeft geen e-mailadressen. Daarom houden we zelf bij welk adres bij welk bedrijf hoort, zoals Zilveren Kruis. Elk kwartaal checken we de lijst. Komt een mail terug als onbestelbaar, dan krijgt dat bedrijf vanzelf een vlag. Voor de MVP vullen we de lijst met de hand, met 10 tot 20 bekende partijen.

## 8. De brief

Eén vaste tekst met invulvelden. Kort, zakelijk en respectvol. Geen AI, zodat elke brief voorspelbaar is.

In elke brief staat:

- Wie het stuurt en aan wie, met datum, factuurnummer en klantnummer
- Dat de gebruiker de factuur en het bedrag erkent
- Het voorstel, met exacte bedragen en data
- Het verzoek om tijdens de regeling geen extra kosten of incasso te starten
- Het verzoek om binnen 14 dagen per mail te bevestigen
- Eventueel een korte toelichting in eigen woorden

De mail komt van **voorstel@betaalpauze.nl**, namens de gebruiker. Antwoorden gaan rechtstreeks naar de gebruiker, en die krijgt ook een kopie.

> ⚖️ Een voorstel is pas een afspraak als de schuldeiser akkoord gaat. Dat zeggen we eerlijk in de brief en op het scherm. Laat de tekst één keer nakijken door een jurist voordat de eerste echte brief verstuurd wordt.

## 9. Veiligheid in het kort

- **Inloggen zonder wachtwoord.** Supabase stuurt een code per mail. Wie de code heeft, heeft toegang tot zijn eigen plan.
- **Ieder ziet alleen het eigen dossier.** Dat regelt de database zelf, ook als er een fout in de website zou zitten.
- **Klikken in een mail is veilig.** De ja/nee-knoppen in de herinnering hebben een eenmalige code die alleen voor die ene mail werkt.
- **Geheime sleutels staan nooit in de code.** Ze staan alleen in de instellingen van Netlify.

## 10. Zo gaan we bouwen

Stap voor stap. Elke stap kan los gebouwd en getest worden.

- [ ] KVK-abonnement aanvragen (kan een paar dagen duren)
- [ ] Domein betaalpauze.nl verifiëren bij Resend (records toevoegen bij mijn.host)
- [ ] Supabase inrichten: tabellen, beveiliging en de inlogcode
- [ ] Het formulier bouwen, stap 1 tot en met 4, met KVK-zoeken
- [ ] De brief, het voorbeeld en de PDF
- [ ] Versturen via Resend, met kopie en bijlage
- [ ] De pagina Mijn plan
- [ ] De herinneringen en de wekker
- [ ] De ja/nee-knoppen in de mail
- [ ] Testen met een eigen zaak, daarna met 3 tot 5 echte gebruikers

## 11. Open vragen

- Hoe lang mag een pauze maximaal duren, en hoeveel termijnen mogen er zijn? Voorstel: maximaal 3 maanden pauze en 12 termijnen.
- Wat als er geen e-mailadres op de factuur staat? Voor nu: de gebruiker downloadt de PDF en verstuurt zelf. Later misschien per post.
- Privacy: een privacyverklaring, hoe lang we gegevens bewaren, en afspraken met Supabase en Resend over de verwerking van gegevens.
- Checken we of een bedrijf nog actief is bij de KVK? Dat kan met dezelfde zoekopdracht.
- Hoe weten we of iemand echt betaald heeft? Voor nu op eigen zeggen, later misschien via een bankkoppeling.

## 12. Handige links

- Live site: [betaalpauze.nl](https://betaalpauze.nl)
- Code: [github.com/demmy-o/betaalpauze](https://github.com/demmy-o/betaalpauze)
- Hosting: [Netlify, project betaalpauze](https://app.netlify.com/sites/betaalpauze)
- Database: [Supabase dashboard](https://supabase.com/dashboard/project/wlfuakqareslcscgsxps)
- E-mail: [Resend](https://resend.com)
- KVK: [developers.kvk.nl](https://developers.kvk.nl)

> 🔑 Wachtwoorden en API-sleutels staan bewust **niet** op deze pagina. Ze horen in een wachtwoordmanager en in de instellingen van Netlify.
