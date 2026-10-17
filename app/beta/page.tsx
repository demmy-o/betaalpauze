import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Menu } from "../components/Menu"
import { buttonVariants } from "@/components/ui/button"
import { BETA_COOKIE, heeftToegang, veiligTerug } from "@/lib/beta"
import { BetaFormulier } from "./BetaFormulier"
import { Pagina } from "@/components/ui/pagina"

export const metadata = {
  title: "Bètaversie · Betaalpauze.nl",
  robots: { index: false, follow: false },
}

// De ingang van de bètaversie (ticket 21). Met het wachtwoord krijg je een cookie voor 30 dagen.
export default async function BetaPagina({ searchParams }: { searchParams: Promise<{ terug?: string }> }) {
  const { terug } = await searchParams
  const toegang = await heeftToegang((await cookies()).get(BETA_COOKIE)?.value)

  // Kwam je van een pagina van de bètaversie? Dan met toegang meteen terug daarheen.
  if (toegang && terug) redirect(veiligTerug(terug))

  return (
    <>
      <Menu actief="beta" />
      <Pagina className="min-h-0 flex-1">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 text-ink">Bètaversie</h1>
          <p className="text-lead text-muted-foreground">
            {toegang
              ? "Je hebt toegang. Je kunt een voorstel maken of verder op Mijn plan."
              : "Vul het wachtwoord in dat je van ons hebt gekregen."}
          </p>
        </div>

        {toegang ? (
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              href="/aanvragen"
              className={buttonVariants({ variant: "primair", size: "groot" })}
            >
              Voorstel maken
            </Link>
            <Link
              href="/mijn-plan"
              className={buttonVariants({ variant: "secundair", size: "groot" })}
            >
              Naar Mijn plan
            </Link>
          </div>
        ) : (
          <>
            <BetaFormulier terug={terug} />
            <p className="border-t border-line pt-6 text-base text-muted-foreground">
              Deze versie is voor testers. Wil je meedoen?{" "}
              <Link href="/#wachtlijst" className="text-ink underline underline-offset-4 hover:text-ink-soft">
                Laat je e-mailadres achter.
              </Link>
            </p>
          </>
        )}
      </Pagina>
    </>
  )
}
