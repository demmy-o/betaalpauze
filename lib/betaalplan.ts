// De rekenregels van een betaalvoorstel.
// Alles in centen, zodat er nooit afrondingsfouten ontstaan.
// Datums als tekst "JJJJ-MM-DD", zonder tijdzone.

export const MAX_PAUZE_MAANDEN = 3
export const MIN_TERMIJNEN = 2
export const MAX_TERMIJNEN = 12

export type Soort = "pauze" | "termijnen" | "pauze_en_termijnen"

export type Keuze = {
  soort: Soort
  bedragCenten: number
  startdatum: string // de dag waarop de brief verstuurd wordt
  pauzeMaanden?: number // bij pauze en pauze_en_termijnen: 1 t/m 3
  aantalTermijnen?: number // bij termijnen en pauze_en_termijnen: 2 t/m 12
}

export type Termijn = {
  volgnummer: number
  vervaldatum: string
  bedragCenten: number
}

export type Plan = {
  soort: Soort
  termijnen: Termijn[]
  pauzeTot?: string // tot wanneer er niets betaald hoeft te worden
  pauzeMaanden?: number
  einddatum: string // datum van de laatste betaling
  totaalCenten: number
}

// Rekent het plan uit:
// - pauze: na de pauze betaal je alles in één keer.
// - termijnen: de eerste termijn is een maand na het versturen, daarna elke maand.
// - pauze en termijnen: de eerste termijn is direct na de pauze, daarna elke maand.
// Elke termijn is even groot, afgerond naar beneden op de cent.
// De laatste termijn vangt het afrondingsverschil op.
export function rekenPlan(keuze: Keuze): Plan {
  const fout = controleer(keuze)
  if (fout) throw new Error(fout)

  const { soort, bedragCenten, startdatum } = keuze
  const pauze = keuze.pauzeMaanden ?? 0

  if (soort === "pauze") {
    const datum = plusMaanden(startdatum, pauze)
    return {
      soort,
      termijnen: [{ volgnummer: 1, vervaldatum: datum, bedragCenten }],
      pauzeTot: datum,
      pauzeMaanden: pauze,
      einddatum: datum,
      totaalCenten: bedragCenten,
    }
  }

  const aantal = keuze.aantalTermijnen!
  const eersteNa = soort === "pauze_en_termijnen" ? pauze : 1
  const perTermijn = Math.floor(bedragCenten / aantal)

  const termijnen: Termijn[] = Array.from({ length: aantal }, (_, i) => ({
    volgnummer: i + 1,
    vervaldatum: plusMaanden(startdatum, eersteNa + i),
    bedragCenten: i === aantal - 1 ? bedragCenten - perTermijn * (aantal - 1) : perTermijn,
  }))

  return {
    soort,
    termijnen,
    pauzeTot: soort === "pauze_en_termijnen" ? termijnen[0].vervaldatum : undefined,
    pauzeMaanden: soort === "pauze_en_termijnen" ? pauze : undefined,
    einddatum: termijnen[aantal - 1].vervaldatum,
    totaalCenten: bedragCenten,
  }
}

// Geeft een foutmelding terug als de keuze niet mag, anders null.
export function controleer(keuze: Keuze): string | null {
  const { soort, bedragCenten, pauzeMaanden, aantalTermijnen } = keuze

  if (!Number.isInteger(bedragCenten) || bedragCenten <= 0) return "Het bedrag moet hoger zijn dan € 0."
  if (!/^\d{4}-\d{2}-\d{2}$/.test(keuze.startdatum)) return "Ongeldige startdatum."

  if (soort !== "termijnen") {
    if (!Number.isInteger(pauzeMaanden) || pauzeMaanden! < 1 || pauzeMaanden! > MAX_PAUZE_MAANDEN) {
      return `Een pauze duurt 1 tot en met ${MAX_PAUZE_MAANDEN} maanden.`
    }
  }

  if (soort !== "pauze") {
    if (!Number.isInteger(aantalTermijnen) || aantalTermijnen! < MIN_TERMIJNEN || aantalTermijnen! > MAX_TERMIJNEN) {
      return `Kies ${MIN_TERMIJNEN} tot en met ${MAX_TERMIJNEN} termijnen.`
    }
    if (bedragCenten < aantalTermijnen!) return "Het bedrag is te klein voor zoveel termijnen."
  }

  return null
}

// Telt maanden op bij een datum. Bestaat de dag niet in die maand
// (bijvoorbeeld 31 januari plus 1 maand), dan wordt het de laatste dag van de maand.
export function plusMaanden(datum: string, maanden: number): string {
  const [jaar, maand, dag] = datum.split("-").map(Number)
  const doelMaand = maand - 1 + maanden
  const doelJaar = jaar + Math.floor(doelMaand / 12)
  const maandIndex = ((doelMaand % 12) + 12) % 12
  const laatsteDag = new Date(Date.UTC(doelJaar, maandIndex + 1, 0)).getUTCDate()
  const d = Math.min(dag, laatsteDag)
  return `${doelJaar}-${String(maandIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export function plusDagen(datum: string, dagen: number): string {
  const [jaar, maand, dag] = datum.split("-").map(Number)
  return new Date(Date.UTC(jaar, maand - 1, dag + dagen)).toISOString().slice(0, 10)
}

// "€ 1.248,50"
export function euro(centen: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(centen / 100)
}

// "15 oktober 2026"
export function datumLang(datum: string): string {
  const [jaar, maand, dag] = datum.split("-").map(Number)
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(jaar, maand - 1, dag))
  )
}

// De datum van vandaag in Nederland, als "JJJJ-MM-DD".
export function vandaag(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date())
}
