# Betaalpauze — Design Principles

## Over dit product

Betaalpauze is een dienst waarmee mensen tijdelijk betalingen kunnen pauzeren. Gebruikers bevinden zich mogelijk in een stressvolle financiële situatie. Het design moet daarom kalm, helder en geruststellend zijn — nooit alarmerend of overweldigend.

---

## Kernprincipes

### 1. Duidelijk boven slim

Gebruik eenvoudige taal en herkenbare patronen. Gebruikers moeten nooit hoeven nadenken over wat een knop doet of wat een status betekent. Vermijd jargon, afkortingen en vage labels.

**Doe dit:** "Pauzeer mijn betaling" — "Bevestig aanvraag"
**Niet dit:** "Initieer uitstelverzoek" — "Verwerk transactieonderbreking"

### 2. Rustig en vertrouwenwekkend

Gebruik veel witruimte. Beperk het gebruik van felle kleuren tot statusmeldingen die echt urgent zijn. Primair blauw is voor acties; neutraal grijs is voor context. Vermijd rode kleuren buiten echte foutmeldingen.

### 3. Stap voor stap

Toon nooit te veel tegelijk. Verdeel complexe processen in kleine stappen met een duidelijke voortgangsindicator. Elke stap heeft één doel.

### 4. Eerlijk over status

Wees altijd transparant over de status van een aanvraag. Gebruik duidelijke statuslabels (zie statuskleurengebruik hieronder). Gebruik nooit vage termen als "wordt verwerkt" zonder tijdsindicatie.

### 5. Inclusief by default

Minimale contrastverhouding: 4.5:1 voor tekst, 3:1 voor UI-elementen. Alle interactieve elementen zijn bereikbaar via toetsenbord. Gebruik aria-labels bij icoon-only knoppen. Formuliervelden hebben altijd een zichtbaar label.

---

## Kleurgebruiksregels

| Kleur | Wanneer |
|---|---|
| `color-action-primary` (blauw) | Primaire acties: CTA's, links, focus |
| `color-success-500` (groen) | Bevestigingen, goedgekeurde aanvragen |
| `color-warning-500` (amber) | Attentiepunten, informatie die aandacht vraagt maar geen actie blokkeert |
| `color-error-500` (rood) | Alleen echte fouten: validatiefouten, mislukte aanvragen |
| `color-neutral-*` (grijs) | Alles overig: tekst, borders, achtergronden |

Gebruik nooit rood voor commerciële highlights of urgentie buiten fouten.

---

## Typografische hiërarchie

| Rol | Grootte | Gewicht | Gebruik |
|---|---|---|---|
| Page title | `text-3xl` | `font-bold` | Paginatitel, max 1x per pagina |
| Section heading | `text-xl` | `font-semibold` | Sectietitels, staptitels |
| Body | `text-base` | `font-regular` | Lopende tekst, uitleg |
| Label | `text-sm` | `font-medium` | Formulierlabels, chip-tekst |
| Caption | `text-xs` | `font-regular` | Tijdstempel, hulptekst |

---

## Motion en animatie

Animaties zijn functioneel, niet decoratief. Gebruik `transition-base` (150ms) voor hover en focus-states. Gebruik `transition-slow` (300ms) voor modals, drawers en toasts. Gebruik `transition-spring` voor confirmatie-animaties (checkmark, succes).

Respecteer altijd `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0ms !important; }
}
```

---

## Toegankelijkheidseisen

- Alle formuliervelden: zichtbaar label + foutmelding gekoppeld via `aria-describedby`
- Modals: focus trap, sluitbaar via Escape
- Toasts: role="alert" of role="status" afhankelijk van urgentie
- Icoon-only knoppen: altijd `aria-label`
- Kleurcodering nooit als enige indicator (gebruik ook tekst of icoon)
