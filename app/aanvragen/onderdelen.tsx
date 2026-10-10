"use client"

import { useState } from "react"
import Link from "next/link"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export const AANTAL_STAPPEN = 4

// Bovenaan elke stap: terug-link, "Stap X van 4" en een balk.
export function StapKop({ stap, titel, uitleg }: { stap: number; titel: string; uitleg?: string }) {
  const vorige = stap > 1 ? `/aanvragen?stap=${stap - 1}` : "/"

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={vorige}
        className="self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
      >
        Terug
      </Link>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Stap {stap} van {AANTAL_STAPPEN}
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={AANTAL_STAPPEN}
          aria-valuenow={stap}
          aria-label={`Stap ${stap} van ${AANTAL_STAPPEN}`}
          className="h-1 w-full overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-violet transition-[width] duration-[400ms] ease-in-out"
            style={{ width: `${(stap / AANTAL_STAPPEN) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">{titel}</h1>
        {uitleg && <p className="text-lead text-muted-foreground">{uitleg}</p>}
      </div>
    </div>
  )
}

type VeldProps = Omit<React.ComponentProps<"input">, "onChange" | "onBlur" | "value"> & {
  id: string
  label: string
  hulp?: string
  waarde: string
  fout?: string
  optioneel?: boolean
  onWaarde: (waarde: string) => void
  onVerlaten: () => void
}

// Label boven het veld, hulptekst eronder, dan het veld, dan de foutmelding.
export function Veld({ id, label, hulp, waarde, fout, optioneel, onWaarde, onVerlaten, ...rest }: VeldProps) {
  const beschrijving = [hulp && `${id}-hulp`, fout && `${id}-fout`].filter(Boolean).join(" ")

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optioneel && <span className="font-normal text-muted-foreground"> (optioneel)</span>}
      </Label>
      {hulp && (
        <p id={`${id}-hulp`} className="text-sm text-muted-foreground">
          {hulp}
        </p>
      )}
      <Input
        id={id}
        name={id}
        value={waarde}
        onChange={(e) => onWaarde(e.target.value)}
        onBlur={onVerlaten}
        aria-invalid={fout ? true : undefined}
        aria-describedby={beschrijving || undefined}
        className="h-12 rounded-md border-line-strong bg-surface px-4 focus-visible:border-line-strong focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet text-base text-ink placeholder:text-subtle md:text-base aria-invalid:border-error"
        {...rest}
      />
      {fout && (
        <p id={`${id}-fout`} className="text-sm text-error">
          {fout}
        </p>
      )}
    </div>
  )
}

// Bovenaan bij versturen: welke velden nog niet kloppen, met een link naar elk veld.
export function FoutSamenvatting({ fouten }: { fouten: Record<string, string | undefined> }) {
  // Dezelfde melding maar één keer tonen (bijvoorbeeld bedrijfsnaam en KVK-nummer).
  const lijst = Object.entries(fouten).filter(
    ([, melding], i, alle) => melding && alle.findIndex(([, m]) => m === melding) === i
  )
  if (lijst.length === 0) return null

  return (
    <div
      id="fout-samenvatting"
      tabIndex={-1}
      role="alert"
      className="flex flex-col gap-2 rounded-lg bg-error-tint p-4 text-ink outline-none"
    >
      <p className="font-medium">
        {lijst.length === 1 ? "Er klopt nog één ding niet:" : `Er kloppen nog ${lijst.length} dingen niet:`}
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
        {lijst.map(([veld, melding]) => (
          <li key={veld}>
            <a href={`#${veld}`} className="underline underline-offset-4">
              {melding}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function VerderKnop({ children, bezig }: { children: React.ReactNode; bezig?: boolean }) {
  return (
    <Button
      type="submit"
      disabled={bezig}
      className="h-12 w-full rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft sm:w-auto sm:self-start"
    >
      {children}
    </Button>
  )
}

// Houdt de waarden en fouten van één stap bij.
// Controleert een veld als je het verlaat, en opnieuw zodra je een fout verbetert.
export function useStapFormulier<S extends z.ZodObject>(schema: S, begin: Record<keyof z.infer<S>, string>) {
  type Naam = keyof z.infer<S> & string
  const [waarden, setWaarden] = useState(begin)
  const [fouten, setFouten] = useState<Partial<Record<Naam, string>>>({})
  const [toonSamenvatting, setToonSamenvatting] = useState(false)

  function controleerVeld(naam: Naam, waarde: string) {
    const veldSchema = schema.shape[naam] as z.ZodType
    const uitkomst = veldSchema.safeParse(waarde)
    setFouten((f) => ({ ...f, [naam]: uitkomst.success ? undefined : uitkomst.error.issues[0]?.message }))
  }

  function zet(naam: Naam, waarde: string) {
    setWaarden((w) => ({ ...w, [naam]: waarde }))
    if (fouten[naam]) controleerVeld(naam, waarde)
  }

  // Bij versturen: alles controleren en de foutsamenvatting tonen.
  // Met "alleen" tel je alleen fouten mee van velden die nu op het scherm staan.
  function controleerAlles(alleen?: Naam[]): z.infer<S> | null {
    const uitkomst = schema.safeParse(waarden)
    if (uitkomst.success) {
      setFouten({})
      return uitkomst.data
    }
    const nieuweFouten: Partial<Record<Naam, string>> = {}
    for (const issue of uitkomst.error.issues) {
      const naam = issue.path[0] as Naam
      if (alleen && !alleen.includes(naam)) continue
      if (!nieuweFouten[naam]) nieuweFouten[naam] = issue.message
    }
    setFouten(nieuweFouten)
    setToonSamenvatting(true)
    setTimeout(() => document.getElementById("fout-samenvatting")?.focus(), 0)
    return null
  }

  return {
    waarden,
    fouten,
    // De samenvatting verdwijnt vanzelf als alle fouten verbeterd zijn.
    samenvatting: toonSamenvatting ? fouten : {},
    zet,
    verlaten: (naam: Naam) => controleerVeld(naam, waarden[naam]),
    controleerAlles,
  }
}
