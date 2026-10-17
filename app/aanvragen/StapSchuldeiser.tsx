"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { adresCompleet, korteNaam, type GevondenBedrijf, type RegelingVia } from "@/lib/regeling"
import { schuldeiserSchema, type Schuldeiser } from "./schema"
import { FoutSamenvatting, Stap, Veld, StapKnoppen, useStapFormulier } from "./onderdelen"
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
    route: begin?.route ?? "",
    email: begin?.email ?? "",
    postAdresAnders: begin?.postAdresAnders ?? "",
    postStraat: begin?.postStraat ?? "",
    postPostcode: begin?.postPostcode ?? "",
    postPlaats: begin?.postPlaats ?? "",
  })
}

// Stap 1: bij welk bedrijf staat de rekening open, en hoe gaat de brief daarheen?
// Drie routes:
//   1. e-mailadres bekend (of ingevuld): we mailen de brief
//   2. geen e-mailadres: Betaalpauze stuurt de brief per post
//   3. het bedrijf heeft een eigen portaal: eerlijke melding met de link, of toch per post
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
    // Beginroute: mailen als dat kan. Bij een portaal kiest de gebruiker zelf.
    const via = b.regeling?.via
    zet("route", via && via !== "email" ? "" : "email")
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
    } catch {
      setAdresFout("Het volledige adres ophalen lukte niet. Je kunt gewoon verder.")
    } finally {
      setAdresLaden(false)
    }
  }

  function kiesOpnieuw() {
    for (const veld of [
      "schuldeiserId", "kvkNummer", "naam", "straat", "postcode", "plaats", "route", "email",
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
    // Nog geen bedrijf gekozen? Dan staan de andere velden nog niet op het scherm.
    const data = formulier.controleerAlles(gekozen ? undefined : ["kvkNummer"])
    if (data && !adresLaden) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap
        stap={1}
        titel="Bij welk bedrijf moet je betalen?"
        uitleg="Zoek het bedrijf dat de factuur stuurde."
      >
        <FoutSamenvatting fouten={formulier.samenvatting} />

        {gekozen ? (
          <>
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
            {!adresLaden && <RouteKeuze formulier={formulier} />}
          </>
        ) : (
          <BedrijfZoeken fout={fouten.kvkNummer} onKies={kies} />
        )}

        <StapKnoppen>

          <Button type="submit" variant="primair" size="groot" disabled={adresLaden}>

            Verder naar de factuur

          </Button>

        </StapKnoppen>
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

function RouteKeuze({ formulier }: { formulier: Formulier }) {
  const { waarden, fouten, zet, verlaten } = formulier
  const via = waarden.regelingVia as RegelingVia | ""
  const naam = korteNaam(waarden.naam)
  const heeftPortaal = via === "portaal" || via === "formulier" || via === "telefoon"
  const adresBekend = adresCompleet(waarden)
  // Het adres van de factuur gebruiken: als we geen volledig adres hebben, of als de gebruiker dat wil.
  const eigenAdres = !adresBekend || waarden.postAdresAnders === "ja"

  return (
    <div id="route" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      {/* Route 3: het bedrijf wil het in de eigen omgeving regelen */}
      {heeftPortaal && (
        <Kaart className="gap-3">
          <h2 className="font-medium text-ink">
            {naam} regelt betalingsregelingen {PORTAAL_TEKST[via]}
          </h2>
          <p className="text-sm text-ink">Daar is het meestal sneller geregeld dan met een brief.</p>
          {waarden.regelingOpmerking && <p className="text-sm text-muted-foreground">{waarden.regelingOpmerking}</p>}
          <div className="flex flex-wrap gap-3">
            {waarden.regelingUrl && via !== "telefoon" && (
              <a
                href={waarden.regelingUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "primair", size: "middel" })}
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
          {waarden.route !== "post" && (
            <Button type="button" variant="tertiair" size="klein" className="self-start" onClick={() => zet("route", "post")}>
              Toch een brief sturen? Wij sturen hem per post.
            </Button>
          )}
        </Kaart>
      )}

      {fouten.route && (
        <Foutmelding id="route-fout">
          {fouten.route}
        </Foutmelding>
      )}

      {/* Route 1: per mail */}
      {waarden.route === "email" && (
        <Veldengroep>
          <Veld
            id="email"
            label="E-mailadres van het bedrijf"
            type="email"
            inputMode="email"
            autoComplete="off"
            voorbeeld="klantenservice@bedrijf.nl"
            waarde={waarden.email}
            fout={fouten.email}
            onWaarde={(w) => zet("email", w)}
            onVerlaten={() => verlaten("email")}
          />
          <Button type="button" variant="tertiair" size="klein" className="self-start" onClick={() => zet("route", "post")}>
            Geen e-mailadres? Wij sturen de brief per post.
          </Button>
        </Veldengroep>
      )}

      {/* Route 2: per post */}
      {waarden.route === "post" && (
        <Veldengroep>
          <h2 className="font-medium text-ink">Wij sturen je brief per post</h2>
          {adresBekend && !eigenAdres && (
            <>
              <p className="text-sm text-ink">
                Naar {waarden.naam}, {waarden.straat}, {waarden.postcode} {waarden.plaats}.
              </p>
              <Button type="button" variant="tertiair" size="klein" className="self-start" onClick={() => zet("postAdresAnders", "ja")}>
                Staat er op je factuur een ander adres? Gebruik dan dat.
              </Button>
            </>
          )}
          {eigenAdres && (
            <>
              <p className="text-sm text-muted-foreground">
                {adresBekend
                  ? "Neem het postadres over van je factuur."
                  : `We hebben het adres van ${naam} niet compleet. Neem het postadres over van je factuur.`}
              </p>
              <Veld
                id="postStraat"
                label="Straat en huisnummer, of postbus"
                autoComplete="off"
                voorbeeld="Postbus 123"
                waarde={waarden.postStraat}
                fout={fouten.postStraat}
                onWaarde={(w) => zet("postStraat", w)}
                onVerlaten={() => verlaten("postStraat")}
              />
              <Veld
                id="postPostcode"
                label="Postcode"
                autoComplete="off"
                voorbeeld="1234 AB"
                waarde={waarden.postPostcode}
                fout={fouten.postPostcode}
                onWaarde={(w) => zet("postPostcode", w)}
                onVerlaten={() => verlaten("postPostcode")}
              />
              <Veld
                id="postPlaats"
                label="Plaats"
                voorbeeld="Leiden"
                autoComplete="off"
                waarde={waarden.postPlaats}
                fout={fouten.postPlaats}
                onWaarde={(w) => zet("postPlaats", w)}
                onVerlaten={() => verlaten("postPlaats")}
              />
              {adresBekend && (
                <Button type="button" variant="tertiair" size="klein" className="self-start" onClick={() => zet("postAdresAnders", "")}>
                  Toch het bekende adres gebruiken: {waarden.straat}, {waarden.postcode} {waarden.plaats}
                </Button>
              )}
            </>
          )}
          <p className="text-sm text-muted-foreground">Een brief per post is een paar dagen onderweg.</p>
          {via !== "portaal" && via !== "formulier" && via !== "telefoon" && (
            <Button type="button" variant="tertiair" size="klein" className="self-start" onClick={() => zet("route", "email")}>
              Heb je toch een e-mailadres? Dan mailen we de brief.
            </Button>
          )}
        </Veldengroep>
      )}
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
}: {
  naam: string
  kvkNummer?: string
  straat?: string
  postcode?: string
  plaats?: string
  laden: boolean
  fout?: string
  onOpnieuw: () => void
}) {
  return (
    <Kaart as="div" className="gap-3">
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
      <Button
        type="button"
        onClick={onOpnieuw}
        variant="tertiair"
        size="klein"
        className="self-start"
      >
        Ander bedrijf kiezen
      </Button>
    </Kaart>
  )
}
