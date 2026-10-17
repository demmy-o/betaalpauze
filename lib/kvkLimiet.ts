import type { SupabaseClient } from "@supabase/supabase-js"

// Rem op kosten: maximaal zoveel betaalde KVK-opvragingen (basisprofiel, vestigingsprofiel) per dag,
// voor de hele site samen. Daarboven vragen we niets meer op bij de KVK en gebruiken we alleen wat
// we al weten (onze eigen lijst in schuldeisers). Zoeken is gratis en telt niet mee.
export const KVK_DAGLIMIET = 100

export const MELDING_LIMIET =
  "We kunnen het adres van dit bedrijf nu niet automatisch ophalen. Neem het postadres over van je factuur."

// Reserveert één betaalde opvraging voor vandaag (tabel kvk_opvragingen). Geeft false als de limiet
// bereikt is. Lukt het tellen niet, dan vragen we voor de zekerheid ook niets op.
export async function reserveerBetaaldeOpvraging(admin: SupabaseClient, maximum = KVK_DAGLIMIET): Promise<boolean> {
  const { data, error } = await admin.rpc("kvk_reserveer_opvraging", { maximum })
  if (error) return false
  return data === true
}
