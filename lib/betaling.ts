import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { plusDagen, vandaag } from "@/lib/betaalplan"

// Een termijn op "betaald" zetten. Dezelfde logica voor de ja-knop in de mail
// en de knop "Betaald" op Mijn plan. Alleen de server schrijft dit.

// ---------------------------------------------------------------
// Eenmalige codes voor de ja/nee-knoppen in de mail
// ---------------------------------------------------------------

export const TOKEN_GELDIG_DAGEN = 60

// In de mail staat de code zelf. In de database alleen een hash ervan,
// zodat iemand met inzage in de database er niets mee kan.
export function maakToken() {
  const token = randomBytes(32).toString("base64url")
  return { token, hash: hashToken(token) }
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export type TokenInfo =
  | { geldig: false; reden: "onbekend" | "gebruikt" | "verlopen" }
  | {
      geldig: true
      berichtId: string
      termijnId: string
      zaakId: string
      userId: string
      schuldeiser: string
      bedragCenten: number
      vervaldatum: string
      termijnBetaald: boolean
    }

// Zoekt het bericht bij een code uit de mail en zegt of de code nog bruikbaar is.
export async function bekijkToken(token: string): Promise<TokenInfo> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return { geldig: false, reden: "onbekend" }

  const { data: b } = await createAdminClient()
    .from("berichten")
    .select(
      "id, zaak_id, termijn_id, verstuurd_op, token_gebruikt_op, zaken(user_id, schuldeisers(naam)), termijnen(bedrag_centen, vervaldatum, status)"
    )
    .eq("token_hash", hashToken(token))
    .maybeSingle()

  if (!b || !b.termijn_id) return { geldig: false, reden: "onbekend" }
  if (b.token_gebruikt_op) return { geldig: false, reden: "gebruikt" }
  const verstuurd = (b.verstuurd_op ?? "").slice(0, 10)
  if (!verstuurd || plusDagen(verstuurd, TOKEN_GELDIG_DAGEN) < vandaag()) return { geldig: false, reden: "verlopen" }

  const zaak = b.zaken as unknown as { user_id: string; schuldeisers: { naam: string } | null }
  const termijn = b.termijnen as unknown as { bedrag_centen: number; vervaldatum: string; status: string }

  return {
    geldig: true,
    berichtId: b.id,
    termijnId: b.termijn_id,
    zaakId: b.zaak_id,
    userId: zaak.user_id,
    schuldeiser: zaak.schuldeisers?.naam ?? "het bedrijf",
    bedragCenten: termijn.bedrag_centen,
    vervaldatum: termijn.vervaldatum,
    termijnBetaald: termijn.status === "betaald",
  }
}

// "Ja, betaald" vanuit de mail. De code werkt maar één keer: we zetten hem eerst op
// gebruikt (alleen als dat nog niet zo was), en pas daarna de termijn op betaald.
export async function gebruikTokenVoorBetaald(token: string): Promise<{ ok: true } | { ok: false; reden: string }> {
  const info = await bekijkToken(token)
  if (!info.geldig) return { ok: false, reden: info.reden }

  const admin = createAdminClient()
  const { data: geclaimd } = await admin
    .from("berichten")
    .update({ token_gebruikt_op: new Date().toISOString() })
    .eq("id", info.berichtId)
    .is("token_gebruikt_op", null)
    .select("id")
  if (!geclaimd?.length) return { ok: false, reden: "gebruikt" }

  await markeerTermijnBetaald(info.termijnId, info.zaakId, info.userId, "mail")
  return { ok: true }
}

// ---------------------------------------------------------------
// De termijn zelf
// ---------------------------------------------------------------

// Zet een termijn op betaald en legt dat vast in events.
// Zijn daarmee alle termijnen betaald, dan zetten we de zaak op "afgerond".
// Alleen aanroepen nadat is gecontroleerd dat de termijn bij deze gebruiker hoort.
export async function markeerTermijnBetaald(
  termijnId: string,
  zaakId: string,
  userId: string,
  bron: "mail" | "mijn_plan"
) {
  const admin = createAdminClient()

  await admin
    .from("termijnen")
    .update({ status: "betaald", betaald_op: new Date().toISOString() })
    .eq("id", termijnId)
    .neq("status", "betaald")

  await admin.from("events").insert({ user_id: userId, zaak_id: zaakId, naam: "termijn_betaald", data: { termijn_id: termijnId, bron } })

  // Alles betaald? Dan is het plan klaar.
  const { data: plan } = await admin
    .from("betaalplannen")
    .select("termijnen(status)")
    .eq("zaak_id", zaakId)
    .order("versie", { ascending: false })
    .limit(1)
    .single()
  const alles = plan?.termijnen ?? []
  if (alles.length && alles.every((t) => t.status === "betaald")) {
    await admin.from("zaken").update({ status: "afgerond" }).eq("id", zaakId).in("status", ["verstuurd", "akkoord"])
  }
}
