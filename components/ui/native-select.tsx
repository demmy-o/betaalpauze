import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Betaalpauze: keuzelijst met de echte <select> van de browser.
// Op een telefoon opent dan de vertrouwde keuzelijst van het toestel.
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative w-full">
      <select
        data-slot="native-select"
        className={cn(
          "h-12 w-full appearance-none font-sans rounded-md border border-line-strong bg-surface pr-12 pl-4 text-base text-ink transition-colors duration-[120ms] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-canvas disabled:text-subtle aria-invalid:border-2 aria-invalid:border-error",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { NativeSelect }
