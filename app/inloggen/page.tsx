import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { InlogFormulier } from "./InlogFormulier"
import { uitloggen } from "./actions"

export const metadata = {
  title: "Inloggen · Betaalpauze.nl",
}

export default async function InloggenPagina() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-canvas px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-form flex-col gap-10">
        <Link href="/" className="flex h-10 items-center">
          <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
        </Link>

        {user ? (
          <section className="flex flex-col gap-6 rounded-lg bg-mint-soft p-6">
            <h1 className="text-h2 text-ink">Je bent ingelogd</h1>
            <p className="text-base text-ink">
              Je bent ingelogd als <span className="font-medium">{user.email}</span>.
            </p>
            <form action={uitloggen}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 rounded-full border-ink px-6 text-base text-ink"
              >
                Uitloggen
              </Button>
            </form>
          </section>
        ) : (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-h1 text-ink">Inloggen</h1>
              <p className="text-lead text-muted-foreground">
                Geen wachtwoord nodig. Je krijgt een code per mail.
              </p>
            </div>
            <InlogFormulier />
          </section>
        )}
      </div>
    </main>
  )
}
