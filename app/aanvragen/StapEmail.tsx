"use client"

import { useState, useTransition } from "react"
import { bevestigEnBewaar, stuurAanvraagCode } from "./actions"
import { emailSchema, type AanvraagData } from "./schema"
import { FoutSamenvatting, StapKop, Veld, VerderKnop, useStapFormulier } from "./onderdelen"

const OPNIEUW_NA_MS = 60 * 1000 // Supabase stuurt maximaal één code per minuut

// Stap 4: je e-mailadres, en daarna op hetzelfde scherm de code uit je mail.
// Na de juiste code bewaren we de zaak.
export function StapEmail({
  aanvraag,
  beginEmail,
  codeVerstuurd,
  laatsteCode,
  onCodeVerstuurd,
  onAnderAdres,
  onKlaar,
}: {
  aanvraag: Omit<AanvraagData, "email">
  beginEmail?: string
  codeVerstuurd?: { email: string; tijd: number }
  laatsteCode?: { email: string; tijd: number }
  onCodeVerstuurd: (email: string, tijd: number) => void
  onAnderAdres: () => void
  onKlaar: (zaakId: string) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <StapKop
        stap={4}
        titel="Je e-mailadres"
        uitleg="We sturen je een code. Zo weten we dat jij het bent, en kan niemand een brief uit jouw naam sturen."
      />

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
    </div>
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

      <Veld
        id="email"
        label="Jouw e-mailadres"
        hulp="Hier sturen we de code naartoe, en straks een kopie van de brief."
        type="email"
        inputMode="email"
        autoComplete="email"
        waarde={formulier.waarden.email}
        fout={formulier.fouten.email}
        onWaarde={(w) => formulier.zet("email", w)}
        onVerlaten={() => formulier.verlaten("email")}
      />

      {serverFout && (
        <p role="alert" className="rounded-lg bg-error-tint p-4 text-sm text-ink">
          {serverFout}
        </p>
      )}

      <VerderKnop bezig={bezig}>{bezig ? "Code wordt verstuurd..." : "Stuur mij een code"}</VerderKnop>
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
      <div className="flex flex-col gap-1 rounded-lg bg-lilac-soft p-5">
        <p className="text-sm text-muted-foreground">Code gestuurd naar</p>
        <p className="font-medium text-ink">{email}</p>
        <button
          type="button"
          onClick={onAnderAdres}
          className="min-h-11 self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
        >
          Ander e-mailadres gebruiken
        </button>
      </div>

      <Veld
        id="code"
        label="Code uit je mail"
        hulp="De code heeft 6 cijfers. Zie je geen mail? Check ook je spammap."
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
