import * as React from "react"

import { cn } from "@/lib/utils"

// Betaalpauze: keuzerondjes en vinkjes. Allemaal echte <input>-elementen,
// zodat toetsenbord en schermlezer gewoon werken.

// Gedeelde focusring voor een <label> met een invoerelement erin. Het invoerelement zelf krijgt dan geen ring,
// anders zie je er twee. Losse keuzerondjes en vinkjes krijgen de ring wel op het rondje of vinkje zelf.
const focusOpLabel =
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-ink"

type InvoerProps = Omit<React.ComponentProps<"input">, "type">

// Losse keuzerondje met label ernaast. Gebruik in een <fieldset> met een <legend>.
function Keuzerondje({ className, children, ...props }: InvoerProps) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 font-sans text-base text-ink", className)}>
      <input type="radio" className="size-5 shrink-0 accent-ink" {...props} />
      {children}
    </label>
  )
}

// Los vinkje met label ernaast. Voor ja/nee-vragen en "ik ga akkoord".
function Vinkje({ className, children, ...props }: InvoerProps) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 font-sans text-base text-ink", className)}>
      <input type="checkbox" className="size-5 shrink-0 rounded-sm accent-ink" {...props} />
      {children}
    </label>
  )
}

// Keuzekaart: een keuzerondje met een titel en uitleg, als grote klikbare kaart.
// Voor een keuze die uitleg nodig heeft, zoals het soort voorstel.
function Keuzekaart({
  titel,
  uitleg,
  className,
  ...props
}: InvoerProps & { titel: string; uitleg?: string }) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer gap-4 rounded-lg font-sans border border-line bg-surface p-4 transition-colors duration-[120ms] hover:border-line-strong has-[:checked]:border-ink has-[:checked]:bg-mint-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        focusOpLabel,
        className
      )}
    >
      <input type="radio" className="mt-1 size-5 shrink-0 accent-ink focus-visible:outline-none" {...props} />
      <span className="flex flex-col gap-1">
        <span className="font-medium text-ink">{titel}</span>
        {uitleg && <span className="text-sm text-muted-foreground">{uitleg}</span>}
      </span>
    </label>
  )
}

// Keuzeknop: een keuzerondje dat eruitziet als een pill. Voor korte keuzes naast elkaar,
// zoals "1 maand", "2 maanden", "3 maanden". Maximaal 4 naast elkaar op mobiel.
function Keuzeknop({ className, children, ...props }: InvoerProps) {
  return (
    <label
      className={cn(
        "flex h-12 flex-1 cursor-pointer font-sans items-center justify-center rounded-full border border-line-strong bg-surface px-4 text-base text-ink transition-colors duration-[120ms] hover:bg-canvas has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        focusOpLabel,
        className
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      {children}
    </label>
  )
}

// Keuzetegel: een keuzerondje als grote tegel met een tekening, naar het voorbeeld van Lemonade.
// Op tablet en desktop naast elkaar (tekening boven de tekst), op mobiel onder elkaar (tekening links).
// Zet de tegels in een <fieldset> met grid: "grid gap-3 md:grid-cols-3".
function Keuzetegel({
  titel,
  uitleg,
  tekening,
  className,
  ...props
}: InvoerProps & { titel: string; uitleg?: string; tekening: React.ReactNode }) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center gap-4 rounded-lg border border-line bg-surface p-4 font-sans transition-colors duration-[120ms] hover:border-line-strong has-[:checked]:border-ink has-[:checked]:bg-mint-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 md:flex-col md:gap-3 md:p-6 md:text-center",
        focusOpLabel,
        className
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      <span aria-hidden className="flex size-12 shrink-0 items-center justify-center text-ink md:size-20">
        {tekening}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-medium text-ink">{titel}</span>
        {uitleg && <span className="text-sm text-muted-foreground">{uitleg}</span>}
      </span>
    </label>
  )
}

export { Keuzerondje, Vinkje, Keuzekaart, Keuzeknop, Keuzetegel }
