import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { haalZaak } from "@/lib/zaak"
import { vandaag } from "@/lib/betaalplan"
import { KiesVoorstel } from "./KiesVoorstel"

export const metadata = { title: "Je voorstel · Betaalpauze.nl" }

// Scherm 5: kies een pauze, termijnen of allebei.
export default async function VoorstelPagina({ params }: { params: Promise<{ zaakId: string }> }) {
  const { zaakId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/inloggen")

  const zaak = await haalZaak(zaakId)
  if (!zaak) notFound()
  if (zaak.status !== "concept") redirect(`/aanvragen/${zaakId}/brief`)

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-form flex-col gap-8">
        <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
        <KiesVoorstel
          zaakId={zaak.id}
          bedragCenten={zaak.bedragCenten}
          startdatum={vandaag()}
          begin={
            zaak.plan
              ? {
                  soort: zaak.plan.soort,
                  pauzeMaanden: zaak.plan.pauzeMaanden,
                  aantalTermijnen: zaak.plan.soort === "pauze" ? undefined : zaak.plan.termijnen.length,
                }
              : undefined
          }
        />
      </div>
    </main>
  )
}
