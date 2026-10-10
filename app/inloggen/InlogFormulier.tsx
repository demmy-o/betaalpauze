"use client"

import { useActionState } from "react"
import { stuurCode, controleerCode, type CodeResult } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const beginStand: CodeResult = { status: "idle" }

// Stap 1: e-mailadres. Stap 2: de code van 6 cijfers uit de mail.
export function InlogFormulier() {
  const [mailStand, vraagCode, bezigMetMail] = useActionState(stuurCode, beginStand)
  const [codeStand, checkCode, bezigMetCode] = useActionState(controleerCode, beginStand)

  if (mailStand.status === "code_verstuurd") {
    return (
      <CodeStap
        email={mailStand.email}
        fout={codeStand.status === "fout" ? codeStand.melding : undefined}
        actie={checkCode}
        bezig={bezigMetCode}
      />
    )
  }

  const fout = mailStand.status === "fout" ? mailStand.melding : undefined
  // React maakt het formulier leeg na versturen. Zo blijft het ingevulde adres staan.
  const ingevuld = mailStand.status === "fout" ? mailStand.email : undefined

  return (
    <form action={vraagCode} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-sm font-medium text-ink">
          E-mailadres
        </Label>
        <p id="email-hulp" className="text-sm text-muted-foreground">
          We sturen een code van 6 cijfers naar dit adres.
        </p>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          key={ingevuld ?? ""}
          defaultValue={ingevuld}
          required
          placeholder="naam@voorbeeld.nl"
          aria-invalid={fout ? true : undefined}
          aria-describedby={fout ? "email-hulp email-fout" : "email-hulp"}
          className="h-12 rounded-md border-line-strong bg-surface px-4 focus-visible:border-line-strong focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet text-base text-ink placeholder:text-subtle"
        />
        {fout && (
          <p id="email-fout" className="text-sm text-error">
            {fout}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={bezigMetMail}
        className="h-12 w-full rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft sm:w-auto sm:self-start"
      >
        {bezigMetMail ? "Code wordt verstuurd..." : "Stuur mij een code"}
      </Button>
    </form>
  )
}

function CodeStap({
  email,
  fout,
  actie,
  bezig,
}: {
  email: string
  fout?: string
  actie: (formData: FormData) => void
  bezig: boolean
}) {
  return (
    <form action={actie} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="email" value={email} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="code" className="text-sm font-medium text-ink">
          Code uit je mail
        </Label>
        <p id="code-hulp" className="text-sm text-muted-foreground">
          We hebben een code van 6 cijfers gestuurd naar {email}. Check ook je spammap.
        </p>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          aria-invalid={fout ? true : undefined}
          aria-describedby={fout ? "code-hulp code-fout" : "code-hulp"}
          className="tabular h-12 rounded-md border-line-strong bg-surface px-4 focus-visible:border-line-strong focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet text-lg tracking-[0.3em] text-ink"
        />
        {fout && (
          <p id="code-fout" className="text-sm text-error">
            {fout}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={bezig}
        className="h-12 w-full rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft sm:w-auto sm:self-start"
      >
        {bezig ? "Bezig met controleren..." : "Inloggen"}
      </Button>

      {/* Laadt de pagina opnieuw, zodat je terug bent bij stap 1 */}
      <a href="/inloggen" className="text-sm text-violet underline underline-offset-4 hover:text-violet-strong">
        Nieuwe code aanvragen of ander adres gebruiken
      </a>
    </form>
  )
}
