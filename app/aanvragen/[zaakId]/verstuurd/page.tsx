import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { haalZaak } from "@/lib/zaak"
import { datumLang, euro, plusDagen } from "@/lib/betaalplan"
import { REACTIE_DAGEN } from "@/lib/brief"

export const metadata = { title: "Verstuurd · Betaalpauze.nl" }

// Scherm 7: je voorstel is verstuurd. Wat gebeurt er nu, en wanneer?
export default async function VerstuurdPagina({ params }: { params: Promise<{ zaakId: string }> }) {
  const { zaakId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/inloggen")

  const zaak = await haalZaak(zaakId)
  if (!zaak?.brief || !zaak.plan) notFound()
  if (zaak.status === "concept") redirect(`/aanvragen/${zaakId}/brief`)

  const { plan } = zaak
  const eerste = plan.termijnen[0]
  const reactieVoor = plusDagen(plan.aangemaakt, REACTIE_DAGEN)
  const herinnering = plusDagen(eerste.vervaldatum, -3)

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-form flex-col gap-8">
        <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />

        <section className="flex flex-col gap-3 rounded-lg bg-mint-soft p-6">
          <h1 className="text-h2 text-ink">Je voorstel is verstuurd</h1>
          <p className="text-base text-ink">
            Je brief is naar {zaak.brief.schuldeiser.naam} gestuurd. Een kopie staat in je mailbox, op{" "}
            {zaak.brief.afzender.email}.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-h3 text-ink">Wat gebeurt er nu?</h2>
          <ol className="flex flex-col gap-4">
            <Moment datum={reactieVoor} titel="Het bedrijf reageert">
              Het bedrijf heeft tot deze dag om te reageren. Het antwoord komt direct in jouw mailbox, niet bij ons.
            </Moment>
            <Moment datum={herinnering} titel="Wij sturen een herinnering">
              Drie dagen voor je eerste betaling krijg je van ons een mail.
            </Moment>
            <Moment datum={eerste.vervaldatum} titel="Je eerste betaling">
              Je betaalt <span className="tabular font-medium">{euro(eerste.bedragCenten)}</span> via je eigen bank.
              Hoor je niets van het bedrijf? Dan begin je toch, zoals in je voorstel staat.
            </Moment>
          </ol>
        </section>

        <p className="text-sm text-muted-foreground">
          Een voorstel is pas een afspraak als het bedrijf akkoord gaat. Krijg je een ander antwoord? Dan helpen we je
          verder als je ons dat laat weten.
        </p>

        <Link
          href="/"
          className="self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
        >
          Naar de startpagina
        </Link>
      </div>
    </main>
  )
}

function Moment({ datum, titel, children }: { datum: string; titel: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted-foreground">{datumLang(datum)}</p>
      <p className="font-medium text-ink">{titel}</p>
      <p className="text-sm text-ink">{children}</p>
    </li>
  )
}
