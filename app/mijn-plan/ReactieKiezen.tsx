"use client"

import { useState, useTransition } from "react"
import type { ZaakStatus } from "@/lib/mijnPlan"
import { zetReactie, type Reactie } from "./actions"

const KEUZES: { waarde: Reactie; tekst: string }[] = [
  { waarde: "akkoord", tekst: "Akkoord" },
  { waarde: "afgewezen", tekst: "Niet akkoord" },
  { waarde: "nog_niets", tekst: "Nog niets gehoord" },
]

// Wat heeft het bedrijf geantwoord? De gebruiker vult het zelf in.
export function ReactieKiezen({ zaakId, schuldeiser, status }: { zaakId: string; schuldeiser: string; status: ZaakStatus }) {
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()
  const huidig: Reactie | undefined =
    status === "akkoord" ? "akkoord" : status === "afgewezen" ? "afgewezen" : status === "verstuurd" ? "nog_niets" : undefined

  if (status === "afgerond") return null

  function kies(reactie: Reactie) {
    if (reactie === huidig) return
    setFout(undefined)
    startBezig(async () => {
      const uitkomst = await zetReactie(zaakId, reactie)
      if (uitkomst) setFout(uitkomst.melding)
    })
  }

  return (
    <section className="flex flex-col gap-3" aria-busy={bezig}>
      <h3 className="text-sm font-medium text-ink">Wat heeft {schuldeiser} geantwoord?</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Reactie van het bedrijf">
        {KEUZES.map((k) => (
          <button
            key={k.waarde}
            type="button"
            onClick={() => kies(k.waarde)}
            disabled={bezig}
            aria-pressed={huidig === k.waarde}
            className="h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-ink transition-colors duration-[120ms] hover:border-ink disabled:opacity-60 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white"
          >
            {k.tekst}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {fout && <p className="text-sm text-error">{fout}</p>}
        {status === "akkoord" && (
          <p className="rounded-md bg-mint-soft p-3 text-sm text-ink">
            Je afspraak staat. Betaal volgens je schema. Wij sturen je rond elke betaling een herinnering.
          </p>
        )}
        {status === "afgewezen" && (
          <p className="rounded-md bg-peach-soft p-3 text-sm text-ink">
            Vraag het bedrijf wat wel kan, bijvoorbeeld een kleiner bedrag per maand. Kom je er niet uit? Het
            Juridisch Loket helpt gratis, via juridischloket.nl of 0900 8020.
          </p>
        )}
      </div>
    </section>
  )
}
