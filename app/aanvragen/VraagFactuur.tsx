"use client"

import { useState } from "react"
import { ChevronLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Stap } from "./onderdelen"
import { Kaart } from "@/components/ui/kaart"

// Vóór stap 1: klopt de factuur? Een betaalvoorstel is alleen bedoeld voor een
// rekening die klopt. Klopt hij niet, dan helpen we de gebruiker de goede kant op.
export function VraagFactuur({ onKlopt }: { onKlopt: () => void }) {
  const [klopt, setKlopt] = useState<boolean>()

  if (klopt === false) return <KloptNiet onTerug={() => setKlopt(undefined)} />

  return (
    <Stap
      stap={0}
      titel="Klopt de factuur?"
      uitleg="Een betaalvoorstel is voor een rekening die klopt, maar die je nu niet in één keer kunt betalen."
      terug={null}
    >
      <div className="flex flex-col gap-3">
        <Button type="button" variant="primair" size="groot" onClick={onKlopt} className="w-full">
          Ja, de factuur klopt
        </Button>
        <Button type="button" variant="secundair" size="groot" onClick={() => setKlopt(false)} className="w-full">
          Nee, er klopt iets niet
        </Button>
      </div>
    </Stap>
  )
}

function KloptNiet({ onTerug }: { onTerug: () => void }) {
  return (
    <div data-kolom="smal" className="group/kolom mx-auto flex w-full max-w-form flex-col gap-8">
      <Kaart>
        <h1 className="text-h2 text-ink">Dan is een betaalvoorstel niet de juiste stap</h1>
        <p className="text-base text-ink">
          Met een betaalvoorstel laat je weten dat je de rekening wilt betalen. Klopt de factuur niet, dan is het
          beter om dat eerst met het bedrijf uit te zoeken.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-base text-ink">
          <li>Laat het bedrijf weten wat er niet klopt. Doe dat per e-mail of brief, en bewaar wat je stuurt.</li>
          <li>Betaal het deel dat wel klopt, als dat kan.</li>
          <li>
            Kom je er samen niet uit? Het Juridisch Loket helpt gratis, via{" "}
            <a
              href="https://www.juridischloket.nl"
              target="_blank"
              rel="noreferrer"
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              juridischloket.nl
            </a>{" "}
            of 0900 8020.
          </li>
        </ul>
      </Kaart>

      <Button type="button" variant="secundair" size="groot" onClick={onTerug} className="w-full md:w-auto md:self-center">
        <ChevronLeftIcon aria-hidden />
        Terug naar de vraag
      </Button>
    </div>
  )
}
