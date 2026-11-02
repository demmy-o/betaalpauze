"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDownIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { adresCompleet, korteNaam, type GevondenBedrijf, type RegelingVia } from "@/lib/regeling"
import { schuldeiserSchema, type Schuldeiser } from "./schema"
import { FoutSamenvatting, Stap, StapKnoppen, useStapFormulier } from "./onderdelen"
import { Foutmelding } from "@/components/ui/foutmelding"
import { Kaart } from "@/components/ui/kaart"
import { Veldengroep } from "@/components/ui/veldengroep"

const MIN_TEKENS = 3
const WACHTTIJD_MS = 300

type Formulier = ReturnType<typeof useSchuldeiserFormulier>

function useSchuldeiserFormulier(begin?: Schuldeiser) {
  return useStapFormulier(schuldeiserSchema, {
    schuldeiserId: begin?.schuldeiserId ?? "",
    kvkNummer: begin?.kvkNummer ?? "",
    naam: begin?.naam ?? "",
    straat: begin?.straat ?? "",
    postcode: begin?.postcode ?? "",
    plaats: begin?.plaats ?? "",
    regelingVia: begin?.regelingVia ?? "",
    regelingUrl: begin?.regelingUrl ?? "",
    regelingTelefoon: begin?.regelingTelefoon ?? "",
    regelingOpmerking: begin?.regelingOpmerking ?? "",
    emailBekend: begin?.emailBekend ?? "",
    route: begin?.route ?? "",
    email: begin?.email ?? "",
    postAdresAnders: begin?.postAdresAnders ?? "",
    postStraat: begin?.postStraat ?? "",
    postPostcode: begin?.postPostcode ?? "",
    postPlaats: begin?.postPlaats ?? "",
  })
}

// Bij welk bedrijf staat de rekening open? Alleen het bedrijf kiezen, verder niets.
// Hoe de brief er komt, volgt vanzelf:
//   - e-mailadres bekend: we mailen de brief
//   - eigen omgeving (portaal, formulier of telefoon): per post, met onder de knop een linkje
//     "Bij [bedrijf] zelf regelen" dat uitklapt met de link of het telefoonnummer
//   - anders: het volgende scherm vraagt naar het e-mailadres (zie StapBedrijfBrief)
export function StapSchuldeiser({ begin, onVerder }: { begin?: Schuldeiser; onVerder: (s: Schuldeiser) => void }) {
  const formulier = useSchuldeiserFormulier(begin)
  const { waarden, fouten, zet } = formulier
  const gekozen = Boolean(waarden.schuldeiserId || waarden.kvkNummer)
  const [adresLaden, setAdresLaden] = useState(false)
  const [adresFout, setAdresFout] = useState<string>()

  function zetRegeling(b: Pick<GevondenBedrijf, "regeling" | "email">) {
    zet("regelingVia", b.regeling?.via ?? "")
    zet("regelingUrl", b.regeling?.url ?? "")
    zet("regelingTelefoon", b.regeling?.telefoon ?? "")
    zet("regelingOpmerking", b.regeling?.opmerking ?? "")
    if (b.email) zet("email", b.email)
    zet("emailBekend", b.email ? "ja" : "")
    // Route: mailen als we het adres weten. Bij een eigen omgeving: per post. Anders vragen we het straks.
    zet("route", b.email ? "email" : heeftEigenOmgeving(b.regeling?.via ?? "") ? "post" : "")
  }

  async function kies(b: GevondenBedrijf) {
    zet("schuldeiserId", b.schuldeiserId ?? "")
    zet("kvkNummer", b.kvkNummer ?? "")
    zet("naam", b.naam)
    zet("straat", b.straat ?? "")
    zet("postcode", b.postcode ?? "")
    zet("plaats", b.plaats ?? "")
    zet("email", "")
    zet("postAdresAnders", "")
    zet("postStraat", "")
    zet("postPostcode", "")
    zet("postPlaats", "")
    setAdresFout(undefined)

    // Uit onze eigen lijst: alles is al bekend, geen opvraging nodig.
    if (b.bron === "eigen") {
      zetRegeling(b)
      return
    }

    // Uit de KVK: het volledige adres ophalen (en wat we eventueel al weten).
    zetRegeling({})
    setAdresLaden(true)
    try {
      const antwoord = await fetch("/api/kvk/adres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kvkNummer: b.kvkNummer }),
      })
      const data = await antwoord.json()
      if (!antwoord.ok) throw new Error(data.fout)
      zet("straat", data.adres.straat ?? "")
      zet("postcode", data.adres.postcode ?? "")
      zet("plaats", data.adres.plaats ?? "")
      zetRegeling({ regeling: data.regeling, email: data.bekendEmail })
      // Daglimiet voor de KVK bereikt: het adres is niet compleet, de gebruiker vult het zelf in.
      if (data.melding) setAdresFout(data.melding)
    } catch {
      setAdresFout("Het volledige adres ophalen lukte niet. Je kunt gewoon verder.")
    } finally {
      setAdresLaden(false)
    }
  }

  function kiesOpnieuw() {
    for (const veld of [
      "schuldeiserId", "kvkNummer", "naam", "straat", "postcode", "plaats", "route", "email", "emailBekend",
      "postAdresAnders", "postStraat", "postPostcode", "postPlaats",
    ] as const) {
      zet(veld, "")
    }
    zetRegeling({})
    zet("route", "")
    setAdresFout(undefined)
  }

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    if (adresLaden) return
    // Bedrijf gekozen: door. De rest (e-mailadres of postadres) vragen de volgende schermen.
    if (gekozen) onVerder(waarden as Schuldeiser)
    // Nog niets gekozen: dan toont dit de melding "Kies een bedrijf uit de lijst."
    else formulier.controleerAlles(["kvkNummer"])
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel="Bij welk bedrijf moet je betalen?">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        {gekozen ? (
          <GekozenBedrijf
            naam={waarden.naam}
            kvkNummer={waarden.kvkNummer}
            straat={waarden.straat}
            postcode={waarden.postcode}
            plaats={waarden.plaats}
            laden={adresLaden}
            fout={adresFout}
            onOpnieuw={kiesOpnieuw}
            // Per post en het adres is bekend: je kunt ook het adres van je factuur gebruiken.
            anderAdres={
              waarden.route === "post" && adresCompleet(waarden) && !adresLaden
                ? { gekozen: waarden.postAdresAnders === "ja", onWissel: () => zet("postAdresAnders", waarden.postAdresAnders === "ja" ? "" : "ja") }
                : undefined
            }
          />
        ) : (
          <BedrijfZoeken fout={fouten.kvkNummer} onKies={kies} />
        )}

        <StapKnoppen>
          <Button type="submit" variant="primair" size="groot" disabled={adresLaden}>
            Verder
          </Button>
        </StapKnoppen>

        {gekozen && !adresLaden && heeftEigenOmgeving(waarden.regelingVia) && <ZelfRegelen formulier={formulier} />}
      </Stap>
    </form>
  )
}

// ---------------------------------------------------------------
// Hoe gaat de brief naar het bedrijf?
// ---------------------------------------------------------------

const PORTAAL_TEKST: Record<Exclude<RegelingVia, "email">, string> = {
  portaal: "in de eigen online omgeving",
  formulier: "via een contactformulier op de eigen website",
  telefoon: "telefonisch",
}

function heeftEigenOmgeving(via: string): via is Exclude<RegelingVia, "email"> {
  return via === "portaal" || via === "formulier" || via === "telefoon"
}

// Onder de knop: het bedrijf regelt het liever zelf. Een linkje dat uitklapt met de link of het telefoonnummer.
function ZelfRegelen({ formulier }: { formulier: Formulier }) {
  const { waarden } = formulier
  const [open, setOpen] = useState(false)
  const rustig = useReducedMotion()
  const via = waarden.regelingVia as Exclude<RegelingVia, "email">
  const naam = korteNaam(waarden.naam)

  return (
    <div className="flex flex-col items-center">
      <Button
        type="button"
        variant="tertiair"
        size="klein"
        className="h-auto min-h-9 py-2 text-center whitespace-normal"
        aria-expanded={open}
        aria-controls="zelf-regelen"
        onClick={() => setOpen(!open)}
        icoonRechts={<ChevronDownIcon className={open ? "rotate-180 transition-transform" : "transition-transform"} />}
      >
        Bij {naam} zelf regelen
      </Button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="zelf-regelen"
            initial={rustig ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={rustig ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
            className="w-full overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-3 rounded-lg bg-surface p-5">
              <p className="text-sm text-ink">
                {naam} regelt betalingsregelingen ook {PORTAAL_TEKST[via]}. Daar is het soms sneller geregeld dan met
                een brief.
              </p>
              {waarden.regelingOpmerking && <p className="text-sm text-muted-foreground">{waarden.regelingOpmerking}</p>}
              <div className="flex flex-wrap gap-3">
                {waarden.regelingUrl && via !== "telefoon" && (
                  <a
                    href={waarden.regelingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "secundair", size: "middel" })}
                  >
                    Naar {naam}
                  </a>
                )}
                {waarden.regelingTelefoon && (
                  <a
                    href={`tel:${waarden.regelingTelefoon.replace(/\s/g, "")}`}
                    className={buttonVariants({ variant: "secundair", size: "middel" })}
                  >
                    Bel {waarden.regelingTelefoon}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------
// Zoeken
// ---------------------------------------------------------------

function BedrijfZoeken({ fout, onKies }: { fout?: string; onKies: (b: GevondenBedrijf) => void }) {
  const [term, setTerm] = useState("")
  // Per zoekterm de gevonden bedrijven. Werkt ook als geheugen: dezelfde term vragen we niet nog eens op.
  const [gevonden, setGevonden] = useState<Record<string, GevondenBedrijf[]>>({})
  const [mislukt, setMislukt] = useState<Record<string, boolean>>({})

  const schoon = term.trim().toLowerCase()
  const zoekenMag = schoon.length >= MIN_TEKENS
  const resultaten = zoekenMag ? gevonden[schoon] : undefined
  const zoekFout = zoekenMag && mislukt[schoon]
  const laden = zoekenMag && !resultaten && !zoekFout

  // Zoek pas na 3 tekens, en pas als je 300 ms niet meer typt.
  useEffect(() => {
    if (!zoekenMag || gevonden[schoon] || mislukt[schoon]) return

    const timer = setTimeout(async () => {
      try {
        const antwoord = await fetch(`/api/kvk?q=${encodeURIComponent(schoon)}`)
        const data = await antwoord.json()
        if (!antwoord.ok) throw new Error(data.fout)
        setGevonden((g) => ({ ...g, [schoon]: data.bedrijven }))
      } catch {
        setMislukt((m) => ({ ...m, [schoon]: true }))
      }
    }, WACHTTIJD_MS)

    return () => clearTimeout(timer)
  }, [schoon, zoekenMag, gevonden, mislukt])

  const beschrijving = fout ? "kvkNummer-fout" : undefined

  return (
    <Veldengroep>
      <div className="flex flex-col gap-2">
        <Label htmlFor="kvkNummer">
          Naam van het bedrijf
        </Label>
        <Input
          id="kvkNummer"
          type="search"
          autoComplete="off"
          voorbeeld="Zilveren Kruis"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-invalid={fout ? true : undefined}
          aria-describedby={beschrijving}
        />
        {fout && (
          <Foutmelding id="kvkNummer-fout">
            {fout}
          </Foutmelding>
        )}
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        {laden && <p className="text-sm text-muted-foreground">We zoeken...</p>}
        {zoekFout && (
          <Foutmelding>Zoeken lukt nu even niet. Probeer het over een minuut opnieuw.</Foutmelding>
        )}
        {!laden && resultaten?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            We vinden geen bedrijf met deze naam. Check de spelling of probeer een deel van de naam.
          </p>
        )}
        {!laden && resultaten && resultaten.length > 0 && (
          <ul className="flex flex-col gap-2">
            {resultaten.map((b) => (
              <li key={b.schuldeiserId ?? b.kvkNummer}>
                <button
                  type="button"
                  onClick={() => onKies(b)}
                  className="flex min-h-11 w-full flex-col gap-1 rounded-lg border border-line bg-surface p-4 text-left transition-colors duration-[120ms] hover:border-line-strong hover:bg-canvas"
                >
                  <span className="font-medium text-ink">{b.naam}</span>
                  <span className="text-sm text-muted-foreground">
                    {b.kvkNummer ? `KVK ${b.kvkNummer}` : "Overheidsdienst"}
                    {b.plaats && ` · ${[b.straat, b.plaats].filter(Boolean).join(", ")}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Veldengroep>
  )
}

function GekozenBedrijf({
  naam,
  kvkNummer,
  straat,
  postcode,
  plaats,
  laden,
  fout,
  onOpnieuw,
  anderAdres,
}: {
  naam: string
  kvkNummer?: string
  straat?: string
  postcode?: string
  plaats?: string
  laden: boolean
  fout?: string
  onOpnieuw: () => void
  anderAdres?: { gekozen: boolean; onWissel: () => void }
}) {
  return (
    <Kaart as="div" breed={false} className="gap-3">
      <p className="text-sm text-muted-foreground">Gekozen bedrijf</p>
      <div className="flex flex-col gap-1" aria-live="polite">
        <p className="text-lg font-medium text-ink">{naam}</p>
        {kvkNummer && <p className="text-sm text-muted-foreground">KVK {kvkNummer}</p>}
        {laden ? (
          // Reserveer de hoogte van twee adresregels, zodat de pagina niet verspringt.
          <div className="flex flex-col gap-1" aria-label="Adres wordt opgehaald">
            <div className="h-5 w-40 animate-pulse rounded-sm bg-line [animation-duration:1.5s]" />
            <div className="h-5 w-28 animate-pulse rounded-sm bg-line [animation-duration:1.5s]" />
          </div>
        ) : (
          <>
            {straat && <p className="text-sm text-ink">{straat}</p>}
            {(postcode || plaats) && <p className="text-sm text-ink">{[postcode, plaats].filter(Boolean).join(" ")}</p>}
          </>
        )}
        {fout && <p className="text-sm text-muted-foreground">{fout}</p>}
      </div>
      <div className="flex flex-col items-start gap-1">
        <Button type="button" onClick={onOpnieuw} variant="tertiair" size="klein">
          Ander bedrijf kiezen
        </Button>
        {anderAdres && (
          <Button
            type="button"
            onClick={anderAdres.onWissel}
            variant="tertiair"
            size="klein"
            className="h-auto min-h-9 py-2 text-left whitespace-normal"
          >
            {anderAdres.gekozen ? "Toch dit adres gebruiken" : "Staat er een ander adres op je factuur?"}
          </Button>
        )}
      </div>
    </Kaart>
  )
}
