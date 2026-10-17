// Kleine lijntekeningen voor de keuzetegels bij "Wat wil je voorstellen?".
// Ze tekenen in currentColor, dus ze nemen de tekstkleur over (ink).

const lijn = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const

// Een pauze: twee staande balkjes in een cirkel.
export function TekeningPauze() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" {...lijn}>
      <circle cx="32" cy="32" r="24" />
      <rect x="23" y="21" width="6" height="22" rx="3" />
      <rect x="35" y="21" width="6" height="22" rx="3" />
    </svg>
  )
}

// Termijnen: een kalender met een paar gevulde dagen.
export function TekeningTermijnen() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" {...lijn}>
      <rect x="10" y="14" width="44" height="40" rx="6" />
      <path d="M10 26h44M22 9v10M42 9v10" />
      <rect x="18" y="33" width="7" height="6" rx="1.5" fill="currentColor" />
      <rect x="29" y="33" width="7" height="6" rx="1.5" fill="currentColor" />
      <rect x="40" y="33" width="7" height="6" rx="1.5" fill="currentColor" />
      <rect x="18" y="43" width="7" height="6" rx="1.5" />
    </svg>
  )
}

// Eerst een pauze, dan termijnen: een pauzeteken naast een rij blokjes.
export function TekeningBeide() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" {...lijn}>
      <circle cx="20" cy="32" r="12" />
      <path d="M17 27v10M23 27v10" />
      <rect x="38" y="20" width="16" height="6" rx="1.5" fill="currentColor" />
      <rect x="38" y="29" width="16" height="6" rx="1.5" fill="currentColor" />
      <rect x="38" y="38" width="16" height="6" rx="1.5" />
    </svg>
  )
}
