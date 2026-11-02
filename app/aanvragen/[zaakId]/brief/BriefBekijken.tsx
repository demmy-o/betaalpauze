"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { MAX_TOELICHTING, maakBrief, type BriefGegevens } from "@/lib/brief"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Stap, StapKnoppen } from "../../onderdelen"
import { BriefWeergave } from "./BriefWeergave"
import { verstuurBrief } from "./actions"
import { Veldengroep } from "@/components/ui/veldengroep"

// Je brief, in twee schermen (?deel=):
//   1. toelichting: wil je nog iets toelichten in je eigen woorden? (mag je overslaan)
//   2. brief: lees je brief en verstuur hem. De toelichting staat er dan al in.
export function BriefBekijken({
  zaakId,
  route,
  beta,
  schuldeiserEmail,
  gegevens,
}: {
  zaakId: string
  route: "email" | "post"
  beta: boolean // bètaversie: de brief gaat alleen naar de gebruiker zelf
  schuldeiserEmail: string
  gegevens: Omit<BriefGegevens, "toelichting">
}) {
  const [toelichting, setToelichting] = useState("")
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()
  const deel = useSearchParams().get("deel") === "brief" ? "brief" : "toelichting"
  const adres = `/aanvragen/${zaakId}/brief`

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
    <div key={deel} className="flex flex-col gap-8">
      {deel === "toelichting" ? (
        <Stap
          titel="Wil je nog iets toelichten?"
          uitleg="In je eigen woorden, bijvoorbeeld waarom het nu even niet lukt. Je mag dit ook overslaan."
          terug={`/aanvragen/${zaakId}/voorstel`}
        >
          <Veldengroep>
            <div className="flex flex-col gap-2">
              <Label htmlFor="toelichting">
                Toelichting
                <span className="font-normal text-muted-foreground">(optioneel)</span>
              </Label>
              <Textarea
                id="toelichting"
                name="toelichting"
                rows={4}
                maxLength={MAX_TOELICHTING}
                value={toelichting}
                onChange={(e) => setToelichting(e.target.value)}
                voorbeeld="Ik heb deze maand een onverwachte rekening gehad."
                aria-describedby="toelichting-teller"
              />
              <p id="toelichting-teller" className="text-sm text-muted-foreground" aria-live="polite">
                Nog {over} {over === 1 ? "teken" : "tekens"}
              </p>
            </div>
          </Veldengroep>
          <StapKnoppen>
            <Link href={`${adres}?deel=brief`} data-slot="button" className={buttonVariants({ variant: "primair", size: "groot" })}>
              {toelichting.trim() ? "Verder" : "Overslaan"}
            </Link>
          </StapKnoppen>
        </Stap>
      ) : (
        <Stap
          kolom="tekst"
          titel="Lees je brief"
          uitleg="Zo komt je brief eruit te zien. Hij gaat pas weg als jij op versturen drukt."
          terug={`${adres}?deel=toelichting`}
        >
          <BriefWeergave brief={brief} />

          <section className="flex flex-col gap-4 rounded-lg bg-surface p-5">
            {beta ? (
              <p className="text-base text-ink">
                Dit is de testversie. Je brief gaat <span className="font-medium">niet</span> naar{" "}
                {gegevens.schuldeiser.naam}, maar alleen naar jou, op{" "}
                <span className="font-medium">{gegevens.afzender.email}</span>.
              </p>
            ) : route === "post" ? (
              <p className="text-base text-ink">
                Wij sturen je brief per post naar{" "}
                <span className="font-medium">
                  {gegevens.schuldeiser.naam}, {gegevens.schuldeiser.straat}, {gegevens.schuldeiser.postcode}{" "}
                  {gegevens.schuldeiser.plaats}
                </span>
                . We doen hem binnen 2 werkdagen op de post. Antwoorden komen per mail bij jou, op{" "}
                <span className="font-medium">{gegevens.afzender.email}</span>.
              </p>
            ) : (
              <p className="text-base text-ink">
                Je brief gaat naar <span className="font-medium">{schuldeiserEmail}</span>. Jij krijgt een kopie op{" "}
                <span className="font-medium">{gegevens.afzender.email}</span>, en antwoorden komen direct bij jou.
              </p>
            )}
            {fout && (
              <p role="alert" className="rounded-md bg-error-tint p-3 text-sm text-ink">
                {fout}
              </p>
            )}
            <StapKnoppen>
              <Button
                type="button"
                variant="primair"
                size="groot"
                onClick={verstuur}
                disabled={bezig}
              >
                {bezig
                  ? "Je brief wordt verstuurd..."
                  : beta
                    ? "Stuur de testbrief naar mij"
                    : route === "post"
                    ? "Voorstel per post laten versturen"
                    : "Voorstel versturen"}
              </Button>
            </StapKnoppen>
          </section>

          {/* Opent de PDF in een nieuw tabblad, met de toelichting zoals die nu is. */}
          <form method="post" action={`/aanvragen/${zaakId}/brief/pdf`} target="_blank">
            <input type="hidden" name="toelichting" value={toelichting} />
            <Button
              type="submit"
              variant="tertiair"
              size="klein"
            >
              Bekijk de brief eerst als PDF
            </Button>
          </form>
        </Stap>
      )}
    </div>
  )
}
