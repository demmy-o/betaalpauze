/* Illustraties voor de blokken op /partners, in dezelfde stijl als PauseIllustration.
   Op de maten uit Figma (480 x 463), getekend voor in een kleurvlak (Beeldsectie).
   Ze vullen 80% van het vlak (size-4/5), zodat er wat meer lucht omheen zit. */

export function GemisteBetalingIllustration() {
  return (
    <svg viewBox="0 0 480 463" role="img" aria-label="Een rekening met een uitroepteken" className="size-4/5">
      <rect x="133" y="124" width="180" height="200" rx="28" className="fill-canvas" />
      <rect x="165" y="164" width="116" height="16" rx="8" className="fill-black" />
      <rect x="165" y="200" width="76" height="16" rx="8" className="fill-black" />
      <circle cx="303" cy="304" r="44" className="fill-black" />
      <rect x="297.4" y="280" width="11.2" height="28" rx="5.6" className="fill-canvas" />
      <circle cx="303" cy="324" r="6.5" className="fill-canvas" />
    </svg>
  )
}

export function RegelingBestaatAlIllustration() {
  return (
    <svg viewBox="0 0 480 463" role="img" aria-label="Een deur die op een kier staat" className="size-4/5">
      <path d="M170 340V170A70 70 0 0 1 310 170V340Z" className="fill-black" />
      <path d="M170 340V170A70 70 0 0 1 240 100V340Z" className="fill-canvas" />
      <circle cx="222" cy="232" r="10" className="fill-black" />
    </svg>
  )
}

export function VoorstelBriefIllustration() {
  return (
    <svg viewBox="0 0 480 463" role="img" aria-label="Een brief met een vinkje" className="size-4/5">
      <rect x="110" y="140" width="260" height="170" rx="26" className="fill-canvas" />
      <path
        d="M135 172L240 246L345 172"
        fill="none"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-black"
      />
      <circle cx="345" cy="310" r="44" className="fill-black" />
      <path
        d="M325 311L340 326L368 296"
        fill="none"
        strokeWidth="11.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-canvas"
      />
    </svg>
  )
}

export function WatJeEraanHebtIllustration() {
  return (
    <svg viewBox="0 0 480 463" role="img" aria-label="Drie stijgende balken" className="size-4/5">
      <rect x="130" y="250" width="60" height="90" rx="30" className="fill-canvas" />
      <rect x="210" y="190" width="60" height="150" rx="30" className="fill-canvas" />
      <rect x="290" y="130" width="60" height="210" rx="30" className="fill-black" />
    </svg>
  )
}

export function PilotStappenIllustration() {
  return (
    <svg viewBox="0 0 480 463" role="img" aria-label="Vier stappen, drie gezet" className="size-4/5">
      <rect x="80" y="192" width="320" height="80" rx="40" className="fill-canvas" />
      <circle cx="120" cy="232" r="24" className="fill-black" />
      <circle cx="200" cy="232" r="24" className="fill-black" />
      <circle cx="280" cy="232" r="24" className="fill-black" />
      <circle cx="360" cy="232" r="21" fill="none" strokeWidth="6" className="stroke-black" />
    </svg>
  )
}
