"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { BETA_COOKIE, BETA_DAGEN, gelijk, maakToegangsCode, veiligTerug } from "@/lib/beta"

export type BetaStand = { fout?: string }

// Controleert het wachtwoord voor de bètaversie en zet de cookie (lib/beta.ts).
export async function geefToegang(_vorige: BetaStand, formData: FormData): Promise<BetaStand> {
  const wachtwoord = process.env.BETA_WACHTWOORD
  if (!wachtwoord) return { fout: "De bètaversie is nu gesloten." }

  const ingevuld = String(formData.get("wachtwoord") ?? "")
  if (!ingevuld) return { fout: "Vul het wachtwoord in." }

  const goed = gelijk(await maakToegangsCode(ingevuld), await maakToegangsCode(wachtwoord))
  if (!goed) {
    // Een seconde wachten maakt raden met een script een stuk trager.
    await new Promise((klaar) => setTimeout(klaar, 1000))
    return { fout: "Dit wachtwoord klopt niet. Check of je geen typefout hebt gemaakt." }
  }

  ;(await cookies()).set(BETA_COOKIE, await maakToegangsCode(wachtwoord), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BETA_DAGEN * 24 * 60 * 60,
  })
  redirect(veiligTerug(String(formData.get("terug") ?? "")))
}
