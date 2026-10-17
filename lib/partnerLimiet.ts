import type { SupabaseClient } from "@supabase/supabase-js"

// Limieten op aanmeldingen via /partners, tegen spam.
// - Per bezoeker: maximaal 5 per uur (per IPv4-adres of per IPv6-netwerk, zie ipVoorLimiet in lib/ip.ts).
// - Voor de hele site samen: maximaal 20 per uur, als vangnet als iemand van adres wisselt.
export const MAX_PER_BEZOEKER_PER_UUR = 5
export const MAX_TOTAAL_PER_UUR = 20

export const MELDING_LIMIET = "Je hebt al een paar aanmeldingen gestuurd. Probeer het over een uur opnieuw."

// Geeft true als deze bezoeker nog een aanmelding mag sturen.
export async function magAanmelden(admin: SupabaseClient, ipHash: string): Promise<boolean> {
  const uurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const totaal = await admin
    .from("partner_aanmeldingen")
    .select("*", { count: "exact", head: true })
    .gte("created_at", uurGeleden)
  // Lukt het tellen niet, dan liever niets opslaan dan de limiet overslaan.
  if (totaal.error || (totaal.count ?? 0) >= MAX_TOTAAL_PER_UUR) return false

  const bezoeker = await admin
    .from("partner_aanmeldingen")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", uurGeleden)
  if (bezoeker.error || (bezoeker.count ?? 0) >= MAX_PER_BEZOEKER_PER_UUR) return false

  return true
}
