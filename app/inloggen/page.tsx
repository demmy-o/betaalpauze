import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { InlogFormulier } from "./InlogFormulier"
import { buttonVariants } from "@/components/ui/button"
import { komtUitAanvraag, naInloggen } from "@/lib/inloggen"
import { Pagina } from "@/components/ui/pagina"

export const metadata = {
  title: "Inloggen · Betaalpauze.nl",
}

// Inloggen met een code per mail. Al ingelogd? Dan door naar waar je heen wilde, anders Mijn plan.
// Met ?terug=/aanvragen?stap=2 ga je na het inloggen terug naar die stap in de aanvraag.
export default async function InloggenPagina({ searchParams }: { searchParams: Promise<{ terug?: string }> }) {
  const { terug } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(naInloggen(terug))
  const uitAanvraag = komtUitAanvraag(terug)

  return (
    <Pagina>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 text-ink">Inloggen</h1>
          <p className="text-lead text-muted-foreground">
            {uitAanvraag
              ? "Geen wachtwoord nodig. Je krijgt een code per mail. Daarna ga je verder met je aanvraag. Je antwoorden blijven bewaard."
              : "Geen wachtwoord nodig. Je krijgt een code per mail."}
          </p>
        </div>
        <InlogFormulier terug={uitAanvraag ? naInloggen(terug) : undefined} />
        {uitAanvraag && (
          <Link href={naInloggen(terug)} className={buttonVariants({ variant: "tertiair", size: "klein", className: "self-start" })}>
            Terug naar je aanvraag
          </Link>
        )}
      </section>
    </Pagina>
  )
}
