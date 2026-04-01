# Patroon: empty states

## Beschrijving

Empty states verschijnen wanneer er geen data is om te tonen. Bij Betaalpauze zijn dit momenten zoals: geen actieve aanvragen, een lege berichtgeschiedenis, of een zoekresultaat zonder resultaten.

---

## Wanneer gebruiken

- Geen actieve aanvragen in het dashboard
- Geen resultaten bij zoeken of filteren
- Eerste keer inloggen (onboarding-context)
- Fout bij laden van data (error state)

---

## Structuur

```
[Illustratie of icoon]
[Titel]
[Korte beschrijving]
[Optionele CTA]
```

---

## Default empty state

```tsx
<div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
  <div className="w-12 h-12 text-neutral-300">
    {/* Icoon, bijv. DocumentIcon */}
  </div>
  <div className="flex flex-col gap-1">
    <h3 className="text-lg font-semibold text-neutral-900">
      Geen aanvragen gevonden
    </h3>
    <p className="text-sm text-neutral-500 max-w-xs">
      Je hebt nog geen betaalpauze aangevraagd. Dat kan hier direct.
    </p>
  </div>
  <a href="/aanvragen" className="
    px-5 py-3 text-sm font-semibold
    bg-primary-500 text-neutral-0
    rounded-md shadow-xs hover:bg-primary-600
    transition-base focus-visible:shadow-focus focus-visible:outline-none
  ">
    Aanvraag starten
  </a>
</div>
```

---

## Search / filter empty state

Gebruik wanneer een zoekopdracht of filter geen resultaten oplevert. Voeg een knop toe om de filter te wissen.

```tsx
<div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
  <div className="w-12 h-12 text-neutral-300">
    {/* MagnifyingGlassIcon */}
  </div>
  <div className="flex flex-col gap-1">
    <h3 className="text-lg font-semibold text-neutral-900">
      Geen resultaten
    </h3>
    <p className="text-sm text-neutral-500">
      We konden niets vinden voor "{searchQuery}". Probeer een andere zoekterm.
    </p>
  </div>
  <button
    onClick={clearFilters}
    className="text-sm font-medium text-primary-500 hover:underline"
  >
    Wis filters
  </button>
</div>
```

---

## Error state (laden mislukt)

Gebruik wanneer data niet geladen kon worden. Geef altijd een herstelactie.

```tsx
<div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
  <div className="w-12 h-12 text-warning-500">
    {/* ExclamationTriangleIcon */}
  </div>
  <div className="flex flex-col gap-1">
    <h3 className="text-lg font-semibold text-neutral-900">
      Kon gegevens niet laden
    </h3>
    <p className="text-sm text-neutral-500">
      Er is iets misgegaan. Controleer je internetverbinding en probeer het opnieuw.
    </p>
  </div>
  <button
    onClick={retry}
    className="
      px-5 py-3 text-sm font-semibold
      bg-neutral-0 text-primary-500
      border border-primary-500 rounded-md
      hover:bg-primary-50 transition-base
      focus-visible:shadow-focus focus-visible:outline-none
    "
  >
    Opnieuw proberen
  </button>
</div>
```

---

## Loading state

Gebruik skeleton-placeholders, geen spinner voor pagina-brede content. Gebruik wel een spinner voor kleine inline-acties (knop, formulierinzending).

```tsx
{/* Skeleton card */}
<div className="bg-neutral-0 rounded-lg border border-neutral-200 p-6 animate-pulse">
  <div className="h-4 bg-neutral-100 rounded w-2/3 mb-3" />
  <div className="h-3 bg-neutral-100 rounded w-full mb-2" />
  <div className="h-3 bg-neutral-100 rounded w-4/5" />
</div>
```

---

## Regels

- Elke empty state heeft een titel, beschrijving en (waar relevant) een CTA
- Gebruik geen negatieve taal ("Helaas...", "Geen data beschikbaar")
- Schrijf in actieve taal: "Start je aanvraag" in plaats van "Er zijn geen aanvragen"
- Illustraties of iconen in empty states zijn altijd in `neutral-300` — nooit in de primaire kleur
- Error states gebruiken het `warning-500` icoon, niet `error-500` — rood is te alarmerend voor een laadprobleem
