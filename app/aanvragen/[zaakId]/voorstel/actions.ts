"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { controleer, rekenPlan, vandaag, type Soort } from "@/lib/betaalplan"

export type VoorstelKeuze = { soort: Soort; pauzeMaanden?: number; aantalTermijnen?: number }

// Bewaart het gekozen voorstel. De server rekent zelf alles uit:
// bedragen en datums uit de browser vertrouwen we niet.
// Zolang de brief niet verstuurd is, overschrijft opslaan het concept.
export async function bewaarVoorstel(zaakId: string, keuze: VoorstelKeuze): Promise<{ melding: string } | void> {
  const supabase = await createClient()

  const { data: zaak } = await supabase
    .from("zaken")
    .select("id, bedrag_centen, status")
    .eq("id", zaakId)
    .maybeSingle()
  if (!zaak) return { melding: "We konden je zaak niet vinden. Log opnieuw in en probeer het nog eens." }
  if (zaak.status !== "concept") return { melding: "Deze brief is al verstuurd. Je voorstel kan nu niet meer veranderen." }

  const volledig = {
    soort: keuze.soort,
    bedragCenten: zaak.bedrag_centen,
    startdatum: vandaag(),
    pauzeMaanden: keuze.soort === "termijnen" ? undefined : keuze.pauzeMaanden,
    aantalTermijnen: keuze.soort === "pauze" ? undefined : keuze.aantalTermijnen,
  }
  const fout = controleer(volledig)
  if (fout) return { melding: fout }
  const plan = rekenPlan(volledig)

  // Zolang de brief niet verstuurd is, vervangen we het concept. Pas na versturen komt er
  // een nieuwe versie bij (bij een aanpassing). Gebruikers mogen zelf niets verwijderen,
  // dus dit doet de server, nadat hierboven met hun eigen sessie is gecontroleerd dat de
  // zaak van hen is en nog een concept is.
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
  if (error) return { melding: "Opslaan lukte niet. Probeer het opnieuw." }

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
    return { melding: "Opslaan lukte niet. Probeer het opnieuw." }
  }

  if (oud) {
    await admin.from("betaalplannen").delete().eq("id", oud.id) // termijnen gaan mee
    await admin.from("betaalplannen").update({ versie }).eq("id", nieuw.id)
  }

  await supabase.from("events").insert({ zaak_id: zaakId, naam: "voorstel_gekozen", data: { ...keuze } })

  redirect(`/aanvragen/${zaakId}/brief`)
}
