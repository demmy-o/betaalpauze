import "server-only"
import { createClient } from "@/lib/supabase/server"

// Alle zaken van de ingelogde gebruiker, nieuwste eerst, met het nieuwste voorstel,
// de termijnen en de verstuurde brief. Row level security zorgt dat je alleen je eigen zaken ziet.

export type ZaakStatus = "concept" | "verstuurd" | "akkoord" | "afgewezen" | "afgerond"
export type TermijnStatus = "open" | "betaald" | "niet_betaald"

export type ZaakOverzicht = {
  id: string
  schuldeiser: string
  factuurnummer: string
  bedragCenten: number
  status: ZaakStatus
  verstuurdOp: string | null
  termijnen: { id: string; volgnummer: number; vervaldatum: string; bedragCenten: number; status: TermijnStatus }[]
  brief: { tekst: string; verstuurdOp: string | null } | null
}

type Rij = {
  id: string
  factuurnummer: string
  bedrag_centen: number
  status: ZaakStatus
  verstuurd_op: string | null
  schuldeisers: { naam: string } | { naam: string }[] | null
  betaalplannen: {
    versie: number
    termijnen: { id: string; volgnummer: number; vervaldatum: string; bedrag_centen: number; status: TermijnStatus }[]
  }[]
  brieven: { tekst: string; verstuurd_op: string | null; created_at: string }[]
}

export async function haalMijnZaken(): Promise<ZaakOverzicht[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("zaken")
    .select(
      `id, factuurnummer, bedrag_centen, status, verstuurd_op,
       schuldeisers(naam),
       betaalplannen(versie, termijnen(id, volgnummer, vervaldatum, bedrag_centen, status)),
       brieven(tekst, verstuurd_op, created_at)`
    )
    .order("created_at", { ascending: false })

  return ((data ?? []) as Rij[]).map((z) => {
    const schuldeiser = Array.isArray(z.schuldeisers) ? z.schuldeisers[0] : z.schuldeisers
    const plan = [...z.betaalplannen].sort((a, b) => b.versie - a.versie)[0]
    const brief = [...z.brieven].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]

    return {
      id: z.id,
      schuldeiser: schuldeiser?.naam ?? "Onbekend bedrijf",
      factuurnummer: z.factuurnummer,
      bedragCenten: z.bedrag_centen,
      status: z.status,
      verstuurdOp: z.verstuurd_op,
      termijnen: (plan?.termijnen ?? [])
        .sort((a, b) => a.volgnummer - b.volgnummer)
        .map((t) => ({ id: t.id, volgnummer: t.volgnummer, vervaldatum: t.vervaldatum, bedragCenten: t.bedrag_centen, status: t.status })),
      brief: brief ? { tekst: brief.tekst, verstuurdOp: brief.verstuurd_op } : null,
    }
  })
}
