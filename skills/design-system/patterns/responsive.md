# Patroon: responsive

## Breakpoints

| Naam | Waarde | Gebruik |
|---|---|---|
| `sm` | 640px | Kleine telefoons |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Groot scherm |

Betaalpauze is **mobile-first**. Schrijf altijd de mobile stijl als basis en voeg breakpoints toe voor grotere schermen.

---

## Grid systeem

Gebruik een 4-koloms grid op mobile en een 12-koloms grid op desktop.

```tsx
<div className="grid grid-cols-4 md:grid-cols-12 gap-4 px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto">
  ...
</div>
```

---

## Paginalayout

De aanvraagflow gebruikt een centered single-column layout. Geen sidebar.

```tsx
<main className="min-h-screen bg-neutral-50 py-10 px-4">
  <div className="max-w-lg mx-auto w-full">
    {/* Pagina-inhoud */}
  </div>
</main>
```

De publieke landingspagina gebruikt een bredere container.

```tsx
<div className="max-w-screen-lg mx-auto px-4 md:px-6 lg:px-8">
  ...
</div>
```

---

## Typografie responsive

Pas kopteksten aan op grote schermen. Gebruik `clamp()` of Tailwind responsive prefixes.

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
  Pauzeer je betaling, zonder zorgen.
</h1>
```

---

## Touch targets

Alle klikbare elementen hebben op mobile een minimale touch target van 44x44px. Gebruik `min-h-11 min-w-11` (44px = 11 in Tailwind 4px grid).

```tsx
<button className="min-h-11 px-5 py-3 ...">Label</button>
```

---

## Formulieren op mobile

- Formuliervelden zijn altijd `w-full` op mobile
- Labels boven het veld (nooit naast het veld op mobile)
- Knoppen zijn `w-full` op mobile, `w-auto` op `md:` en groter

```tsx
<button className="w-full md:w-auto px-5 py-3 ...">
  Volgende stap
</button>
```

---

## Kaarten en panelen

```tsx
<div className="
  bg-neutral-0 rounded-lg shadow-sm
  p-4 md:p-6
  border border-neutral-200
">
  ...
</div>
```

Op mobile geen shadow gebruiken als het element de volledige breedte inneemt.

---

## Spacing ritme

Gebruik het 4px grid consequent. Binnen een sectie: `gap-4` of `gap-6`. Tussen secties: `gap-10` of `gap-12`. Pagina padding: `px-4` op mobile, `px-6` op tablet, `px-8` op desktop.

---

## Regels

- Test altijd op 375px (iPhone SE) en 390px (iPhone 14) als minimale breedte
- Vermijd horizontaal scrollen — alles past binnen de viewport
- Gebruik geen vaste pixelbreedtes op flexibele elementen
- Afbeeldingen altijd `max-w-full h-auto`
