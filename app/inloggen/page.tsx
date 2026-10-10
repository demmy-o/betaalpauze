import Image from "next/image"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { InlogFormulier } from "./InlogFormulier"

export const metadata = {
  title: "Inloggen · Betaalpauze.nl",
}

// Inloggen met een code per mail. Al ingelogd? Dan door naar Mijn plan.
export default async function InloggenPagina() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/mijn-plan")

  return (
    <main className="min-h-screen bg-canvas px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-form flex-col gap-10">
        <Link href="/" className="flex h-10 items-center">
          <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
        </Link>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 text-ink">Inloggen</h1>
            <p className="text-lead text-muted-foreground">Geen wachtwoord nodig. Je krijgt een code per mail.</p>
          </div>
          <InlogFormulier />
        </section>
      </div>
    </main>
  )
}
