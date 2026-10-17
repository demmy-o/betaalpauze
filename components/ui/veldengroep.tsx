import * as React from "react"

import { cn } from "@/lib/utils"

// Betaalpauze: een rustig vlak om een groep invulvelden, zodat je ziet dat ze bij elkaar horen.
// Iets donkerder dan de achtergrond (canvas-donker). De velden zelf blijven wit.
// In de smalle kolom van 480px is het vlak op tablet en desktop 680px breed, net als een Kaart.
// De velden blijven 480px en staan in het midden, met ruim lucht eromheen. Knoppen staan eronder, buiten het vlak.
function Veldengroep({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="veldengroep"
      className={cn(
        "rounded-lg bg-canvas-donker px-5 py-6 md:px-8 md:py-10",
        "md:group-data-[kolom=smal]/kolom:-mx-25", // -100px aan beide kanten: van 480 naar 680px
        className
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-form flex-col gap-6">{children}</div>
    </div>
  )
}

export { Veldengroep }
