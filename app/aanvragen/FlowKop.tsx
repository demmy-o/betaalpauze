"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Kopbalk } from "@/components/ui/kopbalk"
import { AANTAL_STAPPEN, SCHERMEN, stapNummer, type Scherm } from "./schermen"

// De kopbalk van de aanvraagflow. Leest uit de adresbalk op welk scherm je bent (zie schermen.ts):
// /aanvragen?stap=<scherm>, /voorstel?deel=<scherm>, /brief?deel=<scherm>, en /verstuurd is klaar.
// Rechts: "Inloggen" (daarna terug naar dit scherm) of, als je al ingelogd bent, "Mijn plan".
export function FlowKop({ ingelogd }: { ingelogd: boolean }) {
  const pad = usePathname()
  const zoek = useSearchParams()

  let stap = 0
  if (pad === "/aanvragen") stap = nummer(zoek.get("stap"), "klopt")
  else if (pad.endsWith("/voorstel")) stap = nummer(zoek.get("deel"), "voorstel-soort")
  else if (pad.endsWith("/brief")) stap = nummer(zoek.get("deel"), "toelichting")
  else if (pad.endsWith("/verstuurd")) stap = AANTAL_STAPPEN

  const hier = zoek.size ? `${pad}?${zoek.toString()}` : pad
  const knop = buttonVariants({ variant: "tertiair", size: "klein" })

  return (
    <Kopbalk
      voortgang={stap / AANTAL_STAPPEN}
      label={stap === 0 ? "Nog niet begonnen" : `Stap ${Math.min(stap, AANTAL_STAPPEN)} van ${AANTAL_STAPPEN}`}
      rechts={
        ingelogd ? (
          <Link href="/mijn-plan" className={knop}>
            Mijn plan
          </Link>
        ) : (
          <Link href={`/inloggen?terug=${encodeURIComponent(hier)}`} className={knop}>
            Inloggen
          </Link>
        )
      }
    />
  )
}

// Het nummer van een scherm uit de adresbalk. Onbekend of leeg: het eerste scherm van die pagina.
function nummer(naam: string | null, standaard: Scherm) {
  const scherm = SCHERMEN.find((s) => s === naam) ?? standaard
  return stapNummer(scherm)
}
