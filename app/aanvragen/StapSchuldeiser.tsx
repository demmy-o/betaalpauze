"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { schuldeiserSchema, type Schuldeiser } from "./schema"
import { FoutSamenvatting, StapKop, Veld, VerderKnop, useStapFormulier } from "./onderdelen"

type Bedrijf = { kvkNummer: string; vestigingsnummer?: string; naam: string; straat?: string; plaats?: string }

const MIN_TEKENS = 3
const WACHTTIJD_MS = 300

// Stap 1: bij welk bedrijf staat de rekening open?
export function StapSchuldeiser({ begin, onVerder }: { begin?: Schuldeiser; onVerder: (s: Schuldeiser) => void }) {
  const formulier = useStapFormulier(schuldeiserSchema, {
    kvkNummer: begin?.kvkNummer ?? "",
    naam: begin?.naam ?? "",
    straat: begin?.straat ?? "",
    postcode: begin?.postcode ?? "",
    plaats: begin?.plaats ?? "",
    email: begin?.email ?? "",
  })
  const { waarden, fouten, zet } = formulier
  const gekozen = waarden.kvkNummer !== ""
  const [adresLaden, setAdresLaden] = useState(false)
  const [adresFout, setAdresFout] = useState<string>()

  // Bij kiezen halen we het volledige adres op (en een e-mailadres als we het bedrijf al kennen).
  async function kies(b: Bedrijf) {
    zet("kvkNummer", b.kvkNummer)
    zet("naam", b.naam)
    zet("straat", b.straat ?? "")
    zet("postcode", "")
    zet("plaats", b.plaats ?? "")
    setAdresFout(undefined)
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
      if (data.bekendEmail && !waarden.email) zet("email", data.bekendEmail)
    } catch {
      setAdresFout("Het volledige adres ophalen lukte niet. Je kunt gewoon verder, we proberen het later opnieuw.")
    } finally {
      setAdresLaden(false)
    }
  }

  function kiesOpnieuw() {
    zet("kvkNummer", "")
    zet("naam", "")
    zet("straat", "")
    zet("postcode", "")
    zet("plaats", "")
    setAdresFout(undefined)
  }

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    // Nog geen bedrijf gekozen? Dan staat het e-mailveld nog niet op het scherm.
    const data = formulier.controleerAlles(gekozen ? undefined : ["kvkNummer"])
    if (data && !adresLaden) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <StapKop
        stap={1}
        titel="Bij welk bedrijf moet je betalen?"
        uitleg="Zoek het bedrijf dat de factuur stuurde. Wij halen de gegevens op bij de KVK."
      />

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
        />
      ) : (
        <BedrijfZoeken fout={fouten.kvkNummer} onKies={kies} />
      )}

      {gekozen && (
        <Veld
          id="email"
          label="E-mailadres van het bedrijf"
          hulp="Staat meestal op de factuur, bij contact of klantenservice. Hier sturen we je voorstel naartoe."
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="klantenservice@bedrijf.nl"
          waarde={waarden.email}
          fout={fouten.email}
          onWaarde={(w) => zet("email", w)}
          onVerlaten={() => formulier.verlaten("email")}
        />
      )}

      <VerderKnop bezig={adresLaden}>Verder naar de factuur</VerderKnop>
    </form>
  )
}

function BedrijfZoeken({ fout, onKies }: { fout?: string; onKies: (b: Bedrijf) => void }) {
  const [term, setTerm] = useState("")
  // Per zoekterm de gevonden bedrijven. Werkt ook als geheugen: dezelfde term vragen we niet nog eens op.
  const [gevonden, setGevonden] = useState<Record<string, Bedrijf[]>>({})
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

  const beschrijving = ["kvkNummer-hulp", fout && "kvkNummer-fout"].filter(Boolean).join(" ")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="kvkNummer" className="text-sm font-medium text-ink">
          Naam van het bedrijf
        </Label>
        <p id="kvkNummer-hulp" className="text-sm text-muted-foreground">
          Typ minstens 3 letters, bijvoorbeeld de naam bovenaan je factuur.
        </p>
        <Input
          id="kvkNummer"
          type="search"
          autoComplete="off"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-invalid={fout ? true : undefined}
          aria-describedby={beschrijving}
          className="h-12 rounded-md border-line-strong bg-surface px-4 focus-visible:border-line-strong focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet text-base text-ink placeholder:text-subtle md:text-base aria-invalid:border-error"
        />
        {fout && (
          <p id="kvkNummer-fout" className="text-sm text-error">
            {fout}
          </p>
        )}
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        {laden && <p className="text-sm text-muted-foreground">We zoeken bij de KVK...</p>}
        {zoekFout && (
          <p className="text-sm text-error">
            Zoeken bij de KVK lukt nu even niet. Probeer het over een minuut opnieuw.
          </p>
        )}
        {!laden && resultaten?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            We vinden geen bedrijf met deze naam. Check de spelling of probeer een deel van de naam.
          </p>
        )}
        {!laden && resultaten && resultaten.length > 0 && (
          <ul className="flex flex-col gap-2">
            {resultaten.map((b) => (
              <li key={b.kvkNummer}>
                <button
                  type="button"
                  onClick={() => onKies(b)}
                  className="flex min-h-11 w-full flex-col gap-1 rounded-lg border border-line bg-surface p-4 text-left transition-colors duration-[120ms] hover:border-line-strong hover:bg-lilac-soft"
                >
                  <span className="font-medium text-ink">{b.naam}</span>
                  <span className="text-sm text-muted-foreground">
                    KVK {b.kvkNummer}
                    {b.plaats && ` · ${[b.straat, b.plaats].filter(Boolean).join(", ")}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
}: {
  naam: string
  kvkNummer: string
  straat?: string
  postcode?: string
  plaats?: string
  laden: boolean
  fout?: string
  onOpnieuw: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-lilac-soft p-5">
      <p className="text-sm text-muted-foreground">Gekozen bedrijf</p>
      <div className="flex flex-col gap-1" aria-live="polite">
        <p className="text-lg font-medium text-ink">{naam}</p>
        <p className="text-sm text-muted-foreground">KVK {kvkNummer}</p>
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
      <button
        type="button"
        onClick={onOpnieuw}
        className="min-h-11 self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
      >
        Ander bedrijf kiezen
      </button>
    </div>
  )
}
