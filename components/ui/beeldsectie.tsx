import * as React from "react"

import { cn } from "@/lib/utils"

// Betaalpauze: een blok op een marketingpagina. Tekst op de neutrale achtergrond, met ernaast een
// afgerond kleurvlak waar een illustratie in kan.
// Desktop (vanaf 1024px): tekst en vlak naast elkaar. Met beeldKant wissel je per blok van kant.
// Tablet en mobiel: het vlak staat boven de tekst.
// Het vlak is net zo groot als het vlak op de homepage: maximaal 480px breed, verhouding 480:463 (zoals in Figma).
// kleur: een vlakkleur uit het palet, als hele klasse, bijvoorbeeld "bg-mint" of "bg-geel-soft".
function Beeldsectie({
  kleur,
  beeldKant = "rechts",
  beeld,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  kleur: string
  beeldKant?: "links" | "rechts"
  beeld?: React.ReactNode // de illustratie. Zonder beeld is het vlak leeg.
}) {
  return (
    <section data-slot="beeldsectie" className={cn("py-12 lg:py-16", className)} {...props}>
      <div className="mx-auto grid max-w-page items-center gap-8 px-5 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12">
        <div className="flex max-w-prose flex-col gap-5">{children}</div>
        <div
          aria-hidden={beeld ? undefined : true}
          className={cn(
            "order-first flex aspect-[480/463] w-full max-w-[480px] items-center justify-center overflow-hidden rounded-xl",
            beeldKant === "rechts" && "lg:order-last lg:justify-self-end",
            kleur
          )}
        >
          {beeld}
        </div>
      </div>
    </section>
  )
}

export { Beeldsectie }
