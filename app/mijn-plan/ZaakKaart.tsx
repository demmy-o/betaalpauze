import Link from "next/link"
import { datumLang, euro, vandaag } from "@/lib/betaalplan"
import type { TermijnStatus, ZaakOverzicht, ZaakStatus } from "@/lib/mijnPlan"
import { ReactieKiezen } from "./ReactieKiezen"
import { BetaaldKnop } from "./BetaaldKnop"

// Status altijd als tekst, met een zachte kleur erachter. Nooit alleen een kleur (docs/design.md).
const ZAAK_STATUS: Record<ZaakStatus, { tekst: string; stijl: string }> = {
  concept: { tekst: "Nog niet verstuurd", stijl: "bg-line text-ink" },
  verstuurd: { tekst: "Wacht op reactie", stijl: "bg-sky-soft text-ink" },
  akkoord: { tekst: "Akkoord", stijl: "bg-success-tint text-success" },
  afgewezen: { tekst: "Niet akkoord", stijl: "bg-warning-tint text-warning" },
  afgerond: { tekst: "Afgerond", stijl: "bg-success-tint text-success" },
}

function termijnTekst(status: TermijnStatus, vervaldatum: string) {
  if (status === "betaald") return "Betaald"
  if (status === "niet_betaald") return "Niet betaald"
  return vervaldatum < vandaag() ? "Nog niet gemeld" : "Nog te betalen"
}

export function ZaakKaart({ zaak }: { zaak: ZaakOverzicht }) {
  const status = ZAAK_STATUS[zaak.status]
  const kanBetalen = zaak.status === "verstuurd" || zaak.status === "akkoord"

  return (
    <article className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-col gap-2">
        <span className={`self-start rounded-sm px-2 py-1 text-caption font-medium ${status.stijl}`}>
          {status.tekst}
        </span>
        <h2 className="text-h3 text-ink">{zaak.schuldeiser}</h2>
        <p className="text-sm text-muted-foreground">
          Factuur {zaak.factuurnummer} · <span className="tabular">{euro(zaak.bedragCenten)}</span>
          {zaak.verstuurdOp && <> · verstuurd op {datumLang(zaak.verstuurdOp.slice(0, 10))}</>}
        </p>
      </div>

      {zaak.status === "concept" && (
        <Link
          href={zaak.termijnen.length ? `/aanvragen/${zaak.id}/brief` : `/aanvragen/${zaak.id}/voorstel`}
          className="flex h-12 items-center justify-center rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft sm:self-start"
        >
          Verder met je voorstel
        </Link>
      )}

      {zaak.termijnen.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-ink">Je betaalschema</h3>
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {zaak.termijnen.map((t) => (
              <li key={t.volgnummer} className="tabular flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="flex flex-col">
                  <span className="whitespace-nowrap text-ink">{datumLang(t.vervaldatum)}</span>
                  <span className="text-muted-foreground">{termijnTekst(t.status, t.vervaldatum)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-ink">{euro(t.bedragCenten)}</span>
                  {t.status !== "betaald" && kanBetalen && <BetaaldKnop termijnId={t.id} />}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {zaak.status !== "concept" && <ReactieKiezen zaakId={zaak.id} schuldeiser={zaak.schuldeiser} status={zaak.status} />}

      {zaak.brief && (
        <details className="group rounded-md border border-line">
          <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm font-medium text-ink">
            Bekijk de verstuurde brief
          </summary>
          <div className="whitespace-pre-line border-t border-line px-3 py-3 text-sm leading-relaxed text-ink">
            {zaak.brief.tekst}
          </div>
        </details>
      )}
    </article>
  )
}
