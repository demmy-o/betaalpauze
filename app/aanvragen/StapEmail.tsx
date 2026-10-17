"use client"

import { useState, useTransition } from "react"
import { bevestigEnBewaar, bewaarAlsIngelogd, stuurAanvraagCode } from "./actions"
import { emailSchema, type AanvraagData } from "./schema"
import { FoutSamenvatting, Stap, Veld, StapKnoppen, useStapFormulier } from "./onderdelen"
import { Kaart } from "@/components/ui/kaart"
import { Foutmelding } from "@/components/ui/foutmelding"
import { Button } from "@/components/ui/button"
import { Veldengroep } from "@/components/ui/veldengroep"

const OPNIEUW_NA_MS = 60 * 1000 // Supabase stuurt maximaal één code per minuut

// Stap 4: je e-mailadres, en daarna op hetzelfde scherm de code uit je mail.
// Na de juiste code bewaren we de zaak.
export function StapEmail({
  ingelogdAls,
  aanvraag,
  beginEmail,
  codeVerstuurd,
  laatsteCode,
  onCodeVerstuurd,
  onAnderAdres,
  onKlaar,
}: {
  ingelogdAls?: string // het e-mailadres van je account, als je al ingelogd bent
  aanvraag: Omit<AanvraagData, "email">
  beginEmail?: string
  codeVerstuurd?: { email: string; tijd: number }
  laatsteCode?: { email: string; tijd: number }
  onCodeVerstuurd: (email: string, tijd: number) => void
  onAnderAdres: () => void
  onKlaar: (zaakId: string) => void
}) {
  // Al ingelogd: geen e-mailadres en geen code nodig.
  if (ingelogdAls) {
    return (
      <Stap stap={4} titel="Je voorstel bewaren" uitleg="Je bent ingelogd. We bewaren je voorstel bij je account.">
        <AlIngelogd email={ingelogdAls} aanvraag={aanvraag} onKlaar={onKlaar} />
      </Stap>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Stap
        stap={4}
        titel="Je e-mailadres"
        uitleg="We sturen je een code. Zo weten we dat jij het bent, en kan niemand een brief uit jouw naam sturen."
      >
        {codeVerstuurd ? (
          <CodeInvullen
            aanvraag={aanvraag}
            email={codeVerstuurd.email}
            verstuurdOp={codeVerstuurd.tijd}
            onNieuweCode={() => onCodeVerstuurd(codeVerstuurd.email, Date.now())}
            onAnderAdres={onAnderAdres}
            onKlaar={onKlaar}
          />
        ) : (
          <EmailInvullen begin={beginEmail} laatsteCode={laatsteCode} onVerstuurd={onCodeVerstuurd} />
        )}
      </Stap>
    </div>
  )
}

function AlIngelogd({
  email,
  aanvraag,
  onKlaar,
}: {
  email: string
  aanvraag: Omit<AanvraagData, "email">
  onKlaar: (zaakId: string) => void
}) {
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  function bewaar(e: React.FormEvent) {
    e.preventDefault()
    setFout(undefined)
    startBezig(async () => {
      const uitkomst = await bewaarAlsIngelogd(aanvraag)
      if (uitkomst.ok && uitkomst.zaakId) onKlaar(uitkomst.zaakId)
      else if (!uitkomst.ok) setFout(uitkomst.melding)
    })
  }

  return (
    <form onSubmit={bewaar} className="flex flex-col gap-8" noValidate>
      <Kaart as="div" className="gap-1">
        <p className="text-sm text-muted-foreground">Ingelogd als</p>
        <p className="font-medium text-ink">{email}</p>
        <p className="text-sm text-muted-foreground">Hier sturen we straks ook een kopie van je brief naartoe.</p>
      </Kaart>
      {fout && <Foutmelding role="alert">{fout}</Foutmelding>}
      <StapKnoppen>
        <Button type="submit" variant="primair" size="groot" disabled={bezig}>
          {bezig ? "Bezig met bewaren..." : "Verder naar je voorstel"}
        </Button>
      </StapKnoppen>
    </form>
  )
}

function EmailInvullen({
  begin,
  laatsteCode,
  onVerstuurd,
}: {
  begin?: string
  laatsteCode?: { email: string; tijd: number }
  onVerstuurd: (email: string, tijd: number) => void
}) {
  const formulier = useStapFormulier(emailSchema, { email: begin ?? "" })
  const [serverFout, setServerFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const data = formulier.controleerAlles()
    if (!data) return
    const email = data.email.toLowerCase()

    // Net al een code naar dit adres gestuurd? Dan geldt die nog, niet opnieuw sturen.
    if (laatsteCode?.email === email && Date.now() - laatsteCode.tijd < OPNIEUW_NA_MS) {
      onVerstuurd(email, laatsteCode.tijd)
      return
    }

    setServerFout(undefined)
    startBezig(async () => {
      const uitkomst = await stuurAanvraagCode(email)
      if (uitkomst.ok) onVerstuurd(email, Date.now())
      else setServerFout(uitkomst.melding)
    })
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <FoutSamenvatting fouten={formulier.samenvatting} />

      <Veldengroep>
        <Veld
          id="email"
          label="Jouw e-mailadres"
          voorbeeld="naam@voorbeeld.nl"
          type="email"
          inputMode="email"
          autoComplete="email"
          waarde={formulier.waarden.email}
          fout={formulier.fouten.email}
          onWaarde={(w) => formulier.zet("email", w)}
          onVerlaten={() => formulier.verlaten("email")}
        />
      </Veldengroep>

      {serverFout && (
        <p role="alert" className="rounded-lg bg-error-tint p-4 text-sm text-ink">
          {serverFout}
        </p>
      )}

      <StapKnoppen>

        <Button type="submit" variant="primair" size="groot" disabled={bezig}>

          {bezig ? "Code wordt verstuurd..." : "Stuur mij een code"}

        </Button>

      </StapKnoppen>
    </form>
  )
}

function CodeInvullen({
  aanvraag,
  email,
  verstuurdOp,
  onNieuweCode,
  onAnderAdres,
  onKlaar,
}: {
  aanvraag: Omit<AanvraagData, "email">
  email: string
  verstuurdOp: number
  onNieuweCode: () => void
  onAnderAdres: () => void
  onKlaar: (zaakId: string) => void
}) {
  const [code, setCode] = useState("")
  const [fout, setFout] = useState<string>()
  const [melding, setMelding] = useState<string>()
  const [bezig, startBezig] = useTransition()
  const [verstuurt, startVersturen] = useTransition()

  function nieuweCode() {
    if (Date.now() - verstuurdOp < OPNIEUW_NA_MS) {
      setMelding("Je kunt één keer per minuut een nieuwe code aanvragen. Wacht nog even.")
      return
    }
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
      const uitkomst = await bevestigEnBewaar({ ...aanvraag, email }, code)
      if (uitkomst.ok && uitkomst.zaakId) onKlaar(uitkomst.zaakId)
      else if (!uitkomst.ok) setFout(uitkomst.melding)
    })
  }

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <Kaart as="div" className="gap-1">
        <p className="text-sm text-muted-foreground">Code gestuurd naar</p>
        <p className="font-medium text-ink">{email}</p>
        <p className="text-sm text-muted-foreground">Zie je geen mail? Kijk ook in je spammap.</p>
        <Button
          type="button"
          onClick={onAnderAdres}
          variant="tertiair"
          size="klein"
          className="self-start"
        >
          Ander e-mailadres gebruiken
        </Button>
      </Kaart>

      <Veldengroep>
        <Veld
          id="code"
          label="Code uit je mail"
          voorbeeld="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          waarde={code}
          fout={fout}
          onWaarde={(w) => {
            setCode(w)
            if (fout && /^\d{6}$/.test(w)) setFout(undefined)
          }}
          onVerlaten={() => {}}
        />
      </Veldengroep>

      <StapKnoppen>

        <Button type="submit" variant="primair" size="groot" disabled={bezig}>

          {bezig ? "Bezig met controleren..." : "Code bevestigen"}

        </Button>

      </StapKnoppen>

      <div className="flex flex-col gap-2" aria-live="polite">
        <Button
          type="button"
          onClick={nieuweCode}
          disabled={verstuurt}
          variant="tertiair"
          size="klein"
          className="self-start"
        >
          {verstuurt ? "Nieuwe code wordt verstuurd..." : "Geen code gekregen? Stuur een nieuwe"}
        </Button>
        {melding && <p className="text-sm text-muted-foreground">{melding}</p>}
      </div>
    </form>
  )
}
