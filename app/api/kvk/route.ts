import { NextResponse, type NextRequest } from "next/server"
import { zoekBedrijven } from "@/lib/kvk"

// GET /api/kvk?q=naam
// Zoekt bedrijven bij de KVK (gratis). Het volledige adres en een bekend
// e-mailadres komen pas als iemand een bedrijf kiest, via /api/kvk/adres.
export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get("q") ?? "").trim()

  // Pas zoeken vanaf 3 tekens. Scheelt onnodige bevragingen bij de KVK.
  if (term.length < 3 || term.length > 80) {
    return NextResponse.json({ bedrijven: [] })
  }

  try {
    return NextResponse.json({ bedrijven: await zoekBedrijven(term) })
  } catch {
    return NextResponse.json({ fout: "Zoeken bij de KVK lukt nu even niet." }, { status: 502 })
  }
}
