// Koppeling met de KVK.
// - Zoeken (gratis): bedrijven vinden op naam.
// - Vestigingsprofiel (kost geld per opvraging): het volledige adres.
//   Dat vragen we alleen op als iemand een bedrijf kiest, en we bewaren het
//   in de tabel schuldeisers. Zo kost elk bedrijf maar één keer geld.
// Zolang KVK_API_KEY leeg is, gebruiken we de openbare testomgeving van de KVK
// (met nepbedrijven zoals "Test BV Donald").

const TEST_SLEUTEL = "l7xx1f2691f2520d487b902f4e0b57a0b197" // openbaar, staat in de KVK-documentatie

function kvk() {
  const live = Boolean(process.env.KVK_API_KEY)
  return {
    basis: live ? "https://api.kvk.nl/api" : "https://api.kvk.nl/test/api",
    headers: { apikey: process.env.KVK_API_KEY || TEST_SLEUTEL },
  }
}

export type Bedrijf = {
  kvkNummer: string
  vestigingsnummer?: string
  naam: string
  straat?: string
  plaats?: string
}

export type Adres = {
  straat: string
  postcode: string
  plaats: string
}

// ---------------------------------------------------------------
// Zoeken (gratis)
// ---------------------------------------------------------------

type ZoekResultaat = {
  kvkNummer: string
  vestigingsnummer?: string
  naam: string
  type: "hoofdvestiging" | "nevenvestiging" | "rechtspersoon"
  adres?: { binnenlandsAdres?: { straatnaam?: string; plaats?: string } }
}

// Zoektermen die we al eens hebben opgevraagd. Scheelt bevragingen.
const zoekCache = new Map<string, { tijd: number; bedrijven: Bedrijf[] }>()
const EEN_UUR = 60 * 60 * 1000

export async function zoekBedrijven(term: string): Promise<Bedrijf[]> {
  const sleutel = term.trim().toLowerCase()
  const bewaard = zoekCache.get(sleutel)
  if (bewaard && Date.now() - bewaard.tijd < EEN_UUR) return bewaard.bedrijven

  const { basis, headers } = kvk()
  const url = `${basis}/v2/zoeken?naam=${encodeURIComponent(term.trim())}&resultatenPerPagina=20`
  const antwoord = await fetch(url, { headers, cache: "no-store" })

  // De KVK geeft 404 als er niets gevonden is.
  if (antwoord.status === 404) {
    zoekCache.set(sleutel, { tijd: Date.now(), bedrijven: [] })
    return []
  }
  if (!antwoord.ok) throw new Error(`KVK zoeken gaf status ${antwoord.status}`)

  const data: { resultaten?: ZoekResultaat[] } = await antwoord.json()
  const bedrijven = alleenHoofdvestigingen(data.resultaten ?? [])
  zoekCache.set(sleutel, { tijd: Date.now(), bedrijven })
  return bedrijven
}

// Zoekt één bedrijf op KVK-nummer (gratis). Zo weten we zeker welke naam en
// vestiging bij een nummer horen, in plaats van te vertrouwen op wat de browser stuurt.
export async function zoekOpNummer(kvkNummer: string): Promise<Bedrijf | null> {
  const { basis, headers } = kvk()
  const url = `${basis}/v2/zoeken?kvkNummer=${encodeURIComponent(kvkNummer)}`
  const antwoord = await fetch(url, { headers, cache: "no-store" })
  if (antwoord.status === 404) return null
  if (!antwoord.ok) throw new Error(`KVK zoeken gaf status ${antwoord.status}`)

  const data: { resultaten?: ZoekResultaat[] } = await antwoord.json()
  return alleenHoofdvestigingen(data.resultaten ?? [])[0] ?? null
}

// Alleen hoofdvestigingen en rechtspersonen. Eén regel per KVK-nummer,
// en de hoofdvestiging gaat voor omdat die een adres en vestigingsnummer heeft.
function alleenHoofdvestigingen(resultaten: ZoekResultaat[]): Bedrijf[] {
  const perNummer = new Map<string, Bedrijf & { hoofd: boolean }>()

  for (const r of resultaten) {
    if (r.type === "nevenvestiging") continue
    const hoofd = r.type === "hoofdvestiging"
    const bestaand = perNummer.get(r.kvkNummer)
    if (bestaand && bestaand.hoofd) continue

    const adres = r.adres?.binnenlandsAdres
    perNummer.set(r.kvkNummer, {
      kvkNummer: r.kvkNummer,
      vestigingsnummer: hoofd ? r.vestigingsnummer : undefined,
      naam: r.naam,
      straat: adres?.straatnaam,
      plaats: adres?.plaats,
      hoofd,
    })
  }

  return [...perNummer.values()].map(({ kvkNummer, vestigingsnummer, naam, straat, plaats }) => ({
    kvkNummer,
    vestigingsnummer,
    naam,
    straat,
    plaats,
  }))
}

// ---------------------------------------------------------------
// Vestigingsprofiel (kost geld)
// ---------------------------------------------------------------

type ProfielAdres = {
  type: "correspondentieadres" | "bezoekadres"
  straatnaam?: string
  huisnummer?: number
  huisnummerToevoeging?: string
  postbusnummer?: number
  postcode?: string
  plaats?: string
}

// Haalt het adres voor de brief op. Heeft het bedrijf een correspondentieadres
// (vaak een postbus), dan gebruiken we dat. Anders het bezoekadres.
export async function haalAdres(kvkNummer: string, vestigingsnummer: string): Promise<Adres | null> {
  const { basis, headers } = kvk()
  const url = `${basis}/v1/vestigingsprofielen/${encodeURIComponent(vestigingsnummer)}?geoData=false`
  const antwoord = await fetch(url, { headers, cache: "no-store" })
  if (!antwoord.ok) throw new Error(`KVK vestigingsprofiel gaf status ${antwoord.status}`)

  const data: { kvkNummer: string; adressen?: ProfielAdres[] } = await antwoord.json()

  // Hoort deze vestiging echt bij dit KVK-nummer?
  if (data.kvkNummer !== kvkNummer) return null

  const adressen = data.adressen ?? []
  const adres =
    adressen.find((a) => a.type === "correspondentieadres" && a.postcode) ??
    adressen.find((a) => a.type === "bezoekadres" && a.postcode)
  if (!adres?.postcode || !adres.plaats) return null

  const straat = adres.postbusnummer
    ? `Postbus ${adres.postbusnummer}`
    : [adres.straatnaam, adres.huisnummer, adres.huisnummerToevoeging].filter(Boolean).join(" ")

  return {
    straat,
    postcode: `${adres.postcode.slice(0, 4)} ${adres.postcode.slice(4)}`,
    plaats: adres.plaats,
  }
}
