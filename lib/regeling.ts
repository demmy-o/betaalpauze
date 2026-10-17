// Wat we weten over hoe een bedrijf betalingsregelingen wil ontvangen (tabel schuldeisers).
// Gedeeld door de server (zoekroutes) en de browser (stap 1).

export type RegelingVia = "email" | "portaal" | "telefoon" | "formulier"
export type Route = "email" | "post"

export type Regeling = {
  via: RegelingVia
  url?: string
  telefoon?: string
  opmerking?: string
}

// Een bedrijf zoals stap 1 het toont: uit onze eigen lijst of uit de KVK.
export type GevondenBedrijf = {
  bron: "eigen" | "kvk"
  schuldeiserId?: string // alleen bij onze eigen lijst
  kvkNummer?: string // het CJIB heeft er bijvoorbeeld geen
  naam: string
  straat?: string
  postcode?: string
  plaats?: string
  email?: string
  regeling?: Regeling
}

// "Zilveren Kruis Zorgverzekeringen N.V." wordt "Zilveren Kruis Zorgverzekeringen".
// Voor in zinnen op het scherm. In de brief gebruiken we de volledige naam.
export function korteNaam(naam: string) {
  return naam
    .replace(/^Onderlinge Waarborgmaatschappij\s+/i, "")
    .replace(/\s*\((?!CJIB).*?\)\s*/g, " ")
    .replace(/\s+(N\.V\.|B\.V\.|U\.A\.)\s*$/i, "")
    .trim()
}

// Volledig postadres? Dan kan de brief per post zonder dat de gebruiker iets hoeft in te vullen.
export function adresCompleet(a: { straat?: string; postcode?: string; plaats?: string }) {
  return Boolean(a.straat && a.postcode && a.plaats)
}
