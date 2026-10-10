import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Plan } from "@/lib/betaalplan"

// Vervangt het conceptplan van een zaak door een nieuw plan.
// Alleen gebruiken als de zaak nog een concept is (brief niet verstuurd) en
// als je al met de sessie van de gebruiker hebt gecontroleerd dat de zaak van hem is.
// Gebruikers mogen zelf niets verwijderen, daarom doet de server dit.
export async function vervangConceptPlan(zaakId: string, plan: Plan): Promise<boolean> {
  const admin = createAdminClient()
  const { data: oud } = await admin
    .from("betaalplannen")
    .select("id, versie")
    .eq("zaak_id", zaakId)
    .order("versie", { ascending: false })
    .limit(1)
    .maybeSingle()
  const versie = oud?.versie ?? 1

  // Eerst het nieuwe plan volledig bewaren (tijdelijk met een hoger versienummer),
  // dan pas het oude weggooien. Zo is er nooit een moment zonder plan.
  const { data: nieuw, error } = await admin
    .from("betaalplannen")
    .insert({
      zaak_id: zaakId,
      versie: versie + 1,
      soort: plan.soort,
      pauze_tot: plan.pauzeTot ?? null,
      aantal_termijnen: plan.termijnen.length,
    })
    .select("id")
    .single()
  if (error) return false

  const { error: termijnFout } = await admin.from("termijnen").insert(
    plan.termijnen.map((t) => ({
      betaalplan_id: nieuw.id,
      volgnummer: t.volgnummer,
      vervaldatum: t.vervaldatum,
      bedrag_centen: t.bedragCenten,
    }))
  )
  if (termijnFout) {
    await admin.from("betaalplannen").delete().eq("id", nieuw.id)
    return false
  }

  if (oud) {
    await admin.from("betaalplannen").delete().eq("id", oud.id) // termijnen gaan mee
    await admin.from("betaalplannen").update({ versie }).eq("id", nieuw.id)
  }
  return true
}
