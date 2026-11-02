"use client"

import { bedragSchema, factuurdatumSchema, factuurnummerSchema, type Factuur } from "./schema"
import { FoutSamenvatting, Stap, Veld, StapKnoppen, useStapFormulier } from "./onderdelen"
import { Button } from "@/components/ui/button"
import { Veldengroep } from "@/components/ui/veldengroep"

// De factuur, in drie schermen: het nummer, de datum en het bedrag.
type Props = { begin?: Partial<Factuur>; onVerder: (f: Partial<Factuur>) => void }

export function StapFactuurnummer({ begin, onVerder }: Props) {
  const formulier = useStapFormulier(factuurnummerSchema, {
    factuurnummer: begin?.factuurnummer ?? "",
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
      <Stap titel="Wat is het factuurnummer?" uitleg="Pak je factuur erbij. Het staat meestal bovenaan.">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        <Veldengroep>
          <Veld
            id="factuurnummer"
            label="Factuurnummer"
            voorbeeld="2026-00451"
            autoComplete="off"
            waarde={waarden.factuurnummer}
            fout={fouten.factuurnummer}
            onWaarde={(w) => zet("factuurnummer", w)}
            onVerlaten={() => verlaten("factuurnummer")}
          />
          <Veld
            id="klantnummer"
            label="Klantnummer"
            voorbeeld="1234567"
            optioneel
            autoComplete="off"
            waarde={waarden.klantnummer ?? ""}
            fout={fouten.klantnummer}
            onWaarde={(w) => zet("klantnummer", w)}
            onVerlaten={() => verlaten("klantnummer")}
          />
        </Veldengroep>

        <StapKnoppen>
          <Button type="submit" variant="primair" size="groot">
            Verder
          </Button>
        </StapKnoppen>
      </Stap>
    </form>
  )
}

export function StapFactuurdatum({ begin, onVerder }: Props) {
  const formulier = useStapFormulier(factuurdatumSchema, { factuurdatum: begin?.factuurdatum ?? "" })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel="Wat is de datum van de factuur?">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        <Veldengroep>
          <Veld
            id="factuurdatum"
            label="Datum van de factuur"
            type="date"
            waarde={waarden.factuurdatum}
            fout={fouten.factuurdatum}
            onWaarde={(w) => zet("factuurdatum", w)}
            onVerlaten={() => verlaten("factuurdatum")}
          />
        </Veldengroep>

        <StapKnoppen>
          <Button type="submit" variant="primair" size="groot">
            Verder
          </Button>
        </StapKnoppen>
      </Stap>
    </form>
  )
}

export function StapBedrag({ begin, onVerder }: Props) {
  const formulier = useStapFormulier(bedragSchema, { bedrag: begin?.bedrag ?? "" })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel="Hoeveel moet je betalen?" uitleg="Het bedrag dat op de factuur staat.">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        <Veldengroep>
          <Veld
            id="bedrag"
            label="Bedrag in euro"
            inputMode="decimal"
            autoComplete="off"
            voorbeeld="248,50"
            waarde={waarden.bedrag}
            fout={fouten.bedrag}
            onWaarde={(w) => zet("bedrag", w)}
            onVerlaten={() => verlaten("bedrag")}
          />
        </Veldengroep>

        <StapKnoppen>
          <Button type="submit" variant="primair" size="groot">
            Verder
          </Button>
        </StapKnoppen>
      </Stap>
    </form>
  )
}
