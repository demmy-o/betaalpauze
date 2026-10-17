import { redirect } from "next/navigation"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { haalMijnZaken } from "@/lib/mijnPlan"
import { uitloggen } from "../inloggen/actions"
import { ZaakKaart } from "./ZaakKaart"
import { Pagina } from "@/components/ui/pagina"
import { Kopbalk } from "@/components/ui/kopbalk"
import { Kaart } from "@/components/ui/kaart"

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
    <>
      <Kopbalk
        rechts={
          <form action={uitloggen}>
            <Button type="submit" variant="tertiair" size="klein">
              Uitloggen
            </Button>
          </form>
        }
      />
      <Pagina kolom="breed">
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
              className="self-start text-sm text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              Nog een rekening? Maak een nieuw voorstel
            </Link>
          </>
        )}
      </Pagina>
    </>
  )
}

// Lege staat (docs/design.md): zachte pastel, uitleg waarom het leeg is, één primaire actie.
function LegeStaat() {
  return (
    <Kaart>
      <h2 className="text-h3 text-ink">Je hebt nog geen betaalvoorstel</h2>
      <p className="text-base text-muted-foreground">
        Hier zie je straks je voorstel, je betaalschema en wat het bedrijf heeft geantwoord. Een voorstel maken duurt
        ongeveer 5 minuten.
      </p>
      <Link
        href="/aanvragen"
        className={buttonVariants({ variant: "primair", size: "groot", className: "w-full md:w-auto md:self-start" })}
      >
        Voorstel maken
      </Link>
    </Kaart>
  )
}
