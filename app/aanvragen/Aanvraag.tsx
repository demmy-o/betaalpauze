"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { bewaarAntwoorden, useAntwoorden, wisAntwoorden, type Antwoorden } from "./opslag"
import { formulierSchermen, verstToegestaan, volgende, vorige, SCHERMEN, type FormulierScherm } from "./schermen"
import type { Factuur, Gegevens, Schuldeiser } from "./schema"
import { VorigScherm } from "./onderdelen"
import { VraagFactuur } from "./VraagFactuur"
import { StapSchuldeiser } from "./StapSchuldeiser"
import { StapBedrijfAdres, StapBedrijfEmail } from "./StapBedrijfBrief"
import { StapBedrag, StapFactuurdatum, StapFactuurnummer } from "./StapFactuur"
import { StapAdres, StapNaam } from "./StapGegevens"
import { StapEmail } from "./StapEmail"

// Het formulier van de aanvraag: één vraag per scherm. Welke schermen er zijn staat in schermen.ts.
// Het scherm staat in de adresbalk (/aanvragen?stap=bedrag). Je kunt geen vraag overslaan:
// vraag je een scherm verderop, dan ga je naar de eerste vraag die nog open staat.
// ingelogdAls: het e-mailadres van je account. Dan sla je bij "email" de code over.
export function Aanvraag({ ingelogdAls }: { ingelogdAls?: string }) {
  const router = useRouter()
  const zoekParams = useSearchParams()
  const antwoorden = useAntwoorden()
  const [zaakId, setZaakId] = useState<string>()

  const scherm = antwoorden ? kiesScherm(zoekParams.get("stap"), antwoorden) : "klopt"
  const gevraagd = zoekParams.get("stap") ?? "klopt"

  // Vraag je een scherm dat (nog) niet kan, dan ga je naar het scherm dat wel kan.
  useEffect(() => {
    if (antwoorden && !zaakId && scherm !== gevraagd) router.replace(`/aanvragen?stap=${scherm}`)
  }, [antwoorden, zaakId, scherm, gevraagd, router])

  if (zaakId) return <Bewaard />
  if (!antwoorden) return null

  // Bewaar wat dit scherm opleverde en ga naar het volgende scherm.
  function verder(nieuw: Partial<Antwoorden>) {
    bewaarAntwoorden(nieuw)
    const bijgewerkt = { ...antwoorden!, ...nieuw }
    router.push(`/aanvragen?stap=${volgende(scherm, bijgewerkt)}`)
    window.scrollTo({ top: 0 })
  }

  const schuldeiser = antwoorden.schuldeiser
  const vorigScherm = vorige(scherm, antwoorden)

  return (
    <VorigScherm.Provider value={vorigScherm ? `/aanvragen?stap=${vorigScherm}` : null}>
      {/* key: elk scherm begint opnieuw, ook als twee schermen hetzelfde onderdeel gebruiken */}
      <div key={scherm}>
        {scherm === "klopt" && <VraagFactuur onKlopt={() => verder({ factuurKlopt: true })} />}

        {scherm === "bedrijf" && (
          <StapSchuldeiser begin={schuldeiser} onVerder={(s) => verder({ schuldeiser: s })} />
        )}
        {scherm === "bedrijf-email" && schuldeiser && (
          <StapBedrijfEmail schuldeiser={schuldeiser} onVerder={(deel) => verder({ schuldeiser: { ...schuldeiser, ...deel } })} />
        )}
        {scherm === "bedrijf-adres" && schuldeiser && (
          <StapBedrijfAdres schuldeiser={schuldeiser} onVerder={(deel) => verder({ schuldeiser: { ...schuldeiser, ...deel } })} />
        )}

        {scherm === "factuurnummer" && <StapFactuurnummer begin={antwoorden.factuur} onVerder={(f) => verderFactuur(f)} />}
        {scherm === "factuurdatum" && <StapFactuurdatum begin={antwoorden.factuur} onVerder={(f) => verderFactuur(f)} />}
        {scherm === "bedrag" && <StapBedrag begin={antwoorden.factuur} onVerder={(f) => verderFactuur(f)} />}

        {scherm === "naam" && <StapNaam begin={antwoorden.gegevens} onVerder={(g) => verderGegevens(g)} />}
        {scherm === "adres" && <StapAdres begin={antwoorden.gegevens} onVerder={(g) => verderGegevens(g)} />}

        {scherm === "email" && (
          <StapEmail
            ingelogdAls={ingelogdAls}
            aanvraag={{
              schuldeiser: schuldeiser as Schuldeiser,
              factuur: antwoorden.factuur as Factuur,
              gegevens: antwoorden.gegevens as Gegevens,
            }}
            beginEmail={antwoorden.email}
            codeVerstuurd={antwoorden.codeVerstuurd}
            laatsteCode={antwoorden.laatsteCode}
            onCodeVerstuurd={(email, tijd) => bewaarAntwoorden({ email, codeVerstuurd: { email, tijd } })}
            onAnderAdres={() => bewaarAntwoorden({ codeVerstuurd: undefined, laatsteCode: antwoorden.codeVerstuurd })}
            onKlaar={(id) => {
              // Zaak bewaard: door naar je voorstel.
              setZaakId(id)
              wisAntwoorden()
              router.push(`/aanvragen/${id}/voorstel`)
            }}
          />
        )}
      </div>
    </VorigScherm.Provider>
  )

  // De factuur en je gegevens vul je over meer schermen in. Elk scherm vult aan wat er al was.
  function verderFactuur(deel: Partial<Factuur>) {
    verder({ factuur: { ...antwoorden!.factuur, ...deel } })
  }
  function verderGegevens(deel: Partial<Gegevens>) {
    verder({ gegevens: { ...antwoorden!.gegevens, ...deel } })
  }
}

// Het scherm dat je te zien krijgt: het gevraagde scherm, als dat nodig is en je er al mag zijn.
// Anders het eerste scherm dat nog open staat.
function kiesScherm(gevraagd: string | null, a: Antwoorden): FormulierScherm {
  const verst = verstToegestaan(a)
  const lijst = formulierSchermen(a)
  const scherm = lijst.find((s) => s === gevraagd)
  if (!scherm) return verst
  return SCHERMEN.indexOf(scherm) <= SCHERMEN.indexOf(verst) ? scherm : verst
}

// Kort zichtbaar terwijl we naar je voorstel gaan.
function Bewaard() {
  return <p className="text-base text-muted-foreground">Je gegevens zijn bewaard. Even geduld...</p>
}
