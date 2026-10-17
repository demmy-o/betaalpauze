import { describe, expect, it } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import { KVK_DAGLIMIET, reserveerBetaaldeOpvraging } from "./kvkLimiet"

// Nep-database: telt net als de functie kvk_reserveer_opvraging.
function nepDatabase(beginAantal = 0, kapot = false) {
  let aantal = beginAantal
  const aanroepen: unknown[] = []
  const client = {
    rpc: async (naam: string, args: { maximum: number }) => {
      aanroepen.push({ naam, args })
      if (kapot) return { data: null, error: { message: "stuk" } }
      if (aantal >= args.maximum) return { data: false, error: null }
      aantal++
      return { data: true, error: null }
    },
  } as unknown as SupabaseClient
  return { client, aanroepen, aantal: () => aantal }
}

describe("daglimiet voor betaalde KVK-opvragingen", () => {
  it("staat 100 per dag toe", () => {
    expect(KVK_DAGLIMIET).toBe(100)
  })

  it("laat opvragingen door tot de limiet, daarna niet meer", async () => {
    const db = nepDatabase(98)
    expect(await reserveerBetaaldeOpvraging(db.client)).toBe(true)
    expect(await reserveerBetaaldeOpvraging(db.client)).toBe(true)
    expect(await reserveerBetaaldeOpvraging(db.client)).toBe(false)
    expect(db.aantal()).toBe(100)
    expect(db.aanroepen[0]).toEqual({ naam: "kvk_reserveer_opvraging", args: { maximum: 100 } })
  })

  it("vraagt niets op als het tellen niet lukt", async () => {
    const db = nepDatabase(0, true)
    expect(await reserveerBetaaldeOpvraging(db.client)).toBe(false)
  })
})
