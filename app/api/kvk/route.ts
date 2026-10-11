import { NextResponse, type NextRequest } from "next/server"
import { zoekBedrijven } from "@/lib/kvk"
import { createAdminClient } from "@/lib/supabase/admin"
import type { GevondenBedrijf, Regeling } from "@/lib/regeling"

// GET /api/kvk?q=naam
// Zoekt eerst in onze eigen lijst met bekende schuldeisers, daarna bij de KVK (gratis).
// Zo vinden we ook partijen die niet in het KVK-register staan, zoals het CJIB.
// Bedrijven die in allebei staan, tonen we één keer (die uit onze eigen lijst).
export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get("q") ?? "").trim()

  // Pas zoeken vanaf 3 tekens. Scheelt onnodige bevragingen bij de KVK.
  if (term.length < 3 || term.length > 80) {
    return NextResponse.json({ bedrijven: [] })
  }

  const eigen = await zoekEigenLijst(term)
  const alInEigen = new Set(eigen.map((b) => b.kvkNummer).filter(Boolean))

  try {
    const kvk: GevondenBedrijf[] = (await zoekBedrijven(term))
      .filter((b) => !alInEigen.has(b.kvkNummer))
      .map((b) => ({ bron: "kvk", kvkNummer: b.kvkNummer, naam: b.naam, straat: b.straat, plaats: b.plaats }))
    return NextResponse.json({ bedrijven: [...eigen, ...kvk] })
  } catch {
    // Doet de KVK het even niet, dan tonen we in elk geval onze eigen lijst.
    if (eigen.length) return NextResponse.json({ bedrijven: eigen, kvkFout: true })
    return NextResponse.json({ fout: "Zoeken bij de KVK lukt nu even niet." }, { status: 502 })
  }
}

async function zoekEigenLijst(term: string): Promise<GevondenBedrijf[]> {
  const schoon = term.replace(/[%_,()]/g, " ").trim()
  if (schoon.length < 3) return []

  const { data } = await createAdminClient()
    .from("schuldeisers")
    .select("id, naam, kvk_nummer, straat, postcode, plaats, email, onbestelbaar, regeling_via, regeling_url, telefoon, opmerking")
    .not("regeling_via", "is", null)
    .ilike("naam", `%${schoon}%`)
    .limit(5)

  return (data ?? []).map((r) => ({
    bron: "eigen",
    schuldeiserId: r.id,
    kvkNummer: r.kvk_nummer ?? undefined,
    naam: r.naam,
    straat: r.straat ?? undefined,
    postcode: r.postcode ?? undefined,
    plaats: r.plaats ?? undefined,
    email: !r.onbestelbaar ? r.email ?? undefined : undefined,
    regeling: {
      via: r.regeling_via,
      url: r.regeling_url ?? undefined,
      telefoon: r.telefoon ?? undefined,
      opmerking: r.opmerking ?? undefined,
    } satisfies Regeling,
  }))
}
