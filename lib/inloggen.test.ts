import { describe, expect, it } from "vitest"
import { komtUitAanvraag, naInloggen } from "./inloggen"

describe("waar je heen gaat na het inloggen", () => {
  it("gaat terug naar de stap in de aanvraag", () => {
    expect(naInloggen("/aanvragen?stap=2")).toBe("/aanvragen?stap=2")
    expect(naInloggen("/aanvragen/abc/voorstel")).toBe("/aanvragen/abc/voorstel")
    expect(naInloggen("/mijn-plan")).toBe("/mijn-plan")
  })

  it("gaat zonder adres naar Mijn plan", () => {
    expect(naInloggen(undefined)).toBe("/mijn-plan")
    expect(naInloggen(null)).toBe("/mijn-plan")
    expect(naInloggen("")).toBe("/mijn-plan")
  })

  it("stuurt nooit naar een ander adres", () => {
    for (const vreemd of ["//evil.nl", "https://evil.nl", "evil.nl", "/\\evil.nl", "/partners", "/aanvragenx", "/inloggen"]) {
      expect(naInloggen(vreemd)).toBe("/mijn-plan")
    }
  })

  it("weet of je uit de aanvraag komt", () => {
    expect(komtUitAanvraag("/aanvragen?stap=3")).toBe(true)
    expect(komtUitAanvraag("/mijn-plan")).toBe(false)
    expect(komtUitAanvraag("//evil.nl")).toBe(false)
  })
})
