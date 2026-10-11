"use client"

import { useState, useTransition } from "react"
import { Label } from "@/components/ui/label"
import { FoutSamenvatting, Veld, VerderKnop, useStapFormulier } from "../aanvragen/onderdelen"
import { partnerSchema } from "./schema"
import { meldAan } from "./actions"

// Aanmeldformulier onderaan /partners. Controleert velden bij verlaten (docs/design.md).
export function PartnerFormulier() {
  const formulier = useStapFormulier(partnerSchema, { naam: "", organisatie: "", functie: "", email: "", bericht: "" })
  const { waarden, fouten, zet, verlaten } = formulier
  const [website, setWebsite] = useState("") // honeypot
  const [klaar, setKlaar] = useState(false)
  const [serverFout, setServerFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (!data) return
    setServerFout(undefined)
    startBezig(async () => {
      const uitkomst = await meldAan(data, website)
      if (uitkomst.ok) setKlaar(true)
      else setServerFout(uitkomst.melding)
    })
  }

  if (klaar) {
    return (
      <p role="status" className="rounded-lg bg-mint-soft p-5 text-base text-ink">
        Dank je wel. Ik neem binnen twee werkdagen contact met je op. Demmy
      </p>
    )
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-6" noValidate>
      <FoutSamenvatting fouten={formulier.samenvatting} />

      <Veld
        id="naam"
        label="Naam"
        autoComplete="name"
        waarde={waarden.naam}
        fout={fouten.naam}
        onWaarde={(w) => zet("naam", w)}
        onVerlaten={() => verlaten("naam")}
      />
      <Veld
        id="organisatie"
        label="Organisatie"
        autoComplete="organization"
        waarde={waarden.organisatie}
        fout={fouten.organisatie}
        onWaarde={(w) => zet("organisatie", w)}
        onVerlaten={() => verlaten("organisatie")}
      />
      <Veld
        id="functie"
        label="Functie"
        optioneel
        autoComplete="organization-title"
        waarde={waarden.functie}
        fout={fouten.functie}
        onWaarde={(w) => zet("functie", w)}
        onVerlaten={() => verlaten("functie")}
      />
      <Veld
        id="email"
        label="E-mailadres"
        type="email"
        inputMode="email"
        autoComplete="email"
        waarde={waarden.email}
        fout={fouten.email}
        onWaarde={(w) => zet("email", w)}
        onVerlaten={() => verlaten("email")}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="bericht" className="text-sm font-medium text-ink">
          Bericht <span className="font-normal text-muted-foreground">(optioneel)</span>
        </Label>
        <textarea
          id="bericht"
          name="bericht"
          rows={4}
          maxLength={2000}
          placeholder="Waar loop je nu tegenaan?"
          value={waarden.bericht}
          onChange={(e) => zet("bericht", e.target.value)}
          onBlur={() => verlaten("bericht")}
          aria-invalid={fouten.bericht ? true : undefined}
          aria-describedby={fouten.bericht ? "bericht-fout" : undefined}
          className="rounded-md border border-line-strong bg-surface p-4 text-base text-ink placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        />
        {fouten.bericht && (
          <p id="bericht-fout" className="text-sm text-error">
            {fouten.bericht}
          </p>
        )}
      </div>

      {/* Honeypot: onzichtbaar voor mensen en schermlezers, bots vullen het in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {serverFout && (
        <p role="alert" className="rounded-md bg-error-tint p-3 text-sm text-ink">
          {serverFout}
        </p>
      )}

      <VerderKnop bezig={bezig}>{bezig ? "Bezig met versturen..." : "Versturen"}</VerderKnop>
    </form>
  )
}
