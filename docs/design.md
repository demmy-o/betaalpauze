# Betaalpauze — designrichtlijnen

Bron van de sfeer: liveworkstudio.com — witte basis met grote, zachte pastelvlakken per sectie,
ronde hoeken, pill-knoppen, luchtige koppen en handgetekende lijnillustraties. Warm en menselijk,
niet corporate. Status: prototype-niveau.

Gebruik dit bestand samen met `globals.css` (daar staan de tokens) en de shadcn/ui skill
(daar zitten de componenten).

---

## 1. Context

Betaalpauze helpt mensen die hun betalingen tijdelijk willen of moeten pauzeren. Ze komen binnen
met stress of schaamte, niet met zin om een formulier in te vullen. Het design moet warm en
onbedreigend voelen en tegelijk supersnel duidelijk maken wat er gebeurt. Vriendelijk, maar nooit
vrolijk over andermans geldzorgen.

---

## 2. Designprincipes

### 2.1 Kleur zit in vlakken, niet in tekst
Een pagina bestaat uit brede pastelbanden. Binnen zo'n band is bijna alles zwart of grijs.

- **Doe:** een hele sectie op lila zetten, met gewone donkere tekst erin.
- **Doe niet:** losse gekleurde koppen, gekleurde iconen en gekleurde randen door elkaar.

### 2.2 Eén ding per scherm
Elk scherm heeft één vraag, één beslissing of één boodschap.

- **Doe:** een stap met één vraag en een korte uitleg eronder.
- **Doe niet:** drie onderwerpen naast elkaar omdat ze "toch bij elkaar horen".

### 2.3 Zacht in vorm, hard in inhoud
De ronde hoeken en pastels maken het onderwerp benaderbaar. De tekst blijft keihard concreet.

- **Doe:** "Je looptijd wordt 3 maanden langer" in een zacht perzikvlak.
- **Doe niet:** de gevolgen vaag houden omdat het scherm er vriendelijk uitziet.

### 2.4 Luchtige koppen, geen schreeuw
Koppen zijn groot maar niet zwaar. Gewicht 500, ruime regelafstand, geen hoofdletters.

- **Doe:** 48px op gewicht 500 met normale letterafstand.
- **Doe niet:** 800-gewicht, uppercase of extra strakke tracking.

### 2.5 Illustratie mag, decoratie niet
Handgetekende lijnfiguren geven menselijkheid. Ze staan naast de tekst, nooit erachter.

- **Doe:** één tekening per sectie, in lijn, in ink of accentkleur.
- **Doe niet:** stockfoto's, 3D-renders, iconen zonder betekenis, tekening onder tekst.

---

## 3. Kleurgebruiksregels

Geen hex-waarden hier — die staan in `globals.css`. Dit zijn de regels.

**Basis**

| Categorie | Wanneer gebruiken | Nooit gebruiken voor |
|---|---|---|
| `ink` (donker, licht paarse zweem) | Koppen, bodytekst, primaire knop, illustratielijnen | Grote achtergrondvlakken (alleen de footer) |
| `muted` | Ondersteunende tekst, labels, helptekst | Tekst die nodig is om verder te kunnen |
| `subtle` | Iconen, disabled, placeholders — **alleen op wit of canvas** | Elke tekst op een pastelvlak (te weinig contrast) |
| `line` | Scheidingslijnen, kaartranden | Randen van invoervelden |
| `line-strong` | Randen van invoervelden, checkbox, radio | Decoratieve lijnen |
| `canvas` / `surface` | Neutrale pagina- en kaartachtergrond | Tekst |
| `accent` (violet) | Links, focusring, actieve stap, secundaire knop | Koppen, decoratie, grote vlakken |

**Pastels — alleen als achtergrond van een sectie of kaart**

| Pastel | Waarvoor | Sfeer |
|---|---|---|
| `lilac` | Hero, hoofdboodschap, de belangrijkste sectie | Kalm, merkherkenning |
| `mint` | Wat kan, wat helpt, positieve uitkomst | Bemoedigend |
| `peach` | Uitleg, gevolgen, "let op dat…" | Warm, aandacht zonder alarm |
| `sky` | Cijfers, overzicht, feiten | Zakelijk |
| `blush` | Verhaal, mens, quote | Persoonlijk |

Elke pastel heeft een `-soft` variant voor kleine vlakken binnen een sectie.

Extra regels:

- Maximaal één verzadigde pastel per viewport. Naast elkaar liggende secties krijgen nooit
  dezelfde kleur.
- Op een pastelvlak gebruik je alleen `ink` en `muted` als tekstkleur. Nooit `subtle`, nooit
  `accent` als bodytekst.
- Pastel betekent onderwerp, niet status. Groen op een sectie zegt niet "gelukt".
- Statuskleuren (`success`, `warning`, `error`) zijn iets anders dan pastels en worden alleen
  gebruikt in meldingen en validatie, nooit als sectiekleur.
- Statuskleur nooit als enige signaal: altijd een icoon of tekstlabel erbij.
- Bedragen en datums zijn `ink`, ook als ze negatief zijn. Rood maakt een schuld dramatischer
  dan nodig.

---

## 4. Copy-richtlijnen

**Toon:** Nederlands, je-vorm, kort, feitelijk, warm zonder opgewektheid. Schrijf zoals een rustige
medewerker aan de balie praat.

- Zinnen van maximaal ~15 woorden. Eén idee per zin.
- Actieve vorm. "Wij controleren je aanvraag", niet "Je aanvraag wordt gecontroleerd".
- Geen jargon: "betaalpauze" niet "moratorium", "maandbedrag" niet "annuïteit".
- Geen uitroeptekens, geen emoji, geen "Oeps".

**Knoplabels:** benoem de uitkomst, niet de handeling.

- **Doe:** "Pauze aanvragen", "Bedrag bevestigen", "Terug naar overzicht".
- **Doe niet:** "Versturen", "OK", "Volgende" (tenzij er echt niets specifiekers is).

**Foutmeldingen:** wat is er mis + wat kan de gebruiker doen. Nooit de schuld bij de gebruiker leggen.

- **Doe:** "Dit IBAN heeft 18 tekens. Controleer of je er één mist."
- **Doe niet:** "Ongeldige invoer."

**Lege states:** leg uit waarom het leeg is en wat de volgende stap is.

- **Doe:** "Je hebt nog geen pauze aangevraagd. Aanvragen duurt ongeveer 5 minuten."
- **Doe niet:** "Geen resultaten."

**Geld en tijd:** altijd expliciet. "€ 248,00 per maand" en "vanaf 1 oktober 2026", nooit
"binnenkort" of "een paar maanden".

---

## 5. Responsive regels

Mobile-first. De aanvraagflow wordt op telefoon gedaan.

- Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- Onder `md`: alles één kolom. Geen twee kolommen naast elkaar, ook geen korte velden.
- Boven `lg`: content krijgt meer ruimte, niet meer kolommen. Een formulier blijft één kolom.
- Pastelsecties lopen op elke maat volledig van rand tot rand. Nooit een pastelvlak met witte
  marges eromheen op mobiel.
- Touch targets minimaal 44×44px, minimaal 8px tussenruimte.
- Primaire knop op mobiel: volle breedte, onderaan het contentblok. Niet zwevend over de inhoud.
- Horizontale paginamarge: 20px mobiel, 32px tablet, 48px+ desktop.
- Spacingritme is een veelvoud van 4. Tussen secties 56px mobiel / 112px desktop — pastelbanden
  hebben lucht nodig, anders worden het balken.
- Tekstregels maximaal ~70 tekens.
- Illustraties verdwijnen onder `md` als ze naast tekst stonden; ze gaan niet verkleinen tot ze
  onleesbaar zijn.

---

## 6. Layout

- Container max 1200px, gecentreerd. Pastelachtergrond is full-bleed, de content erbinnen niet.
- Lopende tekst max 680px.
- Formulierkolom max 480px, links uitgelijnd binnen een gecentreerde container.
- Een pagina is een stapel gekleurde banden. Ritme: wit → pastel → wit → pastel → donkere footer.
- Kaarten: gevuld met een pastel of met `surface` + dunne `line` rand. Radius 16px. Geen
  slagschaduw. Schaduw alleen voor dingen die echt zweven (dropdown, dialog).
- Kaarten in een raster hebben gelijke hoogte en de actie staat onderaan uitgelijnd.
- Dashboard: één kolom kaarten op mobiel, 2–3 op desktop. Geen sidebar in de aanvraagflow.
- Geen icoon zonder tekstlabel in de hoofdnavigatie.

---

## 7. Formulierregels

- Formulieren staan op `surface` of `canvas`, niet op een verzadigde pastel. Een pastel mag wel
  de sectie eromheen zijn.
- Label altijd zichtbaar bóven het veld. Nooit alleen een placeholder als label.
- Placeholder alleen voor een voorbeeldformaat, bijvoorbeeld "NL91 ABNA 0417 1643 00".
- Helptekst onder het label, boven het veld, in `muted`.
- Velden hebben radius 12px en een `line-strong` rand van 1px. Focus: 2px `accent` ring met
  2px offset.
- Validatie bij het verlaten van een veld (`onBlur`), niet tijdens het typen. Wel direct opnieuw
  valideren zodra de gebruiker de fout corrigeert.
- Fout: rode rand + foutmelding onder het veld + `aria-describedby` naar die melding + `aria-invalid`.
- Eén foutsamenvatting bovenaan bij verzenden, met links naar de velden. Focus springt daarheen.
- Verplicht is de norm. Markeer alleen optionele velden, met "(optioneel)" in het label.
- Groepeer maximaal 3–5 velden per stap.
- Bedragen en IBAN: `inputmode` en `autocomplete` altijd invullen.
- Voortgang bij meerdere stappen: "Stap 2 van 4" in tekst, plus een balk. Nooit alleen de balk.
- Antwoorden blijven bewaard bij teruggaan. Nooit een gevuld formulier leegmaken.

---

## 8. Empty, error en loading states

**Leeg:** kaart in een zachte pastel (`-soft`), kop in `ink`, uitleg in `muted`, één primaire actie.
Hier mag een kleine lijnillustratie. Geen grijs vlak met een grijs icoon.

**Fout (pagina- of blokniveau):** korte kop, wat er misging, één herstelactie ("Opnieuw proberen").
Achtergrond `error-tint`, icoon in `error`. Geen technische codes tenzij de gebruiker die moet
doorgeven — dan klein en selecteerbaar onderaan.

**Laden:**

- Skeleton als je de vorm van de content al kent (kaarten, lijsten, tabellen). Skeleton is een
  `line`-vlak met dezelfde radius als het echte element, pulse niet sneller dan 1,5s.
- Spinner alleen voor acties zonder bekende vorm (verzenden, verwerken), in de knop zelf.
- Boven 3 seconden: tekst erbij die zegt wat er gebeurt ("We controleren je gegevens").
- Nooit de layout laten springen: reserveer de hoogte.

**Succes:** mint-vlak, groen icoon, `ink` tekst. Bevestig wat er nu gebeurt en wanneer, en geef de
volgende stap. Geen confetti, geen felicitatie.

---

## 9. Motion

Beweging bevestigt, ze vermaakt niet.

| Type | Duur | Easing |
|---|---|---|
| Hover, focus, kleurwissel | 120ms | `ease-out` |
| Knop-indrukken | 80ms | `ease-out` |
| Element verschijnt (kaart, melding) | 220ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Stapovergang in de flow | 260ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Dialog / sheet | 280ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Voortgangsbalk | 400ms | `ease-in-out` |

- Verschijnen = fade + maximaal 8px verschuiving. Geen schaal, geen bounce.
- Pastelvlakken animeren niet. Ze verschuiven niet mee bij scroll, ze faden niet in.
- Nooit twee dingen tegelijk animeren op één scherm.
- Bij `prefers-reduced-motion: reduce`: alle verplaatsing uit, alleen opacity, duur naar 0ms
  voor overgangen langer dan 150ms.

---

## 10. Navigatie

- Marketing: horizontale nav met tekstlinks op een witte balk boven de eerste pastelsectie.
  Geen dropdowns dieper dan één niveau. Eén primaire CTA rechts als pill-knop. Op mobiel een
  volledig scherm menu in `lilac`, niet een halve drawer.
- Aanvraagflow: geen hoofdnavigatie. Alleen logo, "Stap X van Y" en een terug-link. De gebruiker
  kan niet per ongeluk uit de flow klikken.
- Stepper: toont afgeronde, huidige en komende stappen. Afgerond = klikbaar, `ink`. Komend =
  niet klikbaar, `muted`. Huidige stap krijgt `accent`.
- Terug gaat altijd naar de vorige stap, niet naar de startpagina. Browser-terug doet hetzelfde.
- Afbreken van de flow vraagt om bevestiging en vertelt of het werk bewaard blijft.
- Dashboard: maximaal 5 items. Actief item met `ink` tekst en een 2px `accent` onderlijn.
- Breadcrumbs alleen dieper dan twee niveaus. Anders weglaten.
- Focus is altijd zichtbaar: 2px `accent` ring met 2px offset. Nooit `outline: none` zonder
  vervanging.
