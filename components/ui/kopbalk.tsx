import Image from "next/image"

// Betaalpauze: de rustige balk bovenaan de aanvraagflow, naar het voorbeeld van Lemonade.
// Logo links, zonder link, zodat je niet per ongeluk uit de flow klikt.
// De lijn onderaan is ook de voortgang: hij vult zich groen. Met gezicht staat er een portret half over de lijn.
function Kopbalk({
  voortgang,
  label,
  gezicht,
  rechts,
}: {
  voortgang?: number // 0 tot 1. Zonder voortgang is de lijn gewoon een rand.
  label?: string // voor schermlezers, bijvoorbeeld "Stap 2 van 6"
  gezicht?: boolean | string // true: tijdelijke cirkel. Een pad naar een foto in public/: die foto.
  rechts?: React.ReactNode // bijvoorbeeld een knop "Uitloggen"
}) {
  return (
    <header data-slot="kopbalk" className="relative bg-canvas">
      <div className="flex h-16 items-center justify-between gap-4 px-5 md:h-20 md:px-8 lg:px-12">
        <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={124} height={33} priority />
        {rechts}
      </div>

      {voortgang === undefined ? (
        <div className="h-px bg-line" />
      ) : (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(voortgang * 100)}
          aria-label={label}
          className="h-0.5 bg-line"
        >
          <div
            className="h-full bg-groen transition-[width] duration-[400ms] ease-in-out"
            style={{ width: `${Math.min(Math.max(voortgang, 0), 1) * 100}%` }}
          />
        </div>
      )}

      {gezicht && <Gezicht foto={typeof gezicht === "string" ? gezicht : undefined} />}
    </header>
  )
}

// Rond portret, gecentreerd, half over de onderlijn. Zonder foto een mint cirkel met een D.
function Gezicht({ foto }: { foto?: string }) {
  return (
    <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
      <div className="size-16 overflow-hidden rounded-full border-4 border-canvas bg-mint md:size-22">
        {foto ? (
          <Image src={foto} alt="" width={88} height={88} className="size-full object-cover" />
        ) : (
          <span aria-hidden className="flex size-full items-center justify-center font-serif text-h3 text-ink">
            D
          </span>
        )}
      </div>
    </div>
  )
}

export { Kopbalk }
