// De teksten van de herinneringsmails. Je-vorm, kort, warm zonder opgewektheid (docs/design.md).
// Bedragen en datums altijd precies.

import { datumLang, euro } from "./betaalplan"
import type { Template } from "./herinneringen"

export type HerinneringGegevens = {
  voornaam: string
  schuldeiser: string
  factuurnummer: string
  eersteBetaling: string // "JJJJ-MM-DD"
  termijn?: { volgnummer: number; aantal: number; vervaldatum: string; bedragCenten: number }
  mijnPlanUrl: string
}

export type HerinneringTekst = {
  onderwerp: string
  alineas: string[]
  knop: { tekst: string; url: string }
}

export function herinneringTekst(template: Template, g: HerinneringGegevens): HerinneringTekst {
  const knop = { tekst: "Naar Mijn plan", url: g.mijnPlanUrl }
  const groet = `Hoi ${g.voornaam},`
  const t = g.termijn
  const welke = t && t.aantal > 1 ? ` Dat is betaling ${t.volgnummer} van ${t.aantal}.` : ""

  switch (template) {
    case "al-reactie":
      return {
        onderwerp: `Heeft ${g.schuldeiser} al gereageerd?`,
        alineas: [
          groet,
          `Twee weken geleden stuurde je je betaalvoorstel naar ${g.schuldeiser}. Heb je al antwoord gekregen? Laat het ons weten op Mijn plan.`,
          `Nog niets gehoord? Dat gebeurt vaak. Zoals in je brief staat, begin je op ${datumLang(g.eersteBetaling)} gewoon met betalen.`,
        ],
        knop,
      }

    case "termijn-komt-eraan":
      return {
        onderwerp: `Over 3 dagen: ${euro(t!.bedragCenten)} aan ${g.schuldeiser}`,
        alineas: [
          groet,
          `Op ${datumLang(t!.vervaldatum)} betaal je ${euro(t!.bedragCenten)} aan ${g.schuldeiser}.${welke}`,
          "Zorg dat het geld die dag op je rekening staat. Wij sturen je op de dag zelf nog een mail.",
        ],
        knop,
      }

    case "vandaag-betalen":
      return {
        onderwerp: `Vandaag betalen: ${euro(t!.bedragCenten)} aan ${g.schuldeiser}`,
        alineas: [
          groet,
          `Vandaag betaal je ${euro(t!.bedragCenten)} aan ${g.schuldeiser}.${welke}`,
          `Betaal via je eigen bank. Gebruik het rekeningnummer en het kenmerk van de factuur, en zet factuurnummer ${g.factuurnummer} in de omschrijving.`,
        ],
        knop,
      }

    case "heb-je-betaald":
      return {
        onderwerp: `Is je betaling aan ${g.schuldeiser} gelukt?`,
        alineas: [
          groet,
          `Op ${datumLang(t!.vervaldatum)} moest je ${euro(t!.bedragCenten)} betalen aan ${g.schuldeiser}. Is dat gelukt? Laat het ons weten op Mijn plan.`,
          "Lukte het niet? Dat kan gebeuren. Laat het ons weten, dan kijken we samen wat wel kan.",
        ],
        knop,
      }

    case "klaar":
      return {
        onderwerp: `Je laatste betaling aan ${g.schuldeiser}`,
        alineas: [
          groet,
          `Je laatste betaling aan ${g.schuldeiser} is net geweest. Als alles gelukt is, heb je je afspraak helemaal nagekomen.`,
          "Laat ons op Mijn plan weten of het gelukt is. Daarna sluiten we je plan af.",
        ],
        knop,
      }
  }
}
