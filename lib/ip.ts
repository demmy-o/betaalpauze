import { createHash } from "node:crypto"
import { isIP } from "node:net"

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

// Welk adres telt voor een limiet. Bij IPv6 wisselt een apparaat vaak van adres (privacy-adressen), maar
// het netwerk (de eerste 64 bits, /64) blijft hetzelfde. Daarom tellen we bij IPv6 alleen het /64-netwerk.
// IPv4 blijft zoals het is. Een IPv4-adres in IPv6-vorm (::ffff:1.2.3.4) telt als dat IPv4-adres.
export function ipVoorLimiet(ip: string): string {
  const schoon = ip.trim().split("%")[0] // zone-aanduiding (fe80::1%eth0) weg
  if (isIP(schoon) !== 6) return schoon

  const ingepakt = schoon.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
  if (ingepakt) return ingepakt[1]

  // "::" staat voor een reeks blokken met nullen. Vul die aan tot 8 blokken.
  const [voor, na] = schoon.includes("::") ? schoon.split("::") : [schoon, undefined]
  const blokken = (deel?: string) => (deel ? deel.split(":") : [])
  const begin = blokken(voor)
  const eind = blokken(na).flatMap((b) => (b.includes(".") ? ["0", "0"] : [b])) // IPv4 achteraan telt als 2 blokken
  const nullen = na === undefined ? [] : Array(8 - begin.length - eind.length).fill("0")
  const alle = [...begin, ...nullen, ...eind]

  const netwerk = alle.slice(0, 4).map((b) => parseInt(b || "0", 16).toString(16))
  return `${netwerk.join(":")}::/64`
}
