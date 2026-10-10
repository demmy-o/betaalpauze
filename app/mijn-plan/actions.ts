"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logEvent } from "@/lib/events"

export type Reactie = "akkoord" | "afgewezen" | "nog_niets"

// De gebruiker vult in wat de schuldeiser heeft geantwoord.
// De status mag alleen de server zetten. Eerst controleren we met de sessie van de
// gebruiker dat de zaak van hem is en al verstuurd is.
export async function zetReactie(zaakId: string, reactie: Reactie): Promise<{ melding: string } | void> {
  if (!["akkoord", "afgewezen", "nog_niets"].includes(reactie)) return { melding: "Onbekende keuze." }

  const supabase = await createClient()
  const { data: zaak } = await supabase.from("zaken").select("id, status").eq("id", zaakId).maybeSingle()
  if (!zaak) return { melding: "We konden deze zaak niet vinden. Log opnieuw in en probeer het nog eens." }
  if (!["verstuurd", "akkoord", "afgewezen"].includes(zaak.status)) {
    return { melding: "Je kunt de reactie pas invullen als je brief verstuurd is." }
  }

  const status = reactie === "nog_niets" ? "verstuurd" : reactie
  const { error } = await createAdminClient().from("zaken").update({ status }).eq("id", zaakId)
  if (error) return { melding: "Opslaan lukte niet. Probeer het opnieuw." }

  await logEvent("reactie_ingevuld", zaakId, { reactie })
  revalidatePath("/mijn-plan")
}
