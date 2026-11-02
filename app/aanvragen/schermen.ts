import { adresCompleet } from "@/lib/regeling"
import type { Antwoorden } from "./opslag"

// Alle schermen van de aanvraag, op volgorde. Eén vraag per scherm.
// Het adres is /aanvragen?stap=<naam>. Na "email" wordt de zaak bewaard en gaat het verder op
// /aanvragen/[zaakId]/voorstel en /brief (die schermen staan hier ook, voor de voortgangsbalk).
export const SCHERMEN = [
  "klopt", //            Klopt de factuur?
  "bedrijf", //          Bij welk bedrijf moet je betalen?
  "bedrijf-email", //    Wat is het e-mailadres van het bedrijf? (alleen als we het niet weten)
  "bedrijf-adres", //    Wat is het postadres van het bedrijf? (alleen als het nodig is)
  "factuurnummer", //    Wat is het factuurnummer?
  "factuurdatum", //     Wat is de datum van de factuur?
  "bedrag", //           Hoeveel moet je betalen?
  "naam", //             Wat is je naam?
  "adres", //            Wat is je adres?
  "email", //            Je e-mailadres (en de code)
  "voorstel-soort", //   Wat wil je voorstellen?
  "voorstel-pauze", //   Hoe lang wil je pauzeren?
  "voorstel-termijnen", // In hoeveel termijnen?
  "toelichting", //      Wil je nog iets toelichten?
  "brief", //            Lees je brief
] as const

export type Scherm = (typeof SCHERMEN)[number]

// Het formulier: de schermen op /aanvragen, tot de zaak bewaard is.
export type FormulierScherm = Exclude<Scherm, "voorstel-soort" | "voorstel-pauze" | "voorstel-termijnen" | "toelichting" | "brief">

// "klopt" telt niet mee: dan ben je nog niet begonnen.
export const AANTAL_STAPPEN = SCHERMEN.length - 1

// Hoe ver je bent, voor de voortgangsbalk. Overgeslagen schermen tellen gewoon mee.
export function stapNummer(scherm: Scherm) {
  return SCHERMEN.indexOf(scherm)
}

// Is dit scherm nodig, met de antwoorden tot nu toe?
function nodig(scherm: FormulierScherm, a: Antwoorden) {
  const s = a.schuldeiser
  if (scherm === "bedrijf-email") {
    // Niet als we het adres al weten, en niet als het bedrijf een eigen omgeving heeft (dan per post).
    const eigenOmgeving = ["portaal", "formulier", "telefoon"].includes(s?.regelingVia ?? "")
    return s?.emailBekend !== "ja" && !eigenOmgeving
  }
  if (scherm === "bedrijf-adres") {
    return s?.route === "post" && (s.postAdresAnders === "ja" || !adresCompleet(s))
  }
  return true
}

// Is dit scherm ingevuld?
function klaar(scherm: FormulierScherm, a: Antwoorden) {
  const s = a.schuldeiser
  switch (scherm) {
    case "klopt":
      return Boolean(a.factuurKlopt)
    case "bedrijf":
      return Boolean(s?.schuldeiserId || s?.kvkNummer)
    case "bedrijf-email":
      return s?.route === "post" || (s?.route === "email" && Boolean(s.email))
    case "bedrijf-adres":
      return Boolean(s?.postStraat && s.postPostcode && s.postPlaats)
    case "factuurnummer":
      return Boolean(a.factuur?.factuurnummer)
    case "factuurdatum":
      return Boolean(a.factuur?.factuurdatum)
    case "bedrag":
      return Boolean(a.factuur?.bedrag)
    case "naam":
      return Boolean(a.gegevens?.voornaam && a.gegevens.achternaam)
    case "adres":
      return Boolean(a.gegevens?.straat && a.gegevens.postcode && a.gegevens.plaats)
    case "email":
      return false
  }
}

// De schermen van het formulier die voor deze antwoorden nodig zijn.
export function formulierSchermen(a: Antwoorden): FormulierScherm[] {
  const formulier = SCHERMEN.slice(0, SCHERMEN.indexOf("email") + 1) as FormulierScherm[]
  return formulier.filter((scherm) => nodig(scherm, a))
}

// Het verste scherm waar je mag zijn: je kunt geen vraag overslaan.
export function verstToegestaan(a: Antwoorden): FormulierScherm {
  const lijst = formulierSchermen(a)
  return lijst.find((scherm) => !klaar(scherm, a)) ?? "email"
}

// Het scherm na of voor dit scherm. Werkt ook als dit scherm zelf niet meer nodig is,
// bijvoorbeeld na "Toch het bekende adres gebruiken".
export function volgende(scherm: FormulierScherm, a: Antwoorden) {
  const plek = SCHERMEN.indexOf(scherm)
  return formulierSchermen(a).find((s) => SCHERMEN.indexOf(s) > plek) ?? "email"
}

export function vorige(scherm: FormulierScherm, a: Antwoorden) {
  const plek = SCHERMEN.indexOf(scherm)
  return formulierSchermen(a).findLast((s) => SCHERMEN.indexOf(s) < plek)
}
