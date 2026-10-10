// De brief aan de schuldeiser. Eén vaste tekst met invulvelden (docs/mvp-v1.md, hoofdstuk 8).
// Geen AI: elke brief is voorspelbaar. Het voorbeeld op het scherm en de PDF gebruiken
// allebei deze functie, zodat ze altijd hetzelfde zeggen.

import { datumLang, euro, plusDagen, type Plan } from "./betaalplan"

export type BriefGegevens = {
  afzender: { voornaam: string; achternaam: string; straat: string; postcode: string; plaats: string; email: string }
  schuldeiser: { naam: string; straat?: string; postcode?: string; plaats?: string }
  factuur: { factuurnummer: string; factuurdatum: string; bedragCenten: number; klantnummer?: string }
  plan: Plan
  datum: string // verzenddatum, "JJJJ-MM-DD"
  toelichting?: string // eigen woorden van de gebruiker, mag leeg
}

// Een alinea is gewone tekst, of een lijstje (de termijnen).
export type Blok = { tekst: string } | { lijst: string[] }

export type Brief = {
  afzender: string[]
  ontvanger: string[]
  plaatsEnDatum: string
  onderwerp: string
  aanhef: string
  blokken: Blok[]
  groet: string
  naam: string
  voetnoot: string
}

export const REACTIE_DAGEN = 14
export const MAX_TOELICHTING = 500

export function maakBrief(g: BriefGegevens): Brief {
  const naam = `${g.afzender.voornaam} ${g.afzender.achternaam}`
  const { plan, factuur } = g
  const reactieVoor = datumLang(plusDagen(g.datum, REACTIE_DAGEN))
  const eersteBetaling = datumLang(plan.termijnen[0].vervaldatum)

  const blokken: Blok[] = [
    {
      tekst:
        `Op ${datumLang(factuur.factuurdatum)} heeft u mij factuur ${factuur.factuurnummer} gestuurd ` +
        `voor een bedrag van ${euro(factuur.bedragCenten)}.` +
        (factuur.klantnummer ? ` Mijn klantnummer is ${factuur.klantnummer}.` : ""),
    },
    {
      tekst:
        "Op dit moment kan ik dit bedrag niet in één keer betalen. Ik wil het wel helemaal betalen. " +
        "Daarom doe ik u het volgende voorstel.",
    },
    ...voorstel(plan),
    {
      tekst: "Ik betaal via mijn eigen bank, op het rekeningnummer en met het kenmerk dat op de factuur staat.",
    },
    {
      tekst:
        "Ik vraag u om tijdens deze regeling geen extra kosten in rekening te brengen en geen incassobureau " +
        "in te schakelen. Zolang ik mij aan deze afspraken houd, is dat niet nodig.",
    },
  ]

  const toelichting = g.toelichting?.trim()
  if (toelichting) {
    blokken.push({ tekst: `Graag licht ik mijn situatie kort toe: ${toelichting}` })
  }

  blokken.push({
    tekst:
      "Dit is een voorstel. Het is pas een afspraak als u ermee akkoord gaat. " +
      `Wilt u mij uiterlijk ${reactieVoor} per e-mail laten weten of u akkoord gaat? ` +
      `Hoor ik niets, dan begin ik op ${eersteBetaling} toch met betalen volgens dit voorstel. ` +
      `U kunt antwoorden op deze e-mail. Uw antwoord komt dan direct bij mij, op ${g.afzender.email}.`,
  })

  return {
    afzender: [naam, g.afzender.straat, `${g.afzender.postcode} ${g.afzender.plaats}`, g.afzender.email],
    ontvanger: [
      g.schuldeiser.naam,
      "T.a.v. de debiteurenadministratie",
      ...(g.schuldeiser.straat ? [g.schuldeiser.straat] : []),
      ...(g.schuldeiser.postcode || g.schuldeiser.plaats
        ? [[g.schuldeiser.postcode, g.schuldeiser.plaats].filter(Boolean).join(" ")]
        : []),
    ],
    plaatsEnDatum: `${g.afzender.plaats}, ${datumLang(g.datum)}`,
    onderwerp:
      `Betalingsvoorstel voor factuur ${factuur.factuurnummer}` +
      (factuur.klantnummer ? `, klantnummer ${factuur.klantnummer}` : ""),
    aanhef: "Geachte heer, mevrouw,",
    blokken,
    groet: "Met vriendelijke groet,",
    naam,
    voetnoot:
      `Deze brief is opgesteld met Betaalpauze.nl en verstuurd namens ${naam}. ` +
      "Betaalpauze.nl int geen geld en is geen partij in deze afspraak.",
  }
}

// Het voorstel zelf, met exacte bedragen en data.
function voorstel(plan: Plan): Blok[] {
  const totaal = euro(plan.totaalCenten)
  const lijst = plan.termijnen.map((t) => `${datumLang(t.vervaldatum)}: ${euro(t.bedragCenten)}`)
  const aantal = plan.termijnen.length

  const pauze = plan.pauzeMaanden === 1 ? "1 maand" : `${plan.pauzeMaanden} maanden`

  if (plan.soort === "pauze") {
    return [
      {
        tekst:
          `Ik vraag u om een betaalpauze van ${pauze}. ` +
          `Op ${datumLang(plan.einddatum)} betaal ik het volledige bedrag van ${totaal} in één keer.`,
      },
    ]
  }

  const inleiding =
    plan.soort === "pauze_en_termijnen"
      ? `De komende ${pauze} betaal ik niets. Vanaf ${datumLang(plan.pauzeTot!)} betaal ik het bedrag van ${totaal} in ${aantal} maandelijkse termijnen:`
      : `Ik betaal het bedrag van ${totaal} in ${aantal} maandelijkse termijnen:`

  return [
    { tekst: inleiding },
    { lijst },
    { tekst: `Op ${datumLang(plan.einddatum)} heb ik het volledige bedrag van ${totaal} betaald.` },
  ]
}

// De brief als platte tekst, voor de e-mail en om te lezen.
export function briefAlsTekst(b: Brief): string {
  const blokken = b.blokken.map((blok) => ("tekst" in blok ? blok.tekst : blok.lijst.map((r) => `- ${r}`).join("\n")))
  return [
    b.afzender.join("\n"),
    b.ontvanger.join("\n"),
    b.plaatsEnDatum,
    `Onderwerp: ${b.onderwerp}`,
    b.aanhef,
    ...blokken,
    `${b.groet}\n\n${b.naam}`,
    "---",
    b.voetnoot,
  ].join("\n\n")
}
