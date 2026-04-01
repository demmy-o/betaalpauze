# Component: form

## Beschrijving

Formulieren zijn het hart van de Betaalpauze aanvraagflow. Ze moeten rustig, overzichtelijk en foutbestendig zijn. Gebruik altijd één vraag per stap als dat mogelijk is.

---

## Wanneer gebruiken

- Voor het ophalen van gebruikersinvoer: persoonlijke gegevens, IBAN, datum, bedrag
- Voor aanvraagflows met meerdere stappen
- Voor bevestigingsschermen met verificatievelden

---

## Structuur van een formulierveld

```
[label]
[optionele helptext]
[input]
[foutmelding — alleen bij error]
```

Zet nooit de foutmelding boven de input. Zet nooit label en helptext weg bij focus.

---

## Text input

```tsx
<div className="flex flex-col gap-1">
  <label htmlFor="iban" className="text-sm font-medium text-neutral-900">
    IBAN
  </label>
  <p className="text-xs text-neutral-500" id="iban-hint">
    Je vindt je IBAN op je bankpas of in je bankapp.
  </p>
  <input
    id="iban"
    type="text"
    aria-describedby="iban-hint iban-error"
    className="
      w-full px-4 py-3
      bg-neutral-0 text-neutral-900
      text-base font-regular
      border border-neutral-200 rounded-md
      shadow-xs
      transition-base
      placeholder:text-neutral-400
      hover:border-neutral-400
      focus:outline-none focus:border-primary-500 focus:shadow-focus
      disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
    "
    placeholder="NL00 BANK 0000 0000 00"
  />
  {/* Alleen tonen bij error: */}
  <p className="text-xs text-error-500" id="iban-error" role="alert">
    Vul een geldig IBAN in.
  </p>
</div>
```

---

## Error state

Bij een fout krijgt de input een rode rand en verschijnt de foutmelding eronder.

```tsx
<input className="
  ... border-error-500
  focus:border-error-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.30)]
" aria-invalid="true" />
```

---

## Select

```tsx
<select className="
  w-full px-4 py-3
  bg-neutral-0 text-neutral-900
  text-base
  border border-neutral-200 rounded-md
  shadow-xs
  transition-base
  focus:outline-none focus:border-primary-500 focus:shadow-focus
  appearance-none
  bg-[url('chevron-down.svg')] bg-no-repeat bg-[right_1rem_center]
">
  <option value="">Kies een reden</option>
  ...
</select>
```

---

## Checkbox

```tsx
<label className="flex items-start gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="
      mt-0.5 w-5 h-5
      border-2 border-neutral-300 rounded-sm
      text-primary-500
      focus:shadow-focus
      transition-base
    "
  />
  <span className="text-sm text-neutral-900">
    Ik ga akkoord met de voorwaarden.
  </span>
</label>
```

---

## Radio group

```tsx
<fieldset>
  <legend className="text-sm font-medium text-neutral-900 mb-2">
    Reden voor pauze
  </legend>
  {options.map(option => (
    <label key={option.value} className="flex items-center gap-3 py-2 cursor-pointer">
      <input
        type="radio"
        name="reason"
        value={option.value}
        className="w-5 h-5 border-2 border-neutral-300 text-primary-500 focus:shadow-focus"
      />
      <span className="text-sm text-neutral-900">{option.label}</span>
    </label>
  ))}
</fieldset>
```

---

## Formulierlayout

- Gebruik altijd `flex flex-col gap-6` tussen velden
- Maximale breedte van een formulier: `max-w-lg` (512px)
- Op mobile: `w-full`
- Knoppen aan het einde van een formulier: primary rechts, secondary of ghost links
- Gebruik een `<form>` element met `noValidate` en valideer in JavaScript

---

## Regels

- Elk veld heeft altijd een zichtbaar label — geen placeholders als vervanging van labels
- Helptext is optioneel maar altijd onder het label, boven het veld
- Foutmeldingen zijn specifiek: "Vul een geldig IBAN in" niet "Ongeldig veld"
- Verplichte velden hoeven geen asterisk als alle velden verplicht zijn — geef dan aan dat alle velden verplicht zijn
- Gebruik `autocomplete` attributen (bijv. `autocomplete="given-name"`, `autocomplete="email"`)
