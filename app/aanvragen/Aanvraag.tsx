"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { stuurAanvraagCode } from "./actions"
import { bewaarAntwoorden, useAntwoorden, wisAntwoorden, type Antwoorden } from "./opslag"
import type { Gegevens } from "./schema"
import { StapSchuldeiser } from "./StapSchuldeiser"
import { StapFactuur } from "./StapFactuur"
import { StapGegevens } from "./StapGegevens"
import { StapCode } from "./StapCode"

const OPNIEUW_NA_MS = 60 * 1000 // Supabase stuurt maximaal één code per minuut

// De verste stap waar je mag zijn: je kunt geen stap overslaan.
function verstToegestaan(a: Antwoorden) {
  if (!a.schuldeiser) return 1
  if (!a.factuur) return 2
  if (!a.gegevens) return 3
  return 4
}

export function Aanvraag() {
  const router = useRouter()
  const zoekParams = useSearchParams()
  const antwoorden = useAntwoorden()
  const [zaakId, setZaakId] = useState<string>()

  const gevraagd = Number(zoekParams.get("stap") ?? "1")
  const stap = antwoorden ? Math.min(Math.max(gevraagd, 1), verstToegestaan(antwoorden)) : 1

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

  // Na stap 3 sturen we de code. Lukt dat niet, dan blijf je op stap 3 en zie je waarom.
  async function gegevensKlaar(gegevens: Gegevens): Promise<string | undefined> {
    const vorige = antwoorden?.codeVerstuurd
    const netVerstuurd = vorige?.email === gegevens.email && Date.now() - vorige.tijd < OPNIEUW_NA_MS

    if (!netVerstuurd) {
      const uitkomst = await stuurAanvraagCode(gegevens.email)
      if (!uitkomst.ok) return uitkomst.melding
    }

    bewaarAntwoorden({
      gegevens,
      codeVerstuurd: netVerstuurd ? vorige : { email: gegevens.email, tijd: Date.now() },
    })
    naarStap(4)
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
    return <StapGegevens begin={antwoorden.gegevens} onVerder={gegevensKlaar} />
  }

  return (
    <StapCode
      aanvraag={{ schuldeiser: antwoorden.schuldeiser!, factuur: antwoorden.factuur!, gegevens: antwoorden.gegevens! }}
      onNieuweCode={() => bewaarAntwoorden({ codeVerstuurd: { email: antwoorden.gegevens!.email, tijd: Date.now() } })}
      onKlaar={(id) => {
        setZaakId(id)
        wisAntwoorden()
        window.scrollTo({ top: 0 })
      }}
    />
  )
}

function Bewaard() {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-mint-soft p-6">
      <h1 className="text-h2 text-ink">Je gegevens zijn bewaard</h1>
      <p className="text-base text-ink">
        We hebben je factuur en je gegevens opgeslagen. Je bent nu ingelogd.
      </p>
      <p className="text-base text-ink">
        Hierna kies je je voorstel: een pauze, termijnen of allebei. Dat deel komt hier binnenkort.
      </p>
    </section>
  )
}
