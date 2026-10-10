"use client"

import { useState, useTransition } from "react"
import { zetTermijnBetaald, zetTermijnNietBetaald } from "./actions"

// Knop "Betaald" bij een termijn op Mijn plan.
export function BetaaldKnop({ termijnId }: { termijnId: string }) {
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={bezig}
        onClick={() =>
          startBezig(async () => {
            const uitkomst = await zetTermijnBetaald(termijnId)
            if (uitkomst) setFout(uitkomst.melding)
          })
        }
        className="h-11 rounded-full border border-ink px-4 text-sm font-medium text-ink transition-colors duration-[120ms] hover:bg-lilac-soft disabled:opacity-60"
      >
        {bezig ? "..." : "Betaald"}
      </button>
      {fout && (
        <span role="alert" className="mt-1 text-xs text-error">
          {fout}
        </span>
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
      <button
        type="button"
        disabled={bezig}
        onClick={() =>
          startBezig(async () => {
            const uitkomst = await zetTermijnNietBetaald(termijnId)
            if (uitkomst) setFout(uitkomst.melding)
          })
        }
        className="min-h-11 text-xs text-violet underline underline-offset-4 hover:text-violet-strong disabled:opacity-60"
      >
        {bezig ? "..." : "Toch niet betaald"}
      </button>
      {fout && (
        <span role="alert" className="mt-1 text-xs text-error">
          {fout}
        </span>
      )}
    </span>
  )
}
