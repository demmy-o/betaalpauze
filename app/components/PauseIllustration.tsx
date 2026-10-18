/* Toggle-illustratie op de maten uit Figma (480 x 463).
   Als SVG schaalt alles mee zonder dat de verhoudingen veranderen.
   Met achtergrond={false} tekent hij alleen de toggle, voor in een kleurvlak (zoals in een Beeldsectie). */
export function PauseIllustration({ achtergrond = true }: { achtergrond?: boolean }) {
  return (
    <svg
      viewBox="0 0 480 463"
      role="img"
      aria-label="Een toggle die op pauze staat"
      className={achtergrond ? "w-full max-w-[480px] md:flex-[1_1_480px]" : "size-full"}
    >
      {achtergrond && <rect width="480" height="463" rx="24" className="fill-mint" />}
      <rect x="120" y="168" width="240" height="112" rx="56" className="fill-canvas" />
      <circle cx="304" cy="224" r="44" className="fill-black" />
      <rect x="288.8" y="206" width="11.2" height="36" rx="5.6" className="fill-canvas" />
      <rect x="308" y="206" width="11.2" height="36" rx="5.6" className="fill-canvas" />
    </svg>
  )
}
