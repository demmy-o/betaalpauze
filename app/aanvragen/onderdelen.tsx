"use client"

import { createContext, useContext, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { ChevronLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { Foutmelding } from "@/components/ui/foutmelding"

// Eén stap in de aanvraag, naar het voorbeeld van Lemonade en de eerdere Framer-versie: rust en focus.
// Bovenaan mijn foto, dan de vraag groot en gecentreerd, daaronder de antwoorden in een smalle kolom.
// De voortgang staat in de kopbalk (FlowKop). De terugknop staat naast de knop "Verder" (zie StapKnoppen).
// Zonder "terug" gaat de terugknop naar het vorige scherm van het formulier (VorigScherm). Met terug={null} is er geen terugknop.
export function Stap({
  titel,
  uitleg,
  terug,
  kolom = "formulier",
  breed,
  children,
}: {
  titel: string
  uitleg?: string
  terug?: string | null
  kolom?: "formulier" | "tekst" // tekst: bredere kolom, voor de brief
  breed?: React.ReactNode // inhoud over de hele breedte van de kop, zoals keuzetegels naast elkaar
  children: React.ReactNode
}) {
  const uitFlow = useContext(VorigScherm)
  const vorige = terug === undefined ? uitFlow : terug

  return (
    <TerugContext.Provider value={vorige}>
      <div className="flex flex-col gap-10">
        <Portret />
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1 text-balance">{titel}</h1>
          {uitleg && <p className="mx-auto max-w-prose text-lead text-balance">{uitleg}</p>}
        </div>

        {breed}

        <div
          data-kolom={kolom === "tekst" ? undefined : "smal"}
          className={cn("group/kolom mx-auto flex w-full flex-col gap-8", kolom === "tekst" ? "max-w-prose" : "max-w-form")}
        >
          {children}
        </div>
      </div>
    </TerugContext.Provider>
  )
}

// Rond portret boven de vraag, zodat je ziet dat er een mens achter zit.
function Portret() {
  return (
    <Image
      src="/demmy.jpg"
      alt=""
      width={80}
      height={80}
      priority
      className="mx-auto size-20 rounded-full object-cover"
    />
  )
}

// Het adres van het vorige scherm in het formulier. Aanvraag zet het, Stap leest het.
export const VorigScherm = createContext<string | null>(null)

// Het terug-adres van de stap waar je in zit. Stap zet het, TerugKnop leest het.
const TerugContext = createContext<string | null>(null)

// Ronde secundaire knop met een pijltje naar links. StapKnoppen zet hem naast de hoofdactie.
export function TerugKnop() {
  const vorige = useContext(TerugContext)
  if (!vorige) return null
  return (
    <Link
      href={vorige}
      aria-label="Terug"
      className={buttonVariants({ variant: "secundair", size: "groot", alleenIcoon: true })}
    >
      <ChevronLeftIcon aria-hidden />
    </Link>
  )
}

// De knoppen onderaan een stap: de terugknop links (als die er is), zo klein mogelijk.
// De hoofdactie ernaast vult de rest van de breedte, net zo breed als de velden erboven.
// Bij het openen van een stap schuiven ze 20px omhoog en worden ze zichtbaar, tegelijk met het eerste veld.
export function StapKnoppen({ children }: { children: React.ReactNode }) {
  const rustig = useReducedMotion()

  return (
    <motion.div
      initial={rustig ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.12, 0.23, 0.5, 1] }}
      className="flex w-full gap-3 *:data-[slot=button]:flex-1"
    >
      <TerugKnop />
      {children}
    </motion.div>
  )
}

type VeldProps = Omit<React.ComponentProps<"input">, "onChange" | "onBlur" | "value"> & {
  voorbeeld?: string // hinttekst in het veld: "Bijvoorbeeld: …"
  id: string
  label: string
  waarde: string
  fout?: string
  optioneel?: boolean
  onWaarde: (waarde: string) => void
  onVerlaten: () => void
}

// Label boven het veld, dan het veld met een voorbeeld als hinttekst, dan de foutmelding.
export function Veld({ id, label, waarde, fout, optioneel, onWaarde, onVerlaten, ...rest }: VeldProps) {
  const beschrijving = fout ? `${id}-fout` : ""

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {optioneel && <span className="font-normal text-muted-foreground">(optioneel)</span>}
      </Label>
      <Input
        id={id}
        name={id}
        value={waarde}
        onChange={(e) => onWaarde(e.target.value)}
        onBlur={onVerlaten}
        aria-invalid={fout ? true : undefined}
        aria-describedby={beschrijving || undefined}
        {...rest}
      />
      {fout && (
        <Foutmelding id={`${id}-fout`}>{fout}</Foutmelding>
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
