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
Koppen zijn groot maar niet zwaar. Gewicht 600 (semibold), ruime regelafstand, geen hoofdletters.

- **Doe:** 48px op gewicht 600 met normale letterafstand.
- **Doe niet:** 800-gewicht, uppercase of extra strakke tracking.

### 2.5 Illustratie mag, decoratie niet
Handgetekende lijnfiguren geven menselijkheid. Ze staan naast de tekst, nooit erachter.

- **Doe:** één tekening per sectie, in lijn, in ink of leisteen.
- **Doe niet:** stockfoto's, 3D-renders, iconen zonder betekenis, tekening onder tekst.

---

## 3. Kleurgebruiksregels

Geen hex-waarden hier — die staan in `globals.css`. Dit zijn de regels.

**Eén palet.** Alle hoofdkleuren komen uit het palet in Figma "Betaalpauze Design": `ink`, `leisteen`, wit en vijf
families (mint, rood, groen, geel, grijs) met elk drie stappen: sterk, `-soft` en `-tint`. Andere kleuren gebruiken
we niet. Daarnaast zijn er steunkleuren voor tekst, lijnen en de pagina.

**Palet**

| Kleur | Wanneer gebruiken | Nooit gebruiken voor |
|---|---|---|
| `ink` | Display, koppen, labels, links, primaire knop, focusring | Grote achtergrondvlakken (alleen de footer) |
| `leisteen` | Tweede donkere kleur: iconen, illustratielijnen | Lopende tekst |
| `mint` | De vlakkleur: hero, zijbalk, illustratieblok, mobiel menu | Status |
| `rood` | Fout: icoon, rand van een fout veld. `rood-tint` als achtergrond van een foutmelding | Tekst (te weinig contrast) |
| `groen` | Gelukt: icoon, stip. `groen-tint` als achtergrond | Tekst |
| `geel` | Let op: icoon, stip, tag. `geel-tint` als achtergrond, ook voor de testbalk | Tekst |
| `grijs` | Neutraal: icoon, stip. `grijs-tint` als achtergrond van een neutrale melding | Tekst |

**Steunkleuren**

| Kleur | Wanneer gebruiken | Nooit gebruiken voor |
|---|---|---|
| `ink-soft` | Platte tekst en introtekst. De standaard tekstkleur | Koppen |
| `muted` | Hulptekst onder een label | Tekst die nodig is om verder te kunnen |
| `subtle` | Disabled, placeholders, **alleen op wit of canvas** | Elke tekst op een gekleurd vlak |
| `line` | Scheidingslijnen, kaartranden | Randen van invoervelden |
| `line-strong` | Randen van invoervelden, checkbox, radio | Decoratieve lijnen |
| `canvas` / `surface` | Pagina- en kaartachtergrond | Tekst |
| `canvas-donker` | Vlak om een groep invulvelden | Kaarten, secties |

Extra regels:

- Naast elkaar liggende secties krijgen nooit dezelfde kleur.
- Info-, bevestigings- en keuzevlakken zijn wit (`surface`) op de warme achtergrond.
- Op een gekleurd vlak gebruik je alleen `ink`, `ink-soft` en `muted` als tekstkleur. Nooit `subtle`.
- Statuskleuren (`error`, `success`, `warning`, `neutraal`) verwijzen naar het palet en worden alleen gebruikt in
  meldingen, labels en validatie, nooit als sectiekleur.
- De tekst in een melding is altijd `ink`. De kleur zit in het icoon en de achtergrond.
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

- Twee breakpoints, drie formaten: mobiel tot 768, tablet (`md`) 768 tot 1024, desktop (`lg`) vanaf 1024.
  Alleen `md:` en `lg:` bestaan. Container maximaal 1200px. Gebruik het component `Pagina`.
- Onder `md`: alles één kolom. Geen twee kolommen naast elkaar, ook geen korte velden.
- Boven `lg`: content krijgt meer ruimte, niet meer kolommen. Een formulier blijft één kolom.
- Pastelsecties lopen op elke maat volledig van rand tot rand. Nooit een pastelvlak met witte
  marges eromheen op mobiel.
- Touch targets minimaal 44×44px, minimaal 8px tussenruimte.
- Primaire knop op mobiel: volle breedte, onderaan het contentblok. Niet zwevend over de inhoud.
- Horizontale paginamarge: 20px mobiel, 32px tablet, 48px desktop.
- Spacingritme is een veelvoud van 4. Tussen secties 56px mobiel / 112px desktop — pastelbanden
  hebben lucht nodig, anders worden het balken.
- Tekstregels maximaal ~70 tekens.
- Een kleurvlak met illustratie staat onder `lg` boven de tekst, iets platter (16:9). Een illustratie mag niet
  zo klein worden dat hij onleesbaar is.

---

## 6. Layout

- Container max 1200px, gecentreerd. Pastelachtergrond is full-bleed, de content erbinnen niet.
- Lopende tekst max 680px.
- Formulierkolom max 480px, gecentreerd. De kop van een stap mag breder zijn: tot 880px.
- Overzichten en bevestigingen (Mijn plan, verstuurd, betaald) gebruiken een brede kolom van 880px. Op tablet en
  mobiel schaalt die mee naar de schermbreedte.
- Marketingpagina's (zoals /partners): tekst op de neutrale achtergrond, met naast elk blok een afgerond kleurvlak
  voor een illustratie (Beeldsectie). Het vlak wisselt per blok van kant; naast elkaar liggende blokken krijgen een
  andere kleur. Op tablet en mobiel staat het vlak boven de tekst. Onderaan een donkere footer.
- Kaarten: `surface` op de warme achtergrond, eventueel met een dunne `line` rand. Radius 16px. Geen
  slagschaduw. Schaduw alleen voor dingen die echt zweven (dropdown, dialog).
- Kaarten in een raster hebben gelijke hoogte en de actie staat onderaan uitgelijnd.
- Dashboard: één kolom kaarten op mobiel, 2–3 op desktop. Geen sidebar in de aanvraagflow.
- Geen icoon zonder tekstlabel in de hoofdnavigatie.

---

## 6b. Opbouw van een stap

Naar het voorbeeld van Lemonade: rust en focus, één vraag per scherm. Geen chat, gewoon schermen na elkaar.

- **Kopbalk** bovenaan, in de kleur van de achtergrond: logo links, zonder link. De lijn onder de balk is de voortgang en vult zich groen.
  Een rond portret staat in het midden, half over de lijn. Zo weet je dat er een mens achter zit.
- **Lucht** boven de vraag: de vraag begint ruim onder de kopbalk.
- **De vraag groot en gecentreerd**, tot 880px breed, met de uitleg eronder.
- **De antwoorden in een smalle kolom** van 480px, gecentreerd. Labels en velden zijn daarbinnen links uitgelijnd.
- **Keuzes met een tekening** mogen over de hele breedte van de vraag, als tegels naast elkaar (Keuzetegel).
- **De knoppen** zijn even breed als de velden: links een ronde secundaire terugknop (pijltje naar links), zo klein
  mogelijk, en de hoofdknop vult de rest van de breedte.
- **Kaarten** (uitleg, bevestiging, samenvatting) zijn op tablet en desktop breder dan de kolom: 680px.
- **Invulvelden** staan samen in een Veldengroep: een vlak in `canvas-donker`, net zo breed als de kaarten (680px), met de
  witte velden van 480px in het midden. Knoppen staan eronder, buiten het vlak.
- In code: `<Pagina kolom="stap">` met daarin `<Stap>`. De kopbalk komt uit de layout.

---

## 6c. Knoppen

Drie niveaus, drie maten. Alle knoppen zijn pills.

- **Primair** (gevuld, ink): de hoofdactie. Maximaal één per scherm. Geen hoverkleur.
- **Secundair** (rand in ink): een tweede keuze naast de hoofdactie.
- **Tertiair** (alleen tekst, onderstreept): een kleine actie.
- **Groot** 48px voor de hoofdactie, **middel** 44px in kaarten en menu, **klein** 36px voor kleine acties
  (het klikvlak blijft 44px).
- Feedback: de muis wordt een handje, bij klikken zakt de knop 1px in, en de focusring is altijd zichtbaar.
- Een icoon mag links of rechts van de tekst. Een knop met alleen een icoon is rond en heeft een `aria-label`.

---

## 7. Formulierregels

- Formulieren staan op `surface` of `canvas`, niet op een verzadigde pastel. Een pastel mag wel
  de sectie eromheen zijn.
- Label altijd zichtbaar bóven het veld. Nooit alleen een placeholder als label.
- Geen hulptekst onder het label. Geef een voorbeeld als hinttekst in het veld: "Bijvoorbeeld: Zilveren Kruis".
  De hinttekst vervangt nooit het label. Belangrijke informatie die niet in een voorbeeld past, hoort in de uitleg van de stap.
- Velden hebben radius 12px en een `line-strong` rand van 1px. Focus: 2px `ink` ring met
  2px offset.
- Validatie bij het verlaten van een veld (`onBlur`), niet tijdens het typen. Wel direct opnieuw
  valideren zodra de gebruiker de fout corrigeert.
- Fout: rode rand + foutmelding onder het veld + `aria-describedby` naar die melding + `aria-invalid`.
- Eén foutsamenvatting bovenaan bij verzenden, met links naar de velden. Focus springt daarheen.
- Verplicht is de norm. Markeer alleen optionele velden, met "(optioneel)" in het label.
- Groepeer maximaal 3–5 velden per stap.
- Bedragen en IBAN: `inputmode` en `autocomplete` altijd invullen.
- Voortgang bij meerdere stappen: een groene balk. De stap ("Stap 2 van 4") staat in het label voor schermlezers.
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
  volledig scherm menu in `mint`, niet een halve drawer.
- Aanvraagflow: geen hoofdnavigatie. Alleen de kopbalk (logo links, zonder link, met de voortgang als lijn) en een ronde
  terugknop naast de knop "Verder".
- Rechts in de kopbalk van de aanvraag: "Inloggen", of "Mijn plan" als je al ingelogd bent. Na inloggen ga je terug
  naar de stap waar je was, met je antwoorden. Ben je ingelogd, dan vraagt stap 4 geen e-mailadres en geen code meer. De gebruiker
  kan niet per ongeluk uit de flow klikken.
- Stepper: toont afgeronde, huidige en komende stappen. Afgerond = klikbaar, `ink`. Komend =
  niet klikbaar, `muted`. Huidige stap krijgt `ink` en een balk.
- Terug gaat altijd naar de vorige stap, niet naar de startpagina. Browser-terug doet hetzelfde.
- Afbreken van de flow vraagt om bevestiging en vertelt of het werk bewaard blijft.
- Dashboard: maximaal 5 items. Actief item met `ink` tekst en een 2px `ink` onderlijn.
- Breadcrumbs alleen dieper dan twee niveaus. Anders weglaten.
- Focus is altijd zichtbaar: 2px `ink` ring met 2px offset. Nooit `outline: none` zonder
  vervanging.
