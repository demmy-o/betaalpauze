import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { haalZaak } from "@/lib/zaak"
import { BriefBekijken } from "./BriefBekijken"

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
  if (!zaak.schuldeiserEmail) redirect("/aanvragen?stap=1")

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-prose flex-col gap-8">
        <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
        <BriefBekijken
          zaakId={zaak.id}
          schuldeiserEmail={zaak.schuldeiserEmail}
          gegevens={{ ...zaak.brief, plan: zaak.plan, datum: zaak.plan.aangemaakt }}
        />
      </div>
    </main>
  )
}
