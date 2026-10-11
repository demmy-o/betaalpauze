import { describe, expect, it } from "vitest"
import { hashIp, leesIp } from "./ip"

const kop = (waarden: Record<string, string>) => ({ get: (naam: string) => waarden[naam] ?? null })

describe("IP-adres lezen", () => {
  it("gebruikt eerst het adres dat Netlify doorgeeft", () => {
    expect(leesIp(kop({ "x-nf-client-connection-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe(
      "203.0.113.7"
    )
  })

  it("valt terug op het eerste adres in x-forwarded-for", () => {
    expect(leesIp(kop({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" }))).toBe("198.51.100.1")
  })

  it("geeft 'onbekend' als er niets is", () => {
    expect(leesIp(kop({}))).toBe("onbekend")
    expect(leesIp(kop({ "x-nf-client-connection-ip": "  " }))).toBe("onbekend")
  })
})

describe("IP-adres hashen", () => {
  it("geeft voor hetzelfde adres en zout steeds dezelfde hash", () => {
    expect(hashIp("203.0.113.7", "zout-a")).toBe(hashIp("203.0.113.7", "zout-a"))
  })

  it("geeft met een ander zout een andere hash", () => {
    expect(hashIp("203.0.113.7", "zout-a")).not.toBe(hashIp("203.0.113.7", "zout-b"))
  })

  it("bevat het IP-adres zelf niet", () => {
    const hash = hashIp("203.0.113.7", "zout-a")
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain("203.0.113.7")
  })

  it("weigert te hashen zonder zout", () => {
    expect(() => hashIp("203.0.113.7", "")).toThrow()
  })
})
