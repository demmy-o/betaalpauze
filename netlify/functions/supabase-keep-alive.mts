// Houdt het gratis Supabase-project wakker.
// Supabase zet gratis projecten na ongeveer een week zonder activiteit op pauze.
// Netlify draait deze functie elke 3 dagen. Hij vraagt alleen iets op en
// verandert niets aan de wachtlijst (door de beveiliging krijgt hij een lege lijst terug).

export default async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("Supabase keep-alive: URL of key ontbreekt")
    return
  }

  const response = await fetch(`${url}/rest/v1/signups?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })

  if (response.ok) {
    console.log("Supabase keep-alive: gelukt")
  } else {
    console.error(`Supabase keep-alive: mislukt (HTTP ${response.status})`)
  }
}

// Elke 3 dagen om 06:00 UTC
export const config = {
  schedule: "0 6 */3 * *",
}
