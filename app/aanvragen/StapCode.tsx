"use client"

import { useState, useTransition } from "react"
import { bevestigEnBewaar, stuurAanvraagCode } from "./actions"
import type { AanvraagData } from "./schema"
import { StapKop, Veld, VerderKnop } from "./onderdelen"

// Stap 4: de code uit de mail (verstuurd na stap 3). Daarna bewaren we de zaak.
export function StapCode({
  aanvraag,
  onNieuweCode,
  onKlaar,
}: {
  aanvraag: AanvraagData
  onNieuweCode: () => void
  onKlaar: (zaakId: string) => void
}) {
  const email = aanvraag.gegevens.email
  const [code, setCode] = useState("")
  const [fout, setFout] = useState<string>()
  const [melding, setMelding] = useState<string>()
  const [bezig, startBezig] = useTransition()
  const [verstuurt, startVersturen] = useTransition()

  function nieuweCode() {
    setMelding(undefined)
    startVersturen(async () => {
      const uitkomst = await stuurAanvraagCode(email)
      if (uitkomst.ok) {
        onNieuweCode()
        setMelding("We hebben een nieuwe code gestuurd.")
      } else {
        setMelding(uitkomst.melding)
      }
    })
  }

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) {
      setFout("De code heeft 6 cijfers. Check of je er geen mist.")
      return
    }
    setFout(undefined)
    startBezig(async () => {
      const uitkomst = await bevestigEnBewaar(aanvraag, code)
      if (uitkomst.ok && uitkomst.zaakId) onKlaar(uitkomst.zaakId)
      else if (!uitkomst.ok) setFout(uitkomst.melding)
    })
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <StapKop
        stap={4}
        titel="Check je mail"
        uitleg="Met deze code weten we dat jij het bent. Zo kan niemand een brief uit jouw naam sturen."
      />

      <Veld
        id="code"
        label="Code uit je mail"
        hulp={`We hebben een code van 6 cijfers gestuurd naar ${email}. Check ook je spammap.`}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        waarde={code}
        fout={fout}
        onWaarde={(w) => {
          setCode(w)
          if (fout && /^\d{6}$/.test(w)) setFout(undefined)
        }}
        onVerlaten={() => {}}
      />

      <VerderKnop bezig={bezig}>{bezig ? "Bezig met controleren..." : "Code bevestigen"}</VerderKnop>

      <div className="flex flex-col gap-2" aria-live="polite">
        <button
          type="button"
          onClick={nieuweCode}
          disabled={verstuurt}
          className="min-h-11 self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong disabled:opacity-50"
        >
          {verstuurt ? "Nieuwe code wordt verstuurd..." : "Geen code gekregen? Stuur een nieuwe"}
        </button>
        {melding && <p className="text-sm text-muted-foreground">{melding}</p>}
      </div>
    </form>
  )
}
