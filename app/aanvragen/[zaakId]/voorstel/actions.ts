"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { vervangConceptPlan } from "@/lib/planOpslaan"
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

  // Zolang de brief niet verstuurd is, vervangen we het concept.
  if (!(await vervangConceptPlan(zaakId, plan))) return { melding: "Opslaan lukte niet. Probeer het opnieuw." }

  await supabase.from("events").insert({ zaak_id: zaakId, naam: "voorstel_gekozen", data: { ...keuze } })

  redirect(`/aanvragen/${zaakId}/brief`)
}
