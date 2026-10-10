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
    const { data: zaak } = await admin.from("zaken").select("status").eq("id", zaakId).single()
    const { data: afgerond } = await admin
      .from("zaken")
      .update({ status: "afgerond" })
      .eq("id", zaakId)
      .in("status", ["verstuurd", "akkoord"])
      .select("id")
    // De vorige status bewaren, zodat "Toch niet betaald" hem kan terugzetten.
    if (afgerond?.length) {
      await admin
        .from("events")
        .insert({ user_id: userId, zaak_id: zaakId, naam: "zaak_afgerond", data: { vorige_status: zaak?.status } })
    }
  }
}

// "Toch niet betaald" op Mijn plan: de termijn gaat terug naar nog te betalen.
// Stond de zaak op afgerond, dan gaat hij terug naar de status van daarvoor.
// Al verstuurde of overgeslagen herinneringen blijven zoals ze zijn; wat nog gepland
// staat, gaat gewoon weer weg (de wekker kijkt op de dag zelf of de termijn betaald is).
// Alleen aanroepen nadat is gecontroleerd dat de termijn bij deze gebruiker hoort.
export async function markeerTermijnNietBetaald(termijnId: string, zaakId: string, userId: string) {
  const admin = createAdminClient()

  await admin.from("termijnen").update({ status: "open", betaald_op: null }).eq("id", termijnId).eq("status", "betaald")

  const { data: zaak } = await admin.from("zaken").select("status").eq("id", zaakId).single()
  let teruggezetNaar: string | null = null
  if (zaak?.status === "afgerond") {
    teruggezetNaar = await statusVoorAfronden(zaakId)
    await admin.from("zaken").update({ status: teruggezetNaar }).eq("id", zaakId).eq("status", "afgerond")
  }

  await admin.from("events").insert({
    user_id: userId,
    zaak_id: zaakId,
    naam: "termijn_toch_niet_betaald",
    data: { termijn_id: termijnId, zaak_teruggezet_naar: teruggezetNaar },
  })
}

// De status van een zaak vlak voor hij op afgerond ging.
// Staat dat niet vast (zaken die eerder zijn afgerond), dan de laatst ingevulde reactie,
// en anders "verstuurd" (wacht op reactie).
async function statusVoorAfronden(zaakId: string): Promise<"verstuurd" | "akkoord"> {
  const admin = createAdminClient()
  const { data: events } = await admin
    .from("events")
    .select("naam, data")
    .eq("zaak_id", zaakId)
    .in("naam", ["zaak_afgerond", "reactie_ingevuld"])
    .order("id", { ascending: false })

  const afgerond = events?.find((e) => e.naam === "zaak_afgerond")
  const vorige = (afgerond?.data as { vorige_status?: string } | null)?.vorige_status
  if (vorige === "verstuurd" || vorige === "akkoord") return vorige

  const reactie = (events?.find((e) => e.naam === "reactie_ingevuld")?.data as { reactie?: string } | null)?.reactie
  return reactie === "akkoord" ? "akkoord" : "verstuurd"
}
