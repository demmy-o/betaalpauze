# Component: navigation

## Beschrijving

Betaalpauze heeft twee navigatiecontexten: de publieke landingspagina en de ingelogde aanvraagomgeving. De navigatie is minimaal — de focus moet altijd op de taak liggen, niet op de navigatie zelf.

---

## Topbar (publieke pagina's)

Gebruik voor de publieke website. Bevat logo, max 3 navigatie-items en een CTA.

```tsx
<header className="
  w-full h-16 px-6
  bg-neutral-0
  border-b border-neutral-200
  flex items-center justify-between
  shadow-xs
  sticky top-0 z-sticky
">
  {/* Logo */}
  <a href="/" className="flex items-center gap-2">
    <img src="/logo.svg" alt="Betaalpauze" className="h-8 w-auto" />
  </a>

  {/* Nav links — verborgen op mobile */}
  <nav className="hidden md:flex items-center gap-6" aria-label="Hoofdnavigatie">
    <a href="/hoe-het-werkt" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-base">
      Hoe het werkt
    </a>
    <a href="/veelgestelde-vragen" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-base">
      FAQ
    </a>
    <a href="/contact" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-base">
      Contact
    </a>
  </nav>

  {/* CTA */}
  <a href="/aanvragen" className="
    px-4 py-2 text-sm font-semibold
    bg-primary-500 text-neutral-0
    rounded-md shadow-xs
    hover:bg-primary-600 transition-base
    focus-visible:shadow-focus focus-visible:outline-none
  ">
    Aanvragen
  </a>
</header>
```

---

## Progress stepper (aanvraagflow)

Gebruik in de meerstappen aanvraagflow. Toont voortgang en huidige stap.

```tsx
<nav aria-label="Stappen" className="flex items-center gap-2 mb-8">
  {steps.map((step, index) => {
    const isCompleted = index < currentStep;
    const isCurrent   = index === currentStep;

    return (
      <React.Fragment key={step.id}>
        {index > 0 && (
          <div className={`flex-1 h-0.5 ${isCompleted ? "bg-primary-500" : "bg-neutral-200"}`} />
        )}
        <div className="flex flex-col items-center gap-1">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
            ${isCompleted ? "bg-primary-500 text-neutral-0" : ""}
            ${isCurrent   ? "border-2 border-primary-500 text-primary-500" : ""}
            ${!isCompleted && !isCurrent ? "bg-neutral-100 text-neutral-400" : ""}
          `}
            aria-current={isCurrent ? "step" : undefined}
          >
            {isCompleted ? <CheckIcon className="w-4 h-4" /> : index + 1}
          </div>
          <span className={`text-xs ${isCurrent ? "font-medium text-primary-500" : "text-neutral-400"}`}>
            {step.label}
          </span>
        </div>
      </React.Fragment>
    );
  })}
</nav>
```

---

## Mobile menu

Gebruik een hamburger-menu op mobile. Geef de overlay een `z-overlay` en het menu zelf `z-modal`.

```tsx
<button
  aria-label="Menu openen"
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
  className="md:hidden p-2 rounded-md hover:bg-neutral-100 focus-visible:shadow-focus"
  onClick={() => setIsOpen(!isOpen)}
>
  {/* Hamburger icon */}
</button>

{isOpen && (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-neutral-900/40 z-overlay"
      onClick={() => setIsOpen(false)}
    />
    {/* Menu */}
    <nav
      id="mobile-menu"
      className="
        fixed top-0 right-0 bottom-0 w-72
        bg-neutral-0 shadow-lg
        flex flex-col gap-2 p-6
        z-modal
      "
    >
      ...
    </nav>
  </>
)}
```

---

## Regels

- Maximaal 4 navigatie-items in de topbar (exclusief CTA)
- De actieve pagina heeft `aria-current="page"` en een visuele indicator
- De stepper toont altijd alle stappen — ook de nog te voltooien stappen
- Navigeer nooit automatisch naar de volgende stap — wacht altijd op bevestiging van de gebruiker
- Op mobile is de stepper verkort: toon alleen "Stap 2 van 4" tekst boven de pagina als de stepper te breed wordt
