import { describe, expect, it } from "vitest"
import { berekenBerichten } from "./herinneringen"

const termijnen = [
  { id: "t1", volgnummer: 1, vervaldatum: "2026-11-10" },
  { id: "t2", volgnummer: 2, vervaldatum: "2026-12-10" },
]

describe("herinneringen inplannen", () => {
  const berichten = berekenBerichten("2026-10-10", termijnen)

  it("plant de reactiecheck 14 dagen na versturen", () => {
    expect(berichten.filter((b) => b.stap === "reactie_check")).toEqual([
      { stap: "reactie_check", template: "al-reactie", kanaal: "email", gepland_op: "2026-10-24", termijn_id: null },
    ])
  })

  it("plant per termijn een herinnering vooraf, op de dag en een check erna", () => {
    const voorT1 = berichten.filter((b) => b.termijn_id === "t1" && b.stap !== "afsluiting")
    expect(voorT1.map((b) => [b.stap, b.gepland_op])).toEqual([
      ["herinnering_vooraf", "2026-11-07"],
      ["herinnering_dag", "2026-11-10"],
      ["checkin", "2026-11-12"],
    ])
    expect(berichten.filter((b) => b.termijn_id === "t2" && b.stap !== "afsluiting")).toHaveLength(3)
  })

  it("plant de afsluiting drie dagen na de laatste termijn, na de laatste check", () => {
    expect(berichten.filter((b) => b.stap === "afsluiting")).toEqual([
      { stap: "afsluiting", template: "klaar", kanaal: "email", gepland_op: "2026-12-13", termijn_id: "t2" },
    ])
    const laatsteCheck = berichten.filter((b) => b.stap === "checkin").at(-1)!
    expect(laatsteCheck.gepland_op < "2026-12-13").toBe(true)
  })

  it("zet alles op volgorde van datum", () => {
    const datums = berichten.map((b) => b.gepland_op)
    expect(datums).toEqual([...datums].sort())
    expect(berichten).toHaveLength(1 + 2 * 3 + 1)
  })

  it("slaat berichten over die vóór de verzenddag zouden vallen", () => {
    const vroeg = berekenBerichten("2026-11-09", termijnen)
    expect(vroeg.find((b) => b.stap === "herinnering_vooraf" && b.termijn_id === "t1")).toBeUndefined()
    expect(vroeg.find((b) => b.stap === "herinnering_dag" && b.termijn_id === "t1")).toBeDefined()
  })

  it("werkt ook bij één betaling (pauze)", () => {
    const pauze = berekenBerichten("2026-10-10", [{ id: "p1", volgnummer: 1, vervaldatum: "2026-12-10" }])
    expect(pauze.map((b) => b.stap)).toEqual([
      "reactie_check",
      "herinnering_vooraf",
      "herinnering_dag",
      "checkin",
      "afsluiting",
    ])
  })
})
