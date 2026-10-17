import * as React from "react"

import { cn } from "@/lib/utils"

// Betaalpauze: een witte kaart voor uitleg, een bevestiging of een samenvatting.
// In de smalle kolom van 480px wordt de kaart op tablet en desktop 200px breder (680px, de breedte van leesbare tekst).
// Dat gebeurt alleen in een kolom met data-kolom="smal" (Pagina met kolom "formulier", en de antwoordkolom van Stap).
// In een brede kolom is de kaart gewoon even breed als de kolom. Met breed={false} steekt hij nooit uit.
function Kaart({
  as: Element = "section",
  breed = true,
  rand,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article"
  breed?: boolean
  rand?: boolean // dunne rand, voor een kaart met een eigen keuze of actie erin
}) {
  return (
    <Element
      data-slot="kaart"
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-surface p-5 md:p-8",
        breed && "md:group-data-[kolom=smal]/kolom:-mx-25", // -100px aan beide kanten: van 480 naar 680px
        rand && "border border-line",
        className
      )}
      {...props}
    />
  )
}

export { Kaart }
