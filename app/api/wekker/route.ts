import { NextResponse, type NextRequest } from "next/server"
import { vandaag } from "@/lib/betaalplan"
import { draaiWekker } from "@/lib/wekker"
import { testmodus } from "@/lib/verstuur"

// POST /api/wekker
// Verstuurt de herinneringen van vandaag. Wordt elke ochtend om 08:00 aangeroepen
// door de Netlify-wekker (netlify/functions/wekker.mts).
// Alleen met de geheime sleutel: Authorization: Bearer <WEKKER_GEHEIM>.
//
// Testen zonder te wachten: npm run wekker -- 2026-11-07
// Een eigen datum kiezen kan alleen als MAIL_TEST_MODE aan staat.
export async function POST(request: NextRequest) {
  const geheim = process.env.WEKKER_GEHEIM
  if (!geheim || request.headers.get("authorization") !== `Bearer ${geheim}`) {
    return NextResponse.json({ fout: "Niet toegestaan" }, { status: 401 })
  }

  const gevraagd = request.nextUrl.searchParams.get("datum")
  if (gevraagd && !testmodus()) {
    return NextResponse.json({ fout: "Een eigen datum kan alleen in testmodus." }, { status: 400 })
  }
  if (gevraagd && !/^\d{4}-\d{2}-\d{2}$/.test(gevraagd)) {
    return NextResponse.json({ fout: "Datum als JJJJ-MM-DD" }, { status: 400 })
  }

  const datum = gevraagd ?? vandaag()
  try {
    const uitslag = await draaiWekker(datum, request.nextUrl.origin)
    console.log(`Wekker ${datum}:`, uitslag)
    return NextResponse.json({ datum, ...uitslag })
  } catch (fout) {
    console.error("Wekker mislukt:", fout)
    return NextResponse.json({ fout: "De wekker liep vast. Zie de serverlog." }, { status: 500 })
  }
}
