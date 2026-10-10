import "server-only"
import { createClient } from "@supabase/supabase-js"

// Supabase met de geheime sleutel. Gaat langs row level security heen.
// Alleen gebruiken op de server, voor dingen die een gebruiker zelf niet mag
// (zoals de lijst met schuldeisers aanvullen).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
