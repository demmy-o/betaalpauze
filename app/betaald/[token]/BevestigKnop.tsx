"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { bevestigBetaald } from "./actions"
import { Kaart } from "@/components/ui/kaart"

const REDENEN: Record<string, string> = {
  gebruikt: "Deze link is al gebruikt. Je betaling stond al genoteerd.",
  verlopen: "Deze link is verlopen. Je kunt je betaling ook op Mijn plan doorgeven.",
  onbekend: "Deze link werkt niet. Je kunt je betaling ook op Mijn plan doorgeven.",
}

// Pas deze knop zet de termijn op betaald. Alleen de link openen doet nog niets,
// want mailprogramma's openen links soms vanzelf om ze te controleren.
export function BevestigKnop({ token, knopTekst }: { token: string; knopTekst: string }) {
  const [uitkomst, setUitkomst] = useState<{ ok: true } | { ok: false; reden: string }>()
  const [bezig, startBezig] = useTransition()

  if (uitkomst?.ok) {
    return (
      <Kaart role="status" className="gap-3">
        <h2 className="text-h3 text-ink">Genoteerd</h2>
        <p className="text-base text-ink">We hebben je betaling op betaald gezet. Je ziet het ook op Mijn plan.</p>
        <Link href="/mijn-plan" className="self-start text-sm text-ink underline underline-offset-4 hover:text-ink-soft">
          Naar Mijn plan
        </Link>
      </Kaart>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {uitkomst && !uitkomst.ok && (
        <p role="alert" className="rounded-md bg-error-tint p-3 text-sm text-ink">
          {REDENEN[uitkomst.reden] ?? REDENEN.onbekend}
        </p>
      )}
      <Button
        type="button"
        variant="primair"
        size="groot"
        disabled={bezig}
        onClick={() => startBezig(async () => setUitkomst(await bevestigBetaald(token)))}
        className="w-full md:w-auto md:self-start"
      >
        {bezig ? "Bezig met opslaan..." : knopTekst}
      </Button>
    </div>
  )
}
