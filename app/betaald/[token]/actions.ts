"use server"

import { gebruikTokenVoorBetaald } from "@/lib/betaling"

// De knop "Ja, ik heb betaald" op de pagina achter de mail.
export async function bevestigBetaald(token: string): Promise<{ ok: true } | { ok: false; reden: string }> {
  return gebruikTokenVoorBetaald(token)
}
