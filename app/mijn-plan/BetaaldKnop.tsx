"use client"

import { useState, useTransition } from "react"
import { zetTermijnBetaald } from "./actions"

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
