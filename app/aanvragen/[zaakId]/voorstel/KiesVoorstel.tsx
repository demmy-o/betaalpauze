"use client"

import { useState, useTransition } from "react"
import {
  MAX_PAUZE_MAANDEN,
  MAX_TERMIJNEN,
  MIN_TERMIJNEN,
  datumLang,
  euro,
  rekenPlan,
  type Soort,
} from "@/lib/betaalplan"
import { StapKop, VerderKnop } from "../../onderdelen"
import { bewaarVoorstel, type VoorstelKeuze } from "./actions"

const SOORTEN: { waarde: Soort; titel: string; uitleg: string }[] = [
  { waarde: "pauze", titel: "Een pauze", uitleg: "Je betaalt even niets, en daarna alles in één keer." },
  { waarde: "termijnen", titel: "Termijnen", uitleg: "Je betaalt elke maand een deel." },
  {
    waarde: "pauze_en_termijnen",
    titel: "Eerst een pauze, dan termijnen",
    uitleg: "Je betaalt eerst even niets, en daarna elke maand een deel.",
  },
]

// Scherm 5: kies je voorstel. De uitkomst rekenen we direct uit.
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

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    if (!soort) {
      setFout("Kies wat je wilt voorstellen.")
      document.getElementById("soort-pauze")?.focus()
      return
    }
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

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-8" noValidate>
      <StapKop
        stap={5}
        titel="Wat wil je voorstellen?"
        uitleg={`Je moet ${euro(bedragCenten)} betalen. Kies wat voor jou haalbaar is.`}
        terug={null}
      />

      <fieldset className="flex flex-col gap-3" aria-describedby={fout ? "soort-fout" : undefined}>
        <legend className="sr-only">Soort voorstel</legend>
        {SOORTEN.map((s) => (
          <label
            key={s.waarde}
            className="flex min-h-11 cursor-pointer gap-4 rounded-lg border border-line bg-surface p-4 transition-colors duration-[120ms] has-[:checked]:border-ink has-[:checked]:bg-lilac-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet"
          >
            <input
              id={`soort-${s.waarde === "pauze_en_termijnen" ? "beide" : s.waarde}`}
              type="radio"
              name="soort"
              value={s.waarde}
              checked={soort === s.waarde}
              onChange={() => {
                setSoort(s.waarde)
                setFout(undefined)
              }}
              className="mt-1 size-5 accent-[var(--color-ink)]"
            />
            <span className="flex flex-col gap-1">
              <span className="font-medium text-ink">{s.titel}</span>
              <span className="text-sm text-muted-foreground">{s.uitleg}</span>
            </span>
          </label>
        ))}
        {fout && (
          <p id="soort-fout" role="alert" className="text-sm text-error">
            {fout}
          </p>
        )}
      </fieldset>

      {metPauze && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-medium text-ink">Hoe lang wil je pauzeren?</legend>
          <div className="flex gap-2">
            {Array.from({ length: MAX_PAUZE_MAANDEN }, (_, i) => i + 1).map((m) => (
              <label
                key={m}
                className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-base text-ink transition-colors duration-[120ms] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet"
              >
                <input
                  type="radio"
                  name="pauze"
                  value={m}
                  checked={pauzeMaanden === m}
                  onChange={() => setPauzeMaanden(m)}
                  className="sr-only"
                />
                {m === 1 ? "1 maand" : `${m} maanden`}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {metTermijnen && (
        <div className="flex flex-col gap-2">
          <label htmlFor="termijnen" className="text-sm font-medium text-ink">
            In hoeveel termijnen?
          </label>
          <p id="termijnen-hulp" className="text-sm text-muted-foreground">
            Eén termijn per maand. Minimaal {MIN_TERMIJNEN}, maximaal {MAX_TERMIJNEN}.
          </p>
          <select
            id="termijnen"
            value={aantalTermijnen}
            onChange={(e) => setAantalTermijnen(Number(e.target.value))}
            aria-describedby="termijnen-hulp"
            className="h-12 rounded-md border border-line-strong bg-surface px-4 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            {Array.from({ length: maxTermijnen - MIN_TERMIJNEN + 1 }, (_, i) => i + MIN_TERMIJNEN).map((n) => (
              <option key={n} value={n}>
                {n} termijnen
              </option>
            ))}
          </select>
        </div>
      )}

      {plan && (
        <section aria-live="polite" className="flex flex-col gap-4 rounded-lg bg-sky-soft p-5">
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
        </section>
      )}

      <VerderKnop bezig={bezig}>{bezig ? "Bezig met opslaan..." : "Bekijk je brief"}</VerderKnop>
    </form>
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
