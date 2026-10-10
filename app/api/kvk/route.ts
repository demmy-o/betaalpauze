import { NextResponse, type NextRequest } from "next/server"
import { zoekBedrijven } from "@/lib/kvk"
import { createAdminClient } from "@/lib/supabase/admin"

// GET /api/kvk?q=naam
// Zoekt bedrijven bij de KVK. Kennen we het bedrijf al (tabel schuldeisers),
// dan sturen we het e-mailadres mee, zodat de gebruiker dat niet hoeft te zoeken.
export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get("q") ?? "").trim()

  // Pas zoeken vanaf 3 tekens. Scheelt onnodige bevragingen bij de KVK.
  if (term.length < 3 || term.length > 80) {
    return NextResponse.json({ bedrijven: [] })
  }

  try {
    const bedrijven = await zoekBedrijven(term)

    const nummers = bedrijven.map((b) => b.kvkNummer)
    const bekend = new Map<string, string>()
    if (nummers.length > 0) {
      const { data } = await createAdminClient()
        .from("schuldeisers")
        .select("kvk_nummer, email")
        .in("kvk_nummer", nummers)
        .eq("onbestelbaar", false)
        .not("email", "is", null)
      for (const rij of data ?? []) bekend.set(rij.kvk_nummer, rij.email)
    }

    return NextResponse.json({
      bedrijven: bedrijven.map((b) => ({ ...b, bekendEmail: bekend.get(b.kvkNummer) })),
    })
  } catch {
    return NextResponse.json({ fout: "Zoeken bij de KVK lukt nu even niet." }, { status: 502 })
  }
}
