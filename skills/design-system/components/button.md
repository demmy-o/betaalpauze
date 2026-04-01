# Component: button

## Beschrijving

De button is het primaire interactie-element. Betaalpauze gebruikt een beperkt palet van varianten om de visuele hiërarchie rustig te houden.

---

## Wanneer gebruiken

- Voor acties met directe gevolgen: aanvragen, bevestigen, opslaan
- Voor navigatie naar de volgende stap in een flow
- Voor secundaire acties naast een primaire actie

## Wanneer niet gebruiken

- Niet voor navigatie naar andere pagina's — gebruik dan een `<a>`-tag
- Niet meer dan 2 knoppen naast elkaar (1 primair + 1 secundair of ghost)
- Vermijd 3 of meer knoppen in één rij

---

## Varianten

### primary

De enige filled button. Gebruik alleen voor de belangrijkste actie op de pagina.

```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-5 py-3
  bg-primary-500 text-neutral-0
  text-sm font-semibold
  rounded-md
  shadow-xs
  transition-base
  hover:bg-primary-600
  active:bg-primary-700
  focus-visible:outline-none focus-visible:shadow-focus
  disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
">
  Label
</button>
```

### secondary

Outlined button. Gebruik voor de tweede actie naast een primary button.

```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-5 py-3
  bg-neutral-0 text-primary-500
  text-sm font-semibold
  rounded-md
  border border-primary-500
  transition-base
  hover:bg-primary-50
  active:bg-primary-100
  focus-visible:outline-none focus-visible:shadow-focus
  disabled:border-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
">
  Label
</button>
```

### ghost

Geen border, geen achtergrond. Gebruik voor tertiaire acties of links-achtige knoppen.

```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-5 py-3
  bg-transparent text-primary-500
  text-sm font-semibold
  rounded-md
  transition-base
  hover:bg-primary-50
  active:bg-primary-100
  focus-visible:outline-none focus-visible:shadow-focus
  disabled:text-neutral-400 disabled:cursor-not-allowed
">
  Label
</button>
```

### destructive

Gebruik alleen voor onomkeerbare acties (verwijderen, annuleren van een aanvraag).

```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-5 py-3
  bg-error-500 text-neutral-0
  text-sm font-semibold
  rounded-md
  shadow-xs
  transition-base
  hover:bg-error-700
  focus-visible:outline-none focus-visible:shadow-focus
  disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
">
  Label
</button>
```

---

## Groottes

| Grootte | Class | Gebruik |
|---|---|---|
| `sm` | `px-3 py-2 text-xs` | Inline acties, tabel-rijen |
| `base` | `px-5 py-3 text-sm` | Standaard — gebruik dit altijd tenzij anders aangegeven |
| `lg` | `px-6 py-4 text-base` | Hero-secties, prominente CTA's |

---

## States

| State | Visueel |
|---|---|
| Default | Standaard kleur |
| Hover | Donkerdere tint (`-600`) |
| Active / pressed | Nog donkerder (`-700`) |
| Focus | `shadow-focus` ring (geen outline) |
| Disabled | `neutral-200` achtergrond, `neutral-400` tekst, cursor `not-allowed` |
| Loading | Vervang label door spinner + "Bezig..." tekst, disabled state |

---

## Loading state

```tsx
<button disabled className="... cursor-not-allowed opacity-75" aria-busy="true">
  <svg className="animate-spin h-4 w-4" .../>
  Bezig...
</button>
```

---

## Regels

- Label altijd in gewone taal, geen afkortingen
- Maximale breedte: pas naar inhoud, of `w-full` bij mobile flows
- Iconen links van het label, niet rechts (uitzondering: "Volgende" pijl mag rechts)
- Gebruik `aria-disabled="true"` i.p.v. alleen `disabled` als je de knop zichtbaar wilt laten voor screenreaders
