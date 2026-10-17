import * as React from "react"

import { cn } from "@/lib/utils"

// voorbeeld: hinttekst in het vak, als "Bijvoorbeeld: …". Het label staat er altijd boven.
function Textarea({
  className,
  voorbeeld,
  placeholder,
  ...props
}: React.ComponentProps<"textarea"> & { voorbeeld?: string }) {
  return (
    <textarea
      data-slot="textarea"
      placeholder={voorbeeld ? `Bijvoorbeeld: ${voorbeeld}` : placeholder}
      className={cn(
        // Betaalpauze: dezelfde stijl als Input, groeit mee met de tekst.
        "flex field-sizing-content min-h-28 font-sans w-full rounded-md border border-line-strong bg-surface p-4 text-base text-ink transition-colors duration-[120ms] outline-none placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-canvas disabled:text-subtle aria-invalid:border-2 aria-invalid:border-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
