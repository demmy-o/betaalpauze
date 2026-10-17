import { describe, expect, it } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import { MAX_PER_BEZOEKER_PER_UUR, MAX_TOTAAL_PER_UUR, magAanmelden } from "./partnerLimiet"

// Nep-database met aanmeldingen van het afgelopen uur: per ip_hash een aantal.
function nepDatabase(perHash: Record<string, number>, kapot = false) {
  const telling = (filters: Record<string, string>) => {
    if (kapot) return { count: null, error: { message: "stuk" } }
    const aantal = filters.ip_hash
      ? perHash[filters.ip_hash] ?? 0
      : Object.values(perHash).reduce((som, n) => som + n, 0)
    return { count: aantal, error: null }
  }
  const vraag = (filters: Record<string, string> = {}) => ({
    eq: (kolom: string, waarde: string) => vraag({ ...filters, [kolom]: waarde }),
    gte: () => Promise.resolve(telling(filters)),
  })
  return { from: () => ({ select: () => vraag() }) } as unknown as SupabaseClient
}

describe("limieten op aanmeldingen via /partners", () => {
  it("staat 5 per bezoeker en 20 in totaal per uur toe", () => {
    expect(MAX_PER_BEZOEKER_PER_UUR).toBe(5)
    expect(MAX_TOTAAL_PER_UUR).toBe(20)
  })

  it("laat een nieuwe bezoeker door", async () => {
    expect(await magAanmelden(nepDatabase({}), "a")).toBe(true)
  })

  it("stopt een bezoeker na 5 aanmeldingen in een uur", async () => {
    expect(await magAanmelden(nepDatabase({ a: 4 }), "a")).toBe(true)
    expect(await magAanmelden(nepDatabase({ a: 5 }), "a")).toBe(false)
  })

  it("stopt iedereen na 20 aanmeldingen in een uur, ook bezoekers met een nieuw adres", async () => {
    const vol = nepDatabase({ a: 5, b: 5, c: 5, d: 5 })
    expect(await magAanmelden(vol, "nieuw")).toBe(false)
    expect(await magAanmelden(nepDatabase({ a: 5, b: 5, c: 5, d: 4 }), "nieuw")).toBe(true)
  })

  it("vangt de test van de deploy preview: 3 + 3 vanaf twee adressen gaat nog door, het vangnet ligt bij 20", async () => {
    expect(await magAanmelden(nepDatabase({ ipv4: 3, ipv6: 3 }), "ipv6")).toBe(true)
  })

  it("slaat niets op als het tellen niet lukt", async () => {
    expect(await magAanmelden(nepDatabase({}, true), "a")).toBe(false)
  })
})
