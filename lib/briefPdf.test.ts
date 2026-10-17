import { describe, expect, it } from "vitest"
import { rekenPlan } from "./betaalplan"
import { maakBrief } from "./brief"
import { maakPdf, probeerPdf } from "./briefPdf"

const brief = maakBrief({
  afzender: {
    voornaam: "Sanne",
    achternaam: "de Vries",
    straat: "Kerkstraat 12",
    postcode: "3511 AB",
    plaats: "Utrecht",
    email: "sanne@voorbeeld.nl",
  },
  schuldeiser: { naam: "Test EMZ Dagobert", straat: "Abebe Bikilalaan 17", postcode: "1034 WL", plaats: "Amsterdam" },
  factuur: { factuurnummer: "D-4471", factuurdatum: "2026-09-30", bedragCenten: 38995, klantnummer: "K-102" },
  datum: "2026-10-10",
  plan: rekenPlan({ soort: "termijnen", bedragCenten: 38995, startdatum: "2026-10-10", aantalTermijnen: 3 }),
})

describe("de brief als PDF", () => {
  it("maakt een echte PDF", async () => {
    const pdf = await maakPdf(brief)
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-")
    expect(pdf.length).toBeGreaterThan(1000)
  }, 20000)

  it("geeft via probeerPdf dezelfde PDF, of null als het niet lukt", async () => {
    const pdf = await probeerPdf(brief, "Testversie: deze brief is niet naar Test EMZ Dagobert gestuurd.")
    expect(pdf?.subarray(0, 5).toString()).toBe("%PDF-")
  }, 20000)
})
