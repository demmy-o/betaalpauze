"use client"

import { useState } from "react"
import { MAX_TOELICHTING, maakBrief, type BriefGegevens } from "@/lib/brief"
import { Label } from "@/components/ui/label"
import { StapKop } from "../../onderdelen"
import { BriefWeergave } from "./BriefWeergave"

// Scherm 6: lees je brief, voeg eventueel iets toe in je eigen woorden.
// Het voorbeeld verandert mee terwijl je typt.
export function BriefBekijken({ zaakId, gegevens }: { zaakId: string; gegevens: Omit<BriefGegevens, "toelichting"> }) {
  const [toelichting, setToelichting] = useState("")
  const brief = maakBrief({ ...gegevens, toelichting })
  const over = MAX_TOELICHTING - toelichting.length

  return (
    <div className="flex flex-col gap-8">
      <StapKop
        stap={6}
        titel="Lees je brief"
        uitleg="Zo komt je brief eruit te zien. Hij gaat pas weg als jij op versturen drukt."
        terug={`/aanvragen/${zaakId}/voorstel`}
      />

      <BriefWeergave brief={brief} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="toelichting" className="text-sm font-medium text-ink">
          Wil je iets toelichten?
          <span className="font-normal text-muted-foreground"> (optioneel)</span>
        </Label>
        <p id="toelichting-hulp" className="text-sm text-muted-foreground">
          Bijvoorbeeld waarom je nu niet kunt betalen. Houd het kort. Het komt in de brief, onder je voorstel.
        </p>
        <textarea
          id="toelichting"
          name="toelichting"
          rows={4}
          maxLength={MAX_TOELICHTING}
          value={toelichting}
          onChange={(e) => setToelichting(e.target.value)}
          aria-describedby="toelichting-hulp toelichting-teller"
          className="rounded-md border border-line-strong bg-surface p-4 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        />
        <p id="toelichting-teller" className="text-sm text-muted-foreground" aria-live="polite">
          Nog {over} {over === 1 ? "teken" : "tekens"}
        </p>
      </div>

      {/* Opent de PDF in een nieuw tabblad, met de toelichting zoals die nu is. */}
      <form method="post" action={`/aanvragen/${zaakId}/brief/pdf`} target="_blank" className="flex flex-col gap-3">
        <input type="hidden" name="toelichting" value={toelichting} />
        <button
          type="submit"
          className="h-12 w-full rounded-full border border-ink px-6 text-base font-medium text-ink transition-colors duration-[120ms] hover:bg-lilac-soft sm:w-auto sm:self-start"
        >
          Bekijk als PDF
        </button>
      </form>
    </div>
  )
}
