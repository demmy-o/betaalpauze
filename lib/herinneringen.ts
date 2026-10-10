import { plusDagen } from "./betaalplan"

// Alle herinneringen na het versturen (docs/mvp-v1.md, hoofdstuk 5).
// Een stap toevoegen, een dag verschuiven of een andere tekst kiezen is hier één regel aanpassen.
//
// anker:  waar we vanaf tellen
//   - "verstuurd":       de dag dat de brief is verstuurd
//   - "termijn":         elke betaaldatum (de stap komt dus per termijn één keer)
//   - "laatste_termijn": alleen de laatste betaaldatum
// dagen:  hoeveel dagen ervoor (min) of erna (plus)
// alleenBij: optioneel, stuur alleen als de zaak deze status heeft
//
// Algemene regel (zie lib/wekker.ts): we sturen alleen herinneringen bij zaken die op
// "verstuurd" (wacht op reactie) of "akkoord" staan. Nooit bij concept, niet akkoord of afgerond.

export type Anker = "verstuurd" | "termijn" | "laatste_termijn"
export type Template = "al-reactie" | "termijn-komt-eraan" | "vandaag-betalen" | "heb-je-betaald" | "klaar"

export type Stap = {
  stap: string
  anker: Anker
  dagen: number
  kanaal: "email"
  template: Template
  alleenBij?: ("verstuurd" | "akkoord")[]
}

export const HERINNERINGEN: Stap[] = [
  { stap: "reactie_check",      anker: "verstuurd",       dagen: 14, kanaal: "email", template: "al-reactie", alleenBij: ["verstuurd"] },
  { stap: "herinnering_vooraf", anker: "termijn",         dagen: -3, kanaal: "email", template: "termijn-komt-eraan" },
  { stap: "herinnering_dag",    anker: "termijn",         dagen: 0,  kanaal: "email", template: "vandaag-betalen" },
  { stap: "checkin",            anker: "termijn",         dagen: 2,  kanaal: "email", template: "heb-je-betaald" },
  { stap: "afsluiting",         anker: "laatste_termijn", dagen: 3,  kanaal: "email", template: "klaar" }, // na de laatste check (+2)
]

// Bij deze zaakstatussen mogen herinneringen weg.
export const STATUS_MET_HERINNERINGEN = ["verstuurd", "akkoord"] as const

// Rekent uit welke berichten er wanneer gepland moeten worden. Datums als "JJJJ-MM-DD".
// Berichten die vóór de verzenddag zouden vallen, slaan we over.
export type GeplandBericht = {
  stap: string
  template: Template
  kanaal: "email"
  gepland_op: string
  termijn_id: string | null
}

export function berekenBerichten(
  verstuurdOp: string,
  termijnen: { id: string; volgnummer: number; vervaldatum: string }[],
  stappen: Stap[] = HERINNERINGEN
): GeplandBericht[] {
  const gesorteerd = [...termijnen].sort((a, b) => a.volgnummer - b.volgnummer)
  const laatste = gesorteerd[gesorteerd.length - 1]
  const berichten: GeplandBericht[] = []

  for (const s of stappen) {
    const ankers =
      s.anker === "verstuurd"
        ? [{ datum: verstuurdOp, termijnId: null }]
        : s.anker === "termijn"
          ? gesorteerd.map((t) => ({ datum: t.vervaldatum, termijnId: t.id }))
          : laatste
            ? [{ datum: laatste.vervaldatum, termijnId: laatste.id }]
            : []

    for (const a of ankers) {
      const gepland_op = plusDagen(a.datum, s.dagen)
      if (gepland_op < verstuurdOp) continue
      berichten.push({ stap: s.stap, template: s.template, kanaal: s.kanaal, gepland_op, termijn_id: a.termijnId })
    }
  }

  return berichten.sort((a, b) => a.gepland_op.localeCompare(b.gepland_op))
}
