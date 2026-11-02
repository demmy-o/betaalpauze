"use client"

import { adresCompleet, korteNaam } from "@/lib/regeling"
import { bedrijfAdresSchema, bedrijfEmailSchema, type Schuldeiser } from "./schema"
import { FoutSamenvatting, Stap, Veld, StapKnoppen, useStapFormulier } from "./onderdelen"
import { Button } from "@/components/ui/button"
import { Veldengroep } from "@/components/ui/veldengroep"

// Hoe komt de brief bij het bedrijf? Twee schermen die je alleen ziet als het nodig is (zie schermen.ts).
type Props = { schuldeiser: Schuldeiser; onVerder: (deel: Partial<Schuldeiser>) => void }

// We weten het e-mailadres van het bedrijf niet. Weet jij het? Anders sturen wij de brief per post.
export function StapBedrijfEmail({ schuldeiser, onVerder }: Props) {
  const naam = korteNaam(schuldeiser.naam)
  const formulier = useStapFormulier(bedrijfEmailSchema, { email: schuldeiser.email ?? "" })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder({ route: "email", email: data.email })
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel={`Wat is het e-mailadres van ${naam}?`} uitleg="Daar mailen we je brief naartoe. Het staat meestal op de factuur.">
        <FoutSamenvatting fouten={formulier.samenvatting} />

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
        </Veldengroep>

        <StapKnoppen>
          <Button type="submit" variant="primair" size="groot">
            Verder
          </Button>
        </StapKnoppen>

        <Button
          type="button"
          variant="tertiair"
          size="klein"
          className="h-auto min-h-9 self-center py-2 text-center whitespace-normal"
          onClick={() => onVerder({ route: "post", email: "" })}
        >
          Geen e-mailadres? Dan sturen wij de brief per post.
        </Button>
      </Stap>
    </form>
  )
}

// Het postadres van het bedrijf, overgenomen van de factuur.
// Als we zelf een volledig adres hebben, kun je ook terug naar dat adres.
export function StapBedrijfAdres({ schuldeiser, onVerder }: Props) {
  const naam = korteNaam(schuldeiser.naam)
  const bekend = adresCompleet(schuldeiser)
  const formulier = useStapFormulier(bedrijfAdresSchema, {
    postStraat: schuldeiser.postStraat ?? "",
    postPostcode: schuldeiser.postPostcode ?? "",
    postPlaats: schuldeiser.postPlaats ?? "",
  })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (data) onVerder(data)
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Stap titel={`Wat is het postadres van ${naam}?`} uitleg="Neem het over van je factuur. Daar sturen wij je brief naartoe.">
        <FoutSamenvatting fouten={formulier.samenvatting} />

        <Veldengroep>
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
        </Veldengroep>

        <StapKnoppen>
          <Button type="submit" variant="primair" size="groot">
            Verder
          </Button>
        </StapKnoppen>

        {bekend && (
          <Button
            type="button"
            variant="tertiair"
            size="klein"
            className="h-auto min-h-9 self-center py-2 text-center whitespace-normal"
            onClick={() => onVerder({ postAdresAnders: "", postStraat: "", postPostcode: "", postPlaats: "" })}
          >
            Toch het bekende adres gebruiken: {schuldeiser.straat}, {schuldeiser.postcode} {schuldeiser.plaats}
          </Button>
        )}
      </Stap>
    </form>
  )
}
