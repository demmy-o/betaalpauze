import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { haalZaak } from "@/lib/zaak"
import { mailBeta } from "@/lib/verstuur"
import { BriefBekijken } from "./BriefBekijken"
import { Pagina } from "@/components/ui/pagina"

export const metadata = { title: "Je brief · Betaalpauze.nl" }

// Scherm 6: de brief bekijken.
export default async function BriefPagina({ params }: { params: Promise<{ zaakId: string }> }) {
  const { zaakId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/inloggen")

  const zaak = await haalZaak(zaakId)
  if (!zaak?.brief) notFound()
  if (zaak.status !== "concept") redirect(`/aanvragen/${zaakId}/verstuurd`)
  if (!zaak.plan) redirect(`/aanvragen/${zaakId}/voorstel`)
  const route = zaak.verzendroute === "post" ? "post" : "email"
  if (route === "email" && !zaak.schuldeiserEmail) redirect("/aanvragen?stap=1")

  return (
    <Pagina kolom="stap">
      <BriefBekijken
        zaakId={zaak.id}
        route={route}
        beta={mailBeta()}
        schuldeiserEmail={zaak.schuldeiserEmail ?? ""}
        gegevens={{ ...zaak.brief, plan: zaak.plan, datum: zaak.plan.aangemaakt, route }}
      />
    </Pagina>
  )
}
