"use client"

import { factuurSchema, type Factuur } from "./schema"
import { FoutSamenvatting, StapKop, Veld, VerderKnop, useStapFormulier } from "./onderdelen"

// Stap 2: over welke factuur gaat het?
export function StapFactuur({ begin, onVerder }: { begin?: Factuur; onVerder: (f: Factuur) => void }) {
  const formulier = useStapFormulier(factuurSchema, {
    factuurnummer: begin?.factuurnummer ?? "",
    factuurdatum: begin?.factuurdatum ?? "",
    bedrag: begin?.bedrag ?? "",
    klantnummer: begin?.klantnummer ?? "",
  })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <StapKop stap={2} titel="Over welke factuur gaat het?" uitleg="Pak je factuur erbij. Alles staat meestal bovenaan." />

      <FoutSamenvatting fouten={formulier.samenvatting} />

      <div className="flex flex-col gap-6">
        <Veld
          id="factuurnummer"
          label="Factuurnummer"
          autoComplete="off"
          waarde={waarden.factuurnummer}
          fout={fouten.factuurnummer}
          onWaarde={(w) => zet("factuurnummer", w)}
          onVerlaten={() => verlaten("factuurnummer")}
        />
        <Veld
          id="factuurdatum"
          label="Datum van de factuur"
          type="date"
          waarde={waarden.factuurdatum}
          fout={fouten.factuurdatum}
          onWaarde={(w) => zet("factuurdatum", w)}
          onVerlaten={() => verlaten("factuurdatum")}
        />
        <Veld
          id="bedrag"
          label="Bedrag in euro"
          hulp="Het totaalbedrag dat je moet betalen."
          inputMode="decimal"
          autoComplete="off"
          placeholder="248,50"
          waarde={waarden.bedrag}
          fout={fouten.bedrag}
          onWaarde={(w) => zet("bedrag", w)}
          onVerlaten={() => verlaten("bedrag")}
        />
        <Veld
          id="klantnummer"
          label="Klantnummer"
          optioneel
          autoComplete="off"
          waarde={waarden.klantnummer}
          fout={fouten.klantnummer}
          onWaarde={(w) => zet("klantnummer", w)}
          onVerlaten={() => verlaten("klantnummer")}
        />
      </div>

      <VerderKnop>Verder naar je gegevens</VerderKnop>
    </form>
  )
}
