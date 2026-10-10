import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { haalAdres, zoekOpNummer } from "@/lib/kvk"
import { createAdminClient } from "@/lib/supabase/admin"

// POST /api/kvk/adres  { kvkNummer }
// Wordt aangeroepen als iemand in stap 1 een bedrijf kiest.
// 1. Staat het bedrijf al met volledig adres in schuldeisers? Dan dat gebruiken (gratis).
// 2. Zo niet: naam en vestiging opzoeken (gratis), het vestigingsprofiel opvragen
//    (kost geld) en alles bewaren. Zo kost elk bedrijf maar één keer geld.
// We gebruiken alleen het KVK-nummer uit de browser. Naam en adres komen altijd van de KVK zelf.

const Verzoek = z.object({ kvkNummer: z.string().regex(/^\d{8}$/) })

// Rem op betaalde opvragingen: maximaal 10 per bezoeker per uur.
// Let op: dit geheugen is per serverproces, dus het is een rem en geen harde grens.
const MAX_PER_UUR = 10
const opvragingen = new Map<string, number[]>()

function magOpvragen(bezoeker: string) {
  const uurGeleden = Date.now() - 60 * 60 * 1000
  const recent = (opvragingen.get(bezoeker) ?? []).filter((t) => t > uurGeleden)
  if (recent.length >= MAX_PER_UUR) return false
  opvragingen.set(bezoeker, [...recent, Date.now()])
  return true
}

export async function POST(request: NextRequest) {
  const verzoek = Verzoek.safeParse(await request.json().catch(() => null))
  if (!verzoek.success) return NextResponse.json({ fout: "Ongeldig verzoek" }, { status: 400 })
  const { kvkNummer } = verzoek.data

  const admin = createAdminClient()
  const { data: bekend } = await admin
    .from("schuldeisers")
    .select("id, straat, postcode, plaats, email, onbestelbaar")
    .eq("kvk_nummer", kvkNummer)
    .maybeSingle()

  const bekendEmail = bekend && !bekend.onbestelbaar ? bekend.email ?? undefined : undefined

  // 1. Al bekend met volledig adres: geen nieuwe opvraging.
  if (bekend?.postcode) {
    return NextResponse.json({
      adres: { straat: bekend.straat, postcode: bekend.postcode, plaats: bekend.plaats },
      bekendEmail,
    })
  }

  // 2. Opzoeken bij de KVK.
  try {
    const bedrijf = await zoekOpNummer(kvkNummer)
    if (!bedrijf) return NextResponse.json({ fout: "Dit KVK-nummer kennen we niet." }, { status: 404 })

    let adres: { straat?: string; postcode?: string; plaats?: string } = {
      straat: bedrijf.straat,
      plaats: bedrijf.plaats,
    }

    // Zonder vestigingsnummer (rechtspersoon zonder vestiging) heeft de KVK geen volledig adres.
    if (bedrijf.vestigingsnummer) {
      const bezoeker = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "onbekend"
      if (!magOpvragen(bezoeker)) {
        return NextResponse.json({ fout: "Te veel opvragingen. Probeer het over een uur opnieuw." }, { status: 429 })
      }
      const volledig = await haalAdres(kvkNummer, bedrijf.vestigingsnummer)
      if (volledig) adres = volledig
    }

    const rij = {
      naam: bedrijf.naam,
      kvk_nummer: kvkNummer,
      straat: adres.straat ?? null,
      postcode: adres.postcode ?? null,
      plaats: adres.plaats ?? null,
      gecontroleerd_op: adres.postcode ? new Date().toISOString().slice(0, 10) : null,
    }
    if (bekend) await admin.from("schuldeisers").update(rij).eq("id", bekend.id)
    else await admin.from("schuldeisers").insert(rij)

    return NextResponse.json({ adres, bekendEmail })
  } catch {
    return NextResponse.json({ fout: "Het adres ophalen bij de KVK lukt nu even niet." }, { status: 502 })
  }
}
