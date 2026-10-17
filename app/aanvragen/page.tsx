import { Suspense } from "react"
import { Aanvraag } from "./Aanvraag"
import { Pagina } from "@/components/ui/pagina"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Betaalpauze aanvragen · Betaalpauze.nl",
}

// De aanvraag heeft geen hoofdmenu: alleen het logo, zodat je niet per ongeluk uit de flow klikt.
export default async function AanvragenPagina() {
  // Al ingelogd? Dan hoeft er in stap 4 geen code meer.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <Pagina kolom="stap">
      <Suspense>
        <Aanvraag ingelogdAls={user?.email ?? undefined} />
      </Suspense>
    </Pagina>
  )
}
