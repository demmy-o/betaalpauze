# Betaalpauze Design System

Dit is het design system voor Betaalpauze — een dienst waarmee gebruikers tijdelijk betalingen kunnen pauzeren. Het system is opgebouwd voor gebruik met **Next.js**, **Tailwind CSS** en **TypeScript**.

---

## Bestanden in dit design system

| Bestand | Inhoud |
|---|---|
| `tokens.json` | Alle design tokens: kleuren, typografie, spacing, shadows, radius, breakpoints |
| `theme.css` | CSS custom properties op basis van tokens.json |
| `tailwind.config.ts` | Tailwind configuratie met alle tokens ingebakken |
| `principles.md` | Designprinciples, kleurregels, typohiërarchie, motion en toegankelijkheid |
| `components/button.md` | Button varianten, states, groottes en regels |
| `components/form.md` | Formuliervelden: text input, select, checkbox, radio |
| `components/navigation.md` | Topbar, progress stepper, mobile menu |
| `patterns/responsive.md` | Breakpoints, grid, touch targets, mobile-first aanpak |
| `patterns/empty-states.md` | Default, search, error en loading states |

---

## Hoe gebruik je dit design system?

### 1. Installatie

Kopieer `tailwind.config.ts` naar de root van je project.
Importeer `theme.css` in je globale stylesheet of `globals.css`:

```css
@import "./design-system/theme.css";
```

### 2. Fonts laden

Laad Inter via Google Fonts of lokaal. In Next.js:

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Kleuren gebruiken

Gebruik altijd semantische namen waar mogelijk:

```tsx
// Goed
<div className="bg-neutral-50 text-neutral-900 border border-neutral-200">

// Vermijd directe palet-kleuren voor layout
<div className="bg-[#F8F9FB]">  // niet doen
```

### 4. Componenten bouwen

Volg de componentregels in `components/`. Elke component heeft:
- Een beschrijving en gebruikscontext
- Tailwind class-code
- State-documentatie (hover, focus, disabled, error)
- Do/don't regels

---

## Kleurenpalet op een rij

| Naam | Waarde | Gebruik |
|---|---|---|
| `primary-500` | `#2563EB` | Primaire knoppen, links, focus |
| `neutral-900` | `#111827` | Primaire tekst |
| `neutral-500` | `#636D84` | Secundaire tekst |
| `neutral-200` | `#D8DCE5` | Borders |
| `neutral-50` | `#F8F9FB` | Achtergrond |
| `success-500` | `#10B981` | Bevestigingen |
| `warning-500` | `#F59E0B` | Attentie |
| `error-500` | `#EF4444` | Fouten |

---

## Kernprincipes (samenvatting)

**Duidelijk boven slim** — eenvoudige taal, herkenbare patronen.
**Rustig en vertrouwenwekkend** — veel witruimte, beperk felle kleuren.
**Stap voor stap** — toon nooit te veel tegelijk.
**Eerlijk over status** — transparante statuslabels, geen vage communicatie.
**Inclusief by default** — WCAG AA minimum, altijd toetsenbordbereikbaar.

Lees `principles.md` voor de volledige richtlijnen.

---

## Technische vereisten

- Tailwind CSS v3 of v4
- React 18+
- TypeScript
- Next.js 14+ (App Router)
- Inter font (Google Fonts of lokaal)
