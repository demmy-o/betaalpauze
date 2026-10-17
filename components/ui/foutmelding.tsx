import * as React from "react"
import { CircleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Betaalpauze: foutmelding onder een veld of bij een actie.
// De tekst is ink, want rood is te licht voor leesbare tekst. Het rode icoon laat zien dat het een fout is.
// Staat de melding binnen een <span> (bijvoorbeeld naast een knop in een regel)? Gebruik dan inline.
function Foutmelding({
  className,
  children,
  inline,
  ...props
}: React.ComponentProps<"p"> & { inline?: boolean }) {
  const Element = inline ? "span" : "p"
  return (
    <Element data-slot="foutmelding" className={cn("flex items-start gap-2 font-sans text-sm text-ink", className)} {...props}>
      <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-error" />
      <span>{children}</span>
    </Element>
  )
}

export { Foutmelding }
