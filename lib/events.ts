import "server-only"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Legt vast wat een gebruiker doet (tabel events). Alleen de server schrijft hierin,
// voor de ingelogde gebruiker van dit verzoek. Mislukt het loggen, dan gaat de rest gewoon door.
export async function logEvent(naam: string, zaakId?: string, data: Record<string, unknown> = {}) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser()
    await createAdminClient().from("events").insert({ user_id: user?.id ?? null, zaak_id: zaakId ?? null, naam, data })
  } catch (fout) {
    console.error("Event loggen mislukt:", naam, fout)
  }
}
