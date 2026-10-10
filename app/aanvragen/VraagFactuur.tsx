"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Vóór stap 1: klopt de factuur? Een betaalvoorstel is alleen bedoeld voor een
// rekening die klopt. Klopt hij niet, dan helpen we de gebruiker de goede kant op.
export function VraagFactuur({ onKlopt }: { onKlopt: () => void }) {
  const [klopt, setKlopt] = useState<boolean>()

  if (klopt === false) return <KloptNiet onTerug={() => setKlopt(undefined)} />

  return (
    <div className="flex flex-col gap-8">
      <Link href="/" className="self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong">
        Terug
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-ink">Klopt de factuur?</h1>
        <p className="text-lead text-muted-foreground">
          Een betaalvoorstel is voor een rekening die klopt, maar die je nu niet in één keer kunt betalen.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={onKlopt}
          className="h-12 w-full rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft"
        >
          Ja, de factuur klopt
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setKlopt(false)}
          className="h-12 w-full rounded-full border-ink px-6 text-base font-medium text-ink"
        >
          Nee, er klopt iets niet
        </Button>
      </div>
    </div>
  )
}

function KloptNiet({ onTerug }: { onTerug: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <button
        type="button"
        onClick={onTerug}
        className="self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
      >
        Terug
      </button>

      <section className="flex flex-col gap-4 rounded-lg bg-peach-soft p-6">
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
              className="text-violet underline underline-offset-4 hover:text-violet-strong"
            >
              juridischloket.nl
            </a>{" "}
            of 0900 8020.
          </li>
        </ul>
      </section>
    </div>
  )
}
