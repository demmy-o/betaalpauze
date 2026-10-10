import { NextResponse, type NextRequest } from "next/server"
import { haalZaak } from "@/lib/zaak"
import { MAX_TOELICHTING, maakBrief } from "@/lib/brief"
import { maakPdf } from "@/lib/briefPdf"

// POST /aanvragen/[zaakId]/brief/pdf  (formulier met "toelichting")
// Geeft de brief als PDF terug. Alleen voor je eigen zaak (row level security).
export async function POST(request: NextRequest, { params }: { params: Promise<{ zaakId: string }> }) {
  const { zaakId } = await params
  const zaak = await haalZaak(zaakId)
  if (!zaak?.brief || !zaak.plan) {
    return NextResponse.json({ fout: "Deze brief bestaat niet of is niet van jou." }, { status: 404 })
  }

  const formulier = await request.formData()
  const toelichting = String(formulier.get("toelichting") ?? "").slice(0, MAX_TOELICHTING)

  const brief = maakBrief({ ...zaak.brief, plan: zaak.plan, datum: zaak.plan.aangemaakt, toelichting })
  const pdf = await maakPdf(brief)

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="betaalvoorstel-${brief.onderwerp.match(/factuur (\S+?)(,|$)/)?.[1] ?? "brief"}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  })
}
