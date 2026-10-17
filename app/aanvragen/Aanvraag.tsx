"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { bewaarAntwoorden, useAntwoorden, wisAntwoorden, type Antwoorden } from "./opslag"
import { VraagFactuur } from "./VraagFactuur"
import { StapSchuldeiser } from "./StapSchuldeiser"
import { StapFactuur } from "./StapFactuur"
import { StapGegevens } from "./StapGegevens"
import { StapEmail } from "./StapEmail"

// De verste stap waar je mag zijn: je kunt geen stap overslaan.
// Stap 0 is de vraag "Klopt de factuur?".
function verstToegestaan(a: Antwoorden) {
  if (!a.factuurKlopt) return 0
  if (!a.schuldeiser) return 1
  if (!a.factuur) return 2
  if (!a.gegevens) return 3
  return 4
}

// ingelogdAls: het e-mailadres van je account. Dan sla je in stap 4 de code over.
export function Aanvraag({ ingelogdAls }: { ingelogdAls?: string }) {
  const router = useRouter()
  const zoekParams = useSearchParams()
  const antwoorden = useAntwoorden()
  const [zaakId, setZaakId] = useState<string>()

  const gevraagd = Number(zoekParams.get("stap") ?? "0")
  const stap = antwoorden ? Math.min(Math.max(gevraagd, 0), verstToegestaan(antwoorden)) : 0

  // Probeer je een stap over te slaan, dan ga je naar de stap die nog open staat.
  useEffect(() => {
    if (antwoorden && !zaakId && stap !== gevraagd) router.replace(`/aanvragen?stap=${stap}`)
  }, [antwoorden, zaakId, stap, gevraagd, router])

  if (zaakId) return <Bewaard />
  if (!antwoorden) return null

  function naarStap(volgende: number) {
    router.push(`/aanvragen?stap=${volgende}`)
    window.scrollTo({ top: 0 })
  }

  if (stap === 0) {
    return (
      <VraagFactuur
        onKlopt={() => {
          bewaarAntwoorden({ factuurKlopt: true })
          naarStap(1)
        }}
      />
    )
  }
  if (stap === 1) {
    return (
      <StapSchuldeiser
        begin={antwoorden.schuldeiser}
        onVerder={(schuldeiser) => {
          bewaarAntwoorden({ schuldeiser })
          naarStap(2)
        }}
      />
    )
  }
  if (stap === 2) {
    return (
      <StapFactuur
        begin={antwoorden.factuur}
        onVerder={(factuur) => {
          bewaarAntwoorden({ factuur })
          naarStap(3)
        }}
      />
    )
  }
  if (stap === 3) {
    return (
      <StapGegevens
        begin={antwoorden.gegevens}
        onVerder={(gegevens) => {
          bewaarAntwoorden({ gegevens })
          naarStap(4)
        }}
      />
    )
  }

  return (
    <StapEmail
      ingelogdAls={ingelogdAls}
      aanvraag={{ schuldeiser: antwoorden.schuldeiser!, factuur: antwoorden.factuur!, gegevens: antwoorden.gegevens! }}
      beginEmail={antwoorden.email}
      codeVerstuurd={antwoorden.codeVerstuurd}
      laatsteCode={antwoorden.laatsteCode}
      onCodeVerstuurd={(email, tijd) => bewaarAntwoorden({ email, codeVerstuurd: { email, tijd } })}
      onAnderAdres={() => bewaarAntwoorden({ codeVerstuurd: undefined, laatsteCode: antwoorden.codeVerstuurd })}
      onKlaar={(id) => {
        // Zaak bewaard: door naar scherm 5, je voorstel.
        setZaakId(id)
        wisAntwoorden()
        router.push(`/aanvragen/${id}/voorstel`)
      }}
    />
  )
}

// Kort zichtbaar terwijl we naar scherm 5 gaan.
function Bewaard() {
  return <p className="text-base text-muted-foreground">Je gegevens zijn bewaard. Even geduld...</p>
}
