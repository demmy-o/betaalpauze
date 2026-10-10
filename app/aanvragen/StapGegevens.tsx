"use client"

import { useState, useTransition } from "react"
import { gegevensSchema, type Gegevens } from "./schema"
import { FoutSamenvatting, StapKop, Veld, VerderKnop, useStapFormulier } from "./onderdelen"

// Stap 3: wie stuurt het voorstel?
// onVerder stuurt de code. Geeft die een melding terug, dan blijf je hier.
export function StapGegevens({
  begin,
  onVerder,
}: {
  begin?: Gegevens
  onVerder: (g: Gegevens) => Promise<string | undefined>
}) {
  const [serverFout, setServerFout] = useState<string>()
  const [bezig, startBezig] = useTransition()
  const formulier = useStapFormulier(gegevensSchema, {
    voornaam: begin?.voornaam ?? "",
    achternaam: begin?.achternaam ?? "",
    straat: begin?.straat ?? "",
    postcode: begin?.postcode ?? "",
    plaats: begin?.plaats ?? "",
    email: begin?.email ?? "",
  })
  const { waarden, fouten, zet, verlaten } = formulier

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (!data) return
    setServerFout(undefined)
    startBezig(async () => {
      const melding = await onVerder(data)
      if (melding) setServerFout(melding)
    })
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <StapKop
        stap={3}
        titel="Jouw gegevens"
        uitleg="Deze gegevens komen in de brief, zodat het bedrijf weet van wie het voorstel is."
      />

      <FoutSamenvatting fouten={formulier.samenvatting} />

      <div className="flex flex-col gap-6">
        <Veld
          id="voornaam"
          label="Voornaam"
          autoComplete="given-name"
          waarde={waarden.voornaam}
          fout={fouten.voornaam}
          onWaarde={(w) => zet("voornaam", w)}
          onVerlaten={() => verlaten("voornaam")}
        />
        <Veld
          id="achternaam"
          label="Achternaam"
          autoComplete="family-name"
          waarde={waarden.achternaam}
          fout={fouten.achternaam}
          onWaarde={(w) => zet("achternaam", w)}
          onVerlaten={() => verlaten("achternaam")}
        />
        <Veld
          id="straat"
          label="Straat en huisnummer"
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
          placeholder="1234 AB"
          waarde={waarden.postcode}
          fout={fouten.postcode}
          onWaarde={(w) => zet("postcode", w)}
          onVerlaten={() => verlaten("postcode")}
        />
        <Veld
          id="plaats"
          label="Woonplaats"
          autoComplete="address-level2"
          waarde={waarden.plaats}
          fout={fouten.plaats}
          onWaarde={(w) => zet("plaats", w)}
          onVerlaten={() => verlaten("plaats")}
        />
        <Veld
          id="email"
          label="Jouw e-mailadres"
          hulp="Hier sturen we een code naartoe, en straks een kopie van de brief."
          type="email"
          inputMode="email"
          autoComplete="email"
          waarde={waarden.email}
          fout={fouten.email}
          onWaarde={(w) => zet("email", w)}
          onVerlaten={() => verlaten("email")}
        />
      </div>

      {serverFout && (
        <p role="alert" className="rounded-lg bg-error-tint p-4 text-sm text-ink">
          {serverFout}
        </p>
      )}

      <VerderKnop bezig={bezig}>{bezig ? "Code wordt verstuurd..." : "Stuur mij een code"}</VerderKnop>
    </form>
  )
}
