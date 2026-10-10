// Zoeken bij de KVK. Alleen de Zoeken API, die is gratis.
// Zolang KVK_API_KEY leeg is, gebruiken we de openbare testomgeving van de KVK
// (met nepbedrijven zoals "Test BV Donald").

const TEST_URL = "https://api.kvk.nl/test/api/v2/zoeken"
const TEST_SLEUTEL = "l7xx1f2691f2520d487b902f4e0b57a0b197" // openbaar, staat in de KVK-documentatie
const LIVE_URL = "https://api.kvk.nl/api/v2/zoeken"

export type Bedrijf = {
  kvkNummer: string
  naam: string
  straat?: string
  plaats?: string
}

type KvkResultaat = {
  kvkNummer: string
  naam: string
  type: "hoofdvestiging" | "nevenvestiging" | "rechtspersoon"
  adres?: { binnenlandsAdres?: { straatnaam?: string; plaats?: string } }
}

// Zoektermen die we al eens hebben opgevraagd. Scheelt bevragingen.
const cache = new Map<string, { tijd: number; bedrijven: Bedrijf[] }>()
const EEN_UUR = 60 * 60 * 1000

export async function zoekBedrijven(term: string): Promise<Bedrijf[]> {
  const sleutel = term.trim().toLowerCase()
  const bewaard = cache.get(sleutel)
  if (bewaard && Date.now() - bewaard.tijd < EEN_UUR) return bewaard.bedrijven

  const apiKey = process.env.KVK_API_KEY || TEST_SLEUTEL
  const basis = process.env.KVK_API_KEY ? LIVE_URL : TEST_URL
  const url = `${basis}?naam=${encodeURIComponent(term.trim())}&resultatenPerPagina=20`

  const antwoord = await fetch(url, { headers: { apikey: apiKey }, cache: "no-store" })

  // De KVK geeft 404 als er niets gevonden is.
  if (antwoord.status === 404) {
    cache.set(sleutel, { tijd: Date.now(), bedrijven: [] })
    return []
  }
  if (!antwoord.ok) throw new Error(`KVK gaf status ${antwoord.status}`)

  const data: { resultaten?: KvkResultaat[] } = await antwoord.json()
  const bedrijven = alleenHoofdvestigingen(data.resultaten ?? [])
  cache.set(sleutel, { tijd: Date.now(), bedrijven })
  return bedrijven
}

// Alleen hoofdvestigingen en rechtspersonen. Eén regel per KVK-nummer,
// en de hoofdvestiging gaat voor omdat die een adres heeft.
function alleenHoofdvestigingen(resultaten: KvkResultaat[]): Bedrijf[] {
  const perNummer = new Map<string, Bedrijf & { hoofd: boolean }>()

  for (const r of resultaten) {
    if (r.type === "nevenvestiging") continue
    const hoofd = r.type === "hoofdvestiging"
    const bestaand = perNummer.get(r.kvkNummer)
    if (bestaand && bestaand.hoofd) continue

    const adres = r.adres?.binnenlandsAdres
    perNummer.set(r.kvkNummer, {
      kvkNummer: r.kvkNummer,
      naam: r.naam,
      straat: adres?.straatnaam,
      plaats: adres?.plaats,
      hoofd,
    })
  }

  return [...perNummer.values()].map(({ kvkNummer, naam, straat, plaats }) => ({ kvkNummer, naam, straat, plaats }))
}
