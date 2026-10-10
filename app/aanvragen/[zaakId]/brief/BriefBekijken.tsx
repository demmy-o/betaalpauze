"use client"

import { useState, useTransition } from "react"
import { MAX_TOELICHTING, maakBrief, type BriefGegevens } from "@/lib/brief"
import { Label } from "@/components/ui/label"
import { StapKop } from "../../onderdelen"
import { BriefWeergave } from "./BriefWeergave"
import { verstuurBrief } from "./actions"

// Scherm 6: lees je brief, voeg eventueel iets toe in je eigen woorden.
// Het voorbeeld verandert mee terwijl je typt.
export function BriefBekijken({
  zaakId,
  schuldeiserEmail,
  gegevens,
}: {
  zaakId: string
  schuldeiserEmail: string
  gegevens: Omit<BriefGegevens, "toelichting">
}) {
  const [toelichting, setToelichting] = useState("")
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()

  function verstuur() {
    setFout(undefined)
    startBezig(async () => {
      const uitkomst = await verstuurBrief(zaakId, toelichting)
      if (uitkomst) setFout(uitkomst.melding)
    })
  }
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

      <section className="flex flex-col gap-4 rounded-lg bg-lilac-soft p-5">
        <p className="text-base text-ink">
          Je brief gaat naar <span className="font-medium">{schuldeiserEmail}</span>. Jij krijgt een kopie op{" "}
          <span className="font-medium">{gegevens.afzender.email}</span>, en antwoorden komen direct bij jou.
        </p>
        {fout && (
          <p role="alert" className="rounded-md bg-error-tint p-3 text-sm text-ink">
            {fout}
          </p>
        )}
        <button
          type="button"
          onClick={verstuur}
          disabled={bezig}
          className="h-12 w-full rounded-full bg-ink px-6 text-base font-medium text-white transition-colors duration-[120ms] hover:bg-ink-soft disabled:opacity-60 sm:w-auto sm:self-start"
        >
          {bezig ? "Je brief wordt verstuurd..." : "Voorstel versturen"}
        </button>
      </section>

      {/* Opent de PDF in een nieuw tabblad, met de toelichting zoals die nu is. */}
      <form method="post" action={`/aanvragen/${zaakId}/brief/pdf`} target="_blank">
        <input type="hidden" name="toelichting" value={toelichting} />
        <button
          type="submit"
          className="min-h-11 text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
        >
          Bekijk de brief eerst als PDF
        </button>
      </form>
    </div>
  )
}
