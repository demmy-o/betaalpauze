"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Kopbalk } from "@/components/ui/kopbalk"
import { AANTAL_STAPPEN } from "./onderdelen"

// De kopbalk van de aanvraagflow. Leest uit de adresbalk bij welke stap je bent:
// /aanvragen?stap=N is stap N, /voorstel is stap 5, /brief is stap 6, /verstuurd is klaar.
// Rechts: "Inloggen" (daarna terug naar deze stap) of, als je al ingelogd bent, "Mijn plan".
export function FlowKop({ ingelogd }: { ingelogd: boolean }) {
  const pad = usePathname()
  const zoek = useSearchParams()

  let stap = 0
  if (pad === "/aanvragen") stap = Number(zoek.get("stap") ?? "0") || 0
  else if (pad.endsWith("/voorstel")) stap = 5
  else if (pad.endsWith("/brief")) stap = 6
  else if (pad.endsWith("/verstuurd")) stap = AANTAL_STAPPEN

  const hier = zoek.size ? `${pad}?${zoek.toString()}` : pad
  const knop = buttonVariants({ variant: "tertiair", size: "klein" })

  return (
    <Kopbalk
      gezicht
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
