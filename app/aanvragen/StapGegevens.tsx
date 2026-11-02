"use client"

import { adresSchema, naamSchema, type Gegevens } from "./schema"
import { FoutSamenvatting, Stap, Veld, StapKnoppen, useStapFormulier } from "./onderdelen"
import { Button } from "@/components/ui/button"
import { Veldengroep } from "@/components/ui/veldengroep"

// Jouw gegevens, in twee schermen: je naam en je adres. Ze komen in de brief.
type Props = { begin?: Partial<Gegevens>; onVerder: (g: Partial<Gegevens>) => void }

export function StapNaam({ begin, onVerder }: Props) {
  const formulier = useStapFormulier(naamSchema, {
    voornaam: begin?.voornaam ?? "",
    achternaam: begin?.achternaam ?? "",
  })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel="Wat is je naam?" uitleg="Zo weet het bedrijf van wie het voorstel is.">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        <Veldengroep>
          <Veld
            id="voornaam"
            label="Voornaam"
            voorbeeld="Sanne"
            autoComplete="given-name"
            waarde={waarden.voornaam}
            fout={fouten.voornaam}
            onWaarde={(w) => zet("voornaam", w)}
            onVerlaten={() => verlaten("voornaam")}
          />
          <Veld
            id="achternaam"
            label="Achternaam"
            voorbeeld="de Vries"
            autoComplete="family-name"
            waarde={waarden.achternaam}
            fout={fouten.achternaam}
            onWaarde={(w) => zet("achternaam", w)}
            onVerlaten={() => verlaten("achternaam")}
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

export function StapAdres({ begin, onVerder }: Props) {
  const formulier = useStapFormulier(adresSchema, {
    straat: begin?.straat ?? "",
    postcode: begin?.postcode ?? "",
    plaats: begin?.plaats ?? "",
  })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel="Wat is je adres?" uitleg="Dit komt in de brief, als afzender.">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        <Veldengroep>
          <Veld
            id="straat"
            label="Straat en huisnummer"
            voorbeeld="Dorpsstraat 12"
            autoComplete="street-address"
            waarde={waarden.straat}
            fout={fouten.straat}
            onWaarde={(w) => zet("straat", w)}
            onVerlaten={() => verlaten("straat")}
          />
          <Veld
            id="postcode"
            label="Postcode"
            autoComplete="postal-code"
            voorbeeld="1234 AB"
            waarde={waarden.postcode}
            fout={fouten.postcode}
            onWaarde={(w) => zet("postcode", w)}
            onVerlaten={() => verlaten("postcode")}
          />
          <Veld
            id="plaats"
            label="Woonplaats"
            voorbeeld="Utrecht"
            autoComplete="address-level2"
            waarde={waarden.plaats}
            fout={fouten.plaats}
            onWaarde={(w) => zet("plaats", w)}
            onVerlaten={() => verlaten("plaats")}
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
