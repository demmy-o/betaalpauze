import { describe, expect, it } from "vitest"
import { rekenPlan } from "./betaalplan"
import { briefAlsTekst as alsTekst, maakBrief, type BriefGegevens } from "./brief"

// Bedragen hebben een vaste spatie na het €-teken. Voor het vergelijken maken we er een gewone spatie van.
const briefAlsTekst = (...args: Parameters<typeof alsTekst>) => alsTekst(...args).replace(/\u00a0/g, " ")

const basis: Omit<BriefGegevens, "plan"> = {
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
}

const termijnen = rekenPlan({ soort: "termijnen", bedragCenten: 38995, startdatum: "2026-10-10", aantalTermijnen: 3 })

describe("brief", () => {
  it("bevat alle verplichte onderdelen uit hoofdstuk 8", () => {
    const tekst = briefAlsTekst(maakBrief({ ...basis, plan: termijnen }))
    expect(tekst).toContain("D-4471") // factuurnummer
    expect(tekst).toContain("K-102") // klantnummer
    expect(tekst).not.toContain("erken") // bewust geen erkenning (besluit Demmy, 10 okt 2026)
    expect(tekst).toContain("geen extra kosten") // geen kosten of incasso
    expect(tekst).toContain("incassobureau")
    expect(tekst).toContain("24 oktober 2026") // reactie binnen 14 dagen
    expect(tekst).toContain("pas een afspraak als u ermee akkoord gaat")
  })

  it("zet het klantnummer ook in het onderwerp", () => {
    const brief = maakBrief({ ...basis, plan: termijnen })
    expect(brief.onderwerp).toBe("Betalingsvoorstel voor factuur D-4471, klantnummer K-102")
    const zonder = maakBrief({ ...basis, factuur: { ...basis.factuur, klantnummer: undefined }, plan: termijnen })
    expect(zonder.onderwerp).toBe("Betalingsvoorstel voor factuur D-4471")
  })

  it("zegt wanneer de gebruiker begint als er geen reactie komt", () => {
    const tekst = briefAlsTekst(maakBrief({ ...basis, plan: termijnen }))
    expect(tekst).toContain("Hoor ik niets, dan begin ik op 10 november 2026 toch met betalen volgens dit voorstel.")
  })

  it("noemt elke termijn met datum en exact bedrag", () => {
    const tekst = briefAlsTekst(maakBrief({ ...basis, plan: termijnen }))
    expect(tekst).toContain("10 november 2026: € 129,98")
    expect(tekst).toContain("10 december 2026: € 129,98")
    expect(tekst).toContain("10 januari 2027: € 129,99")
  })

  it("laat het klantnummer en de toelichting weg als ze leeg zijn", () => {
    const tekst = briefAlsTekst(
      maakBrief({ ...basis, factuur: { ...basis.factuur, klantnummer: undefined }, plan: termijnen, toelichting: "  " })
    )
    expect(tekst).not.toContain("klantnummer")
    expect(tekst).not.toContain("licht ik mijn situatie")
  })

  it("zet de eigen toelichting in de brief", () => {
    const tekst = briefAlsTekst(maakBrief({ ...basis, plan: termijnen, toelichting: "Ik ben net mijn baan kwijt." }))
    expect(tekst).toContain("Ik ben net mijn baan kwijt.")
  })

  it("beschrijft een pauze met één betaling", () => {
    const plan = rekenPlan({ soort: "pauze", bedragCenten: 38995, startdatum: "2026-10-10", pauzeMaanden: 2 })
    const tekst = briefAlsTekst(maakBrief({ ...basis, plan }))
    expect(tekst).toContain("betaalpauze van 2 maanden")
    expect(tekst).toContain("Op 10 december 2026 betaal ik het volledige bedrag van € 389,95 in één keer")
  })
})
