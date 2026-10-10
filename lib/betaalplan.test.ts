import { describe, expect, it } from "vitest"
import { controleer, euro, datumLang, plusMaanden, rekenPlan } from "./betaalplan"

const som = (plan: ReturnType<typeof rekenPlan>) => plan.termijnen.reduce((t, x) => t + x.bedragCenten, 0)

describe("pauze", () => {
  it("betaalt alles in één keer na de pauze", () => {
    const plan = rekenPlan({ soort: "pauze", bedragCenten: 24850, startdatum: "2026-10-10", pauzeMaanden: 2 })
    expect(plan.termijnen).toEqual([{ volgnummer: 1, vervaldatum: "2026-12-10", bedragCenten: 24850 }])
    expect(plan.pauzeTot).toBe("2026-12-10")
    expect(plan.einddatum).toBe("2026-12-10")
  })

  it("staat maximaal 3 maanden pauze toe", () => {
    expect(() => rekenPlan({ soort: "pauze", bedragCenten: 100, startdatum: "2026-10-10", pauzeMaanden: 4 })).toThrow()
    expect(() => rekenPlan({ soort: "pauze", bedragCenten: 100, startdatum: "2026-10-10", pauzeMaanden: 0 })).toThrow()
  })
})

describe("termijnen", () => {
  it("verdeelt een rond bedrag in gelijke termijnen, eerste na een maand", () => {
    const plan = rekenPlan({ soort: "termijnen", bedragCenten: 30000, startdatum: "2026-10-10", aantalTermijnen: 3 })
    expect(plan.termijnen.map((t) => t.bedragCenten)).toEqual([10000, 10000, 10000])
    expect(plan.termijnen.map((t) => t.vervaldatum)).toEqual(["2026-11-10", "2026-12-10", "2027-01-10"])
    expect(plan.einddatum).toBe("2027-01-10")
    expect(plan.pauzeTot).toBeUndefined()
  })

  it("laat de laatste termijn het afrondingsverschil opvangen", () => {
    const plan = rekenPlan({ soort: "termijnen", bedragCenten: 10000, startdatum: "2026-10-10", aantalTermijnen: 3 })
    expect(plan.termijnen.map((t) => t.bedragCenten)).toEqual([3333, 3333, 3334])
    expect(som(plan)).toBe(10000)
  })

  it("klopt altijd tot op de cent", () => {
    for (const bedrag of [1, 99, 12345, 124850, 38995, 999999]) {
      for (let n = 2; n <= 12; n++) {
        if (bedrag < n) continue
        const plan = rekenPlan({ soort: "termijnen", bedragCenten: bedrag, startdatum: "2026-01-31", aantalTermijnen: n })
        expect(som(plan)).toBe(bedrag)
        expect(plan.termijnen).toHaveLength(n)
        // Geen termijn is kleiner dan de andere, behalve dat de laatste iets groter kan zijn.
        const eerste = plan.termijnen[0].bedragCenten
        expect(plan.termijnen.every((t) => t.bedragCenten >= eerste)).toBe(true)
        expect(plan.termijnen[n - 1].bedragCenten - eerste).toBeLessThan(n)
      }
    }
  })

  it("staat 2 tot en met 12 termijnen toe", () => {
    expect(controleer({ soort: "termijnen", bedragCenten: 10000, startdatum: "2026-10-10", aantalTermijnen: 12 })).toBeNull()
    expect(controleer({ soort: "termijnen", bedragCenten: 10000, startdatum: "2026-10-10", aantalTermijnen: 13 })).not.toBeNull()
    expect(controleer({ soort: "termijnen", bedragCenten: 10000, startdatum: "2026-10-10", aantalTermijnen: 1 })).not.toBeNull()
  })

  it("weigert meer termijnen dan centen", () => {
    expect(controleer({ soort: "termijnen", bedragCenten: 5, startdatum: "2026-10-10", aantalTermijnen: 6 })).not.toBeNull()
  })
})

describe("pauze en termijnen", () => {
  it("begint met termijnen direct na de pauze", () => {
    const plan = rekenPlan({
      soort: "pauze_en_termijnen",
      bedragCenten: 124850,
      startdatum: "2026-10-10",
      pauzeMaanden: 3,
      aantalTermijnen: 4,
    })
    expect(plan.termijnen.map((t) => t.vervaldatum)).toEqual(["2027-01-10", "2027-02-10", "2027-03-10", "2027-04-10"])
    expect(plan.termijnen.map((t) => t.bedragCenten)).toEqual([31212, 31212, 31212, 31214])
    expect(plan.pauzeTot).toBe("2027-01-10")
    expect(som(plan)).toBe(124850)
  })

  it("vraagt zowel een geldige pauze als geldige termijnen", () => {
    const basis = { soort: "pauze_en_termijnen" as const, bedragCenten: 10000, startdatum: "2026-10-10" }
    expect(controleer({ ...basis, pauzeMaanden: 2 })).not.toBeNull()
    expect(controleer({ ...basis, aantalTermijnen: 3 })).not.toBeNull()
    expect(controleer({ ...basis, pauzeMaanden: 2, aantalTermijnen: 3 })).toBeNull()
  })
})

describe("datums", () => {
  it("valt terug op de laatste dag van een kortere maand", () => {
    expect(plusMaanden("2026-01-31", 1)).toBe("2026-02-28")
    expect(plusMaanden("2028-01-31", 1)).toBe("2028-02-29") // schrikkeljaar
    expect(plusMaanden("2026-08-31", 1)).toBe("2026-09-30")
  })

  it("gaat goed over de jaargrens", () => {
    expect(plusMaanden("2026-11-15", 3)).toBe("2027-02-15")
    expect(plusMaanden("2026-12-01", 12)).toBe("2027-12-01")
  })

  it("houdt elke termijn op dezelfde dag als dat kan", () => {
    const plan = rekenPlan({ soort: "termijnen", bedragCenten: 40000, startdatum: "2026-12-31", aantalTermijnen: 4 })
    expect(plan.termijnen.map((t) => t.vervaldatum)).toEqual(["2027-01-31", "2027-02-28", "2027-03-31", "2027-04-30"])
  })
})

describe("weergave", () => {
  it("schrijft bedragen en datums in het Nederlands", () => {
    expect(euro(124850).replace(/\s/g, " ")).toBe("€ 1.248,50")
    expect(datumLang("2026-10-15")).toBe("15 oktober 2026")
  })
})
