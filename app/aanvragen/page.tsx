import { Suspense } from "react"
import Image from "next/image"
import { Aanvraag } from "./Aanvraag"

export const metadata = {
  title: "Betaalpauze aanvragen · Betaalpauze.nl",
}

// De aanvraag heeft geen hoofdmenu: alleen het logo, zodat je niet per ongeluk uit de flow klikt.
export default function AanvragenPagina() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-form flex-col gap-8">
        <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
        <Suspense>
          <Aanvraag />
        </Suspense>
      </div>
    </main>
  )
}
