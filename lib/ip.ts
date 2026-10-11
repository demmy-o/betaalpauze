import { createHash } from "node:crypto"

// Het IP-adres van de bezoeker, voor limieten tegen spam. We bewaren nooit het adres zelf,
// alleen een hash met een geheim zout (IP_ZOUT). Zonder het zout kun je de hash niet
// terugrekenen naar een IP-adres, ook niet door alle adressen te proberen.

type Headers = { get(naam: string): string | null }

// Op Netlify staat het echte adres van de bezoeker in x-nf-client-connection-ip.
// Daarna proberen we x-forwarded-for (het eerste adres is de bezoeker).
export function leesIp(kop: Headers): string {
  const netlify = kop.get("x-nf-client-connection-ip")?.trim()
  if (netlify) return netlify
  const doorgestuurd = kop.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (doorgestuurd) return doorgestuurd
  return "onbekend"
}

export function hashIp(ip: string, zout: string): string {
  if (!zout) throw new Error("IP_ZOUT ontbreekt")
  return createHash("sha256").update(`${zout}|${ip}`).digest("hex")
}
