import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// voorbeeld: hinttekst in het veld, als "Bijvoorbeeld: Zilveren Kruis". Het label staat er altijd boven.
function Input({
  className,
  type,
  voorbeeld,
  placeholder,
  ...props
}: React.ComponentProps<"input"> & { voorbeeld?: string }) {
  return (
    <InputPrimitive
      type={type}
      placeholder={voorbeeld ? `Bijvoorbeeld: ${voorbeeld}` : placeholder}
      data-slot="input"
      className={cn(
        // Betaalpauze: 48px hoog, 12px hoeken, line-strong rand, focusring in ink met 2px ruimte.
        "h-12 w-full min-w-0 rounded-md font-sans border border-line-strong bg-surface px-4 text-base text-ink transition-colors duration-[120ms] outline-none placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-canvas disabled:text-subtle aria-invalid:border-2 aria-invalid:border-error file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
