"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  MAX_PAUZE_MAANDEN,
  MAX_TERMIJNEN,
  MIN_TERMIJNEN,
  datumLang,
  euro,
  rekenPlan,
  type Soort,
} from "@/lib/betaalplan"
import { Keuzeknop, Keuzetegel } from "@/components/ui/keuze"
import { TekeningBeide, TekeningPauze, TekeningTermijnen } from "./tekeningen"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Stap, StapKnoppen } from "../../onderdelen"
import { bewaarVoorstel, type VoorstelKeuze } from "./actions"
import { Foutmelding } from "@/components/ui/foutmelding"
import { Kaart } from "@/components/ui/kaart"
import { Button } from "@/components/ui/button"
import { Veldengroep } from "@/components/ui/veldengroep"

const SOORTEN: { waarde: Soort; titel: string; uitleg: string; tekening: React.ReactNode }[] = [
  {
    waarde: "pauze",
    titel: "Een pauze",
    uitleg: "Je betaalt even niets, en daarna alles in één keer.",
    tekening: <TekeningPauze />,
  },
  { waarde: "termijnen", titel: "Termijnen", uitleg: "Je betaalt elke maand een deel.", tekening: <TekeningTermijnen /> },
  {
    waarde: "pauze_en_termijnen",
    titel: "Eerst een pauze, dan termijnen",
    uitleg: "Je betaalt eerst even niets, en daarna elke maand een deel.",
    tekening: <TekeningBeide />,
  },
]

// Je voorstel kiezen, in een paar schermen (?deel=). De uitkomst rekenen we direct uit.
export function KiesVoorstel({
  zaakId,
  bedragCenten,
  startdatum,
  begin,
}: {
  zaakId: string
  bedragCenten: number
  startdatum: string
  begin?: VoorstelKeuze
}) {
  const [soort, setSoort] = useState<Soort | undefined>(begin?.soort)
  const [pauzeMaanden, setPauzeMaanden] = useState(begin?.pauzeMaanden ?? 1)
  const [aantalTermijnen, setAantalTermijnen] = useState(begin?.aantalTermijnen ?? 3)
  const [fout, setFout] = useState<string>()
  const [bezig, startBezig] = useTransition()
  const router = useRouter()
  const zoekParams = useSearchParams()

  const metPauze = soort === "pauze" || soort === "pauze_en_termijnen"
  const metTermijnen = soort === "termijnen" || soort === "pauze_en_termijnen"
  const maxTermijnen = Math.min(MAX_TERMIJNEN, bedragCenten)

  const plan = soort
    ? rekenPlan({
        soort,
        bedragCenten,
        startdatum,
        pauzeMaanden: metPauze ? pauzeMaanden : undefined,
        aantalTermijnen: metTermijnen ? aantalTermijnen : undefined,
      })
    : null

  function verstuur() {
    if (!soort) return
    setFout(undefined)
    startBezig(async () => {
      const uitkomst = await bewaarVoorstel(zaakId, {
        soort,
        pauzeMaanden: metPauze ? pauzeMaanden : undefined,
        aantalTermijnen: metTermijnen ? aantalTermijnen : undefined,
      })
      if (uitkomst) setFout(uitkomst.melding)
    })
  }

  // Het voorstel in schermen: eerst de soort, dan (als het nodig is) de pauze en de termijnen.
  // Het laatste scherm toont je voorstel en bewaart het.
  const schermen: Deel[] = ["voorstel-soort", ...(metPauze ? ["voorstel-pauze" as const] : []), ...(metTermijnen ? ["voorstel-termijnen" as const] : [])]
  const gevraagd = zoekParams.get("deel") as Deel | null
  // Zonder gekozen soort (bijvoorbeeld na herladen) begin je weer bij de soort.
  const deel = gevraagd && schermen.includes(gevraagd) ? gevraagd : "voorstel-soort"
  const plek = schermen.indexOf(deel)
  const laatste = soort !== undefined && plek === schermen.length - 1
  const adres = (d: Deel) => `/aanvragen/${zaakId}/voorstel?deel=${d}`

  function verder(e: React.FormEvent) {
    e.preventDefault()
    if (!soort) {
      setFout("Kies wat je wilt voorstellen.")
      document.getElementById("soort-pauze")?.focus()
      return
    }
    if (laatste) verstuur()
    else router.push(adres(schermen[plek + 1]))
  }

  return (
    <form key={deel} onSubmit={verder} className="flex flex-col gap-8" noValidate>
      {deel === "voorstel-soort" && (
        <Stap
          titel="Wat wil je voorstellen?"
          uitleg={`Je moet ${euro(bedragCenten)} betalen. Kies wat voor jou haalbaar is.`}
          terug={null}
          breed={
            <fieldset className="grid gap-3 md:grid-cols-3" aria-describedby={fout ? "soort-fout" : undefined}>
              <legend className="sr-only">Soort voorstel</legend>
              {SOORTEN.map((s) => (
                <Keuzetegel
                  key={s.waarde}
                  id={`soort-${s.waarde === "pauze_en_termijnen" ? "beide" : s.waarde}`}
                  name="soort"
                  value={s.waarde}
                  checked={soort === s.waarde}
                  onChange={() => {
                    setSoort(s.waarde)
                    setFout(undefined)
                  }}
                  titel={s.titel}
                  uitleg={s.uitleg}
                  tekening={s.tekening}
                />
              ))}
              {fout && (
                <Foutmelding id="soort-fout" role="alert" className="md:col-span-3">
                  {fout}
                </Foutmelding>
              )}
            </fieldset>
          }
        >
          <StapKnoppen>
            <Button type="submit" variant="primair" size="groot">
              Verder
            </Button>
          </StapKnoppen>
        </Stap>
      )}

      {deel === "voorstel-pauze" && (
        <Stap titel="Hoe lang wil je pauzeren?" uitleg="In die tijd betaal je niets." terug={adres(schermen[plek - 1])}>
          <Veldengroep>
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Hoe lang wil je pauzeren?</legend>
              <div className="flex gap-2">
                {Array.from({ length: MAX_PAUZE_MAANDEN }, (_, i) => i + 1).map((m) => (
                  <Keuzeknop
                    key={m}
                    name="pauze"
                    value={m}
                    checked={pauzeMaanden === m}
                    onChange={() => setPauzeMaanden(m)}
                  >
                    {m === 1 ? "1 maand" : `${m} maanden`}
                  </Keuzeknop>
                ))}
              </div>
            </fieldset>
            {laatste && plan && <Overzicht plan={plan} />}
          </Veldengroep>
          <Knop laatste={laatste} bezig={bezig} fout={fout} />
        </Stap>
      )}

      {deel === "voorstel-termijnen" && (
        <Stap titel="In hoeveel termijnen wil je betalen?" uitleg="Je betaalt elke maand een deel." terug={adres(schermen[plek - 1])}>
          <Veldengroep>
            <div className="flex flex-col gap-2">
              <Label htmlFor="termijnen">Aantal termijnen</Label>
              <NativeSelect
                id="termijnen"
                value={aantalTermijnen}
                onChange={(e) => setAantalTermijnen(Number(e.target.value))}
              >
                {Array.from({ length: maxTermijnen - MIN_TERMIJNEN + 1 }, (_, i) => i + MIN_TERMIJNEN).map((n) => (
                  <option key={n} value={n}>
                    {n} termijnen
                  </option>
                ))}
              </NativeSelect>
            </div>
            {plan && <Overzicht plan={plan} />}
          </Veldengroep>
          <Knop laatste bezig={bezig} fout={fout} />
        </Stap>
      )}
    </form>
  )
}

type Deel = "voorstel-soort" | "voorstel-pauze" | "voorstel-termijnen"

// Onderaan: "Verder", of op het laatste scherm "Bekijk je brief" (dan bewaren we het voorstel).
function Knop({ laatste, bezig, fout }: { laatste: boolean; bezig: boolean; fout?: string }) {
  return (
    <>
      {fout && <Foutmelding role="alert">{fout}</Foutmelding>}
      <StapKnoppen>
        <Button type="submit" variant="primair" size="groot" disabled={bezig}>
          {!laatste ? "Verder" : bezig ? "Bezig met opslaan..." : "Bekijk je brief"}
        </Button>
      </StapKnoppen>
    </>
  )
}

// Je voorstel in het kort, met alle betaaldata. Verandert mee als je iets anders kiest.
function Overzicht({ plan }: { plan: ReturnType<typeof rekenPlan> }) {
  return (
    <Kaart breed={false} aria-live="polite">
      <h2 className="text-h3 text-ink">Zo ziet je voorstel eruit</h2>
      <Samenvatting plan={plan} />
      <ul className="flex flex-col gap-1 border-t border-line pt-4">
        {plan.termijnen.map((t) => (
          <li key={t.volgnummer} className="tabular flex justify-between gap-4 text-sm text-ink">
            <span>{datumLang(t.vervaldatum)}</span>
            <span>{euro(t.bedragCenten)}</span>
          </li>
        ))}
      </ul>
    </Kaart>
  )
}

function Samenvatting({ plan }: { plan: ReturnType<typeof rekenPlan> }) {
  const aantal = plan.termijnen.length
  const eerste = plan.termijnen[0]
  const laatste = plan.termijnen[aantal - 1]

  if (plan.soort === "pauze") {
    return (
      <p className="text-base text-ink">
        Tot {datumLang(plan.einddatum)} betaal je niets. Op die dag betaal je{" "}
        <span className="tabular font-medium">{euro(plan.totaalCenten)}</span>.
      </p>
    )
  }

  const zelfde = eerste.bedragCenten === laatste.bedragCenten
  return (
    <p className="text-base text-ink">
      {plan.soort === "pauze_en_termijnen" && <>Tot {datumLang(plan.pauzeTot!)} betaal je niets. </>}
      Je betaalt {aantal} termijnen van <span className="tabular font-medium">{euro(eerste.bedragCenten)}</span>
      {!zelfde && (
        <>
          {" "}
          (de laatste is <span className="tabular font-medium">{euro(laatste.bedragCenten)}</span>)
        </>
      )}
      . Op {datumLang(plan.einddatum)} heb je alles betaald.
    </p>
  )
}
