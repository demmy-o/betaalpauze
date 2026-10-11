import { describe, expect, it } from "vitest"
import { gelijk, heeftToegang, isAfgeschermd, maakToegangsCode, nietIndexeren, veiligTerug } from "./beta"

describe("welke pagina's achter het wachtwoord zitten", () => {
  it("schermt de app af", () => {
    for (const pad of ["/aanvragen", "/aanvragen/abc/brief", "/mijn-plan", "/inloggen", "/api/kvk", "/api/kvk/adres"]) {
      expect(isAfgeschermd(pad)).toBe(true)
    }
  })

  it("laat de open pagina's open", () => {
    for (const pad of ["/", "/partners", "/beta", "/betaald/abc", "/api/wekker", "/aanvragenx", "/mijn-planning"]) {
      expect(isAfgeschermd(pad)).toBe(false)
    }
  })

  it("zet noindex op de app, /beta en /betaald, niet op de open pagina's", () => {
    expect(nietIndexeren("/mijn-plan")).toBe(true)
    expect(nietIndexeren("/beta")).toBe(true)
    expect(nietIndexeren("/betaald/abc")).toBe(true)
    expect(nietIndexeren("/")).toBe(false)
    expect(nietIndexeren("/partners")).toBe(false)
  })
})

describe("terug na het wachtwoord", () => {
  it("gaat terug naar de pagina binnen de bètaversie", () => {
    expect(veiligTerug("/mijn-plan")).toBe("/mijn-plan")
    expect(veiligTerug("/aanvragen?stap=2")).toBe("/aanvragen?stap=2")
  })

  it("gaat nooit naar een andere site of een open pagina", () => {
    for (const terug of [null, "", "https://kwaad.nl", "//kwaad.nl", "/\\kwaad.nl", "/partners", "/api/kvk", "mijn-plan"]) {
      expect(veiligTerug(terug)).toBe("/aanvragen")
    }
  })
})

describe("de toegangscode in de cookie", () => {
  it("klopt alleen met hetzelfde wachtwoord", async () => {
    const code = await maakToegangsCode("geheim-1")
    expect(code).toMatch(/^[0-9a-f]{64}$/)
    expect(code).not.toContain("geheim-1")
    expect(await heeftToegang(code, "geheim-1")).toBe(true)
    expect(await heeftToegang(code, "geheim-2")).toBe(false)
  })

  it("geeft geen toegang zonder cookie of zonder wachtwoord in de env", async () => {
    expect(await heeftToegang(undefined, "geheim-1")).toBe(false)
    expect(await heeftToegang(await maakToegangsCode("x"), "")).toBe(false)
  })

  it("vergelijkt teken voor teken", () => {
    expect(gelijk("abc", "abc")).toBe(true)
    expect(gelijk("abc", "abd")).toBe(false)
    expect(gelijk("abc", "abcd")).toBe(false)
  })
})
