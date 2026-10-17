"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { zetTermijnBetaald, zetTermijnNietBetaald } from "./actions"
import { Foutmelding } from "@/components/ui/foutmelding"

// Knop "Betaald" bij een termijn op Mijn plan.
export function BetaaldKnop({ termijnId }: { termijnId: string }) {
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  return (
    <span className="flex flex-col items-end">
      <Button
        type="button"
        variant="secundair"
        size="middel"
        disabled={bezig}
        onClick={() =>
          startBezig(async () => {
            const uitkomst = await zetTermijnBetaald(termijnId)
            if (uitkomst) setFout(uitkomst.melding)
          })
        }
      >
        {bezig ? "..." : "Betaald"}
      </Button>
      {fout && (
        <Foutmelding inline role="alert" className="mt-1 text-xs">
          {fout}
        </Foutmelding>
      )}
    </span>
  )
}

// Link "Toch niet betaald" bij een betaalde termijn.
export function TochNietBetaaldKnop({ termijnId }: { termijnId: string }) {
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  return (
    <span className="flex flex-col items-end">
      <Button
        type="button"
        variant="tertiair"
        size="klein"
        disabled={bezig}
        onClick={() =>
          startBezig(async () => {
            const uitkomst = await zetTermijnNietBetaald(termijnId)
            if (uitkomst) setFout(uitkomst.melding)
          })
        }
      >
        {bezig ? "..." : "Toch niet betaald"}
      </Button>
      {fout && (
        <Foutmelding inline role="alert" className="mt-1 text-xs">
          {fout}
        </Foutmelding>
      )}
    </span>
  )
}
