"use client"

import { useActionState } from "react"
import { stuurCode, controleerCode, type CodeResult } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Foutmelding } from "@/components/ui/foutmelding"
import { Veldengroep } from "@/components/ui/veldengroep"

const beginStand: CodeResult = { status: "idle" }

// Stap 1: e-mailadres. Stap 2: de code van 6 cijfers uit de mail.
// terug: waar je na het inloggen heen gaat, bijvoorbeeld de stap in de aanvraag waar je was.
export function InlogFormulier({ terug }: { terug?: string }) {
  const [mailStand, vraagCode, bezigMetMail] = useActionState(stuurCode, beginStand)
  const [codeStand, checkCode, bezigMetCode] = useActionState(controleerCode, beginStand)

  if (mailStand.status === "code_verstuurd") {
    return (
      <CodeStap
        email={mailStand.email}
        fout={codeStand.status === "fout" ? codeStand.melding : undefined}
        actie={checkCode}
        bezig={bezigMetCode}
        terug={terug}
      />
    )
  }

  const fout = mailStand.status === "fout" ? mailStand.melding : undefined
  // React maakt het formulier leeg na versturen. Zo blijft het ingevulde adres staan.
  const ingevuld = mailStand.status === "fout" ? mailStand.email : undefined

  return (
    <form action={vraagCode} className="flex flex-col gap-6" noValidate>
      <Veldengroep>
        <Label htmlFor="email">
          E-mailadres
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          key={ingevuld ?? ""}
          defaultValue={ingevuld}
          required
          voorbeeld="naam@voorbeeld.nl"
          aria-invalid={fout ? true : undefined}
          aria-describedby={fout ? "email-fout" : undefined}
        />
        {fout && (
          <Foutmelding id="email-fout">
            {fout}
          </Foutmelding>
        )}
      </Veldengroep>

      <Button
        type="submit"
        disabled={bezigMetMail}
        variant="primair"
        size="groot"
        className="w-full md:w-auto md:self-start"
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
  terug,
}: {
  email: string
  fout?: string
  actie: (formData: FormData) => void
  bezig: boolean
  terug?: string
}) {
  return (
    <form action={actie} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="terug" value={terug ?? ""} />

      <p>
        We hebben een code van 6 cijfers gestuurd naar <span className="font-medium text-ink">{email}</span>. Zie je geen
        mail? Kijk ook in je spammap.
      </p>

      <Veldengroep>
        <Label htmlFor="code">
          Code uit je mail
        </Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          aria-invalid={fout ? true : undefined}
          voorbeeld="123456"
          aria-describedby={fout ? "code-fout" : undefined}
          className="tabular text-lg tracking-[0.3em]"
        />
        {fout && (
          <Foutmelding id="code-fout">
            {fout}
          </Foutmelding>
        )}
      </Veldengroep>

      <Button
        type="submit"
        disabled={bezig}
        variant="primair"
        size="groot"
        className="w-full md:w-auto md:self-start"
      >
        {bezig ? "Bezig met controleren..." : "Inloggen"}
      </Button>

      {/* Laadt de pagina opnieuw, zodat je terug bent bij stap 1 */}
      <a
        href={terug ? `/inloggen?terug=${encodeURIComponent(terug)}` : "/inloggen"}
        className="text-sm text-ink underline underline-offset-4 hover:text-ink-soft"
      >
        Nieuwe code aanvragen of ander adres gebruiken
      </a>
    </form>
  )
}
