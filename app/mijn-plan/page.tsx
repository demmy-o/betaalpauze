import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { haalMijnZaken } from "@/lib/mijnPlan"
import { uitloggen } from "../inloggen/actions"
import { ZaakKaart } from "./ZaakKaart"

export const metadata = { title: "Mijn plan · Betaalpauze.nl" }

// Mijn plan: al je zaken, met het betaalschema, de verstuurde brief en de reactie van het bedrijf.
export default async function MijnPlanPagina() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/inloggen")

  const zaken = await haalMijnZaken()

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-form flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
          </Link>
          <form action={uitloggen}>
            <button
              type="submit"
              className="min-h-11 text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
            >
              Uitloggen
            </button>
          </form>
        </header>

        <div className="flex flex-col gap-2">
          <h1 className="text-h1 text-ink">Mijn plan</h1>
          <p className="text-sm text-muted-foreground">Ingelogd als {user.email}</p>
        </div>

        {zaken.length === 0 ? (
          <LegeStaat />
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {zaken.map((zaak) => (
                <ZaakKaart key={zaak.id} zaak={zaak} />
              ))}
            </div>
            <Link
              href="/aanvragen"
              className="self-start text-sm text-violet underline underline-offset-4 hover:text-violet-strong"
            >
              Nog een rekening? Maak een nieuw voorstel
            </Link>
          </>
        )}
      </div>
    </main>
  )
}

// Lege staat (docs/design.md): zachte pastel, uitleg waarom het leeg is, één primaire actie.
function LegeStaat() {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-lilac-soft p-6">
      <h2 className="text-h3 text-ink">Je hebt nog geen betaalvoorstel</h2>
      <p className="text-base text-muted-foreground">
        Hier zie je straks je voorstel, je betaalschema en wat het bedrijf heeft geantwoord. Een voorstel maken duurt
        ongeveer 5 minuten.
      </p>
      <Link
        href="/aanvragen"
        className="flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-base font-medium text-white transition-colors duration-[120ms] hover:bg-ink-soft sm:w-auto sm:self-start"
      >
        Voorstel maken
      </Link>
    </section>
  )
}
