import { afterEach, describe, expect, it, vi } from "vitest"
import { betaWeigert, schuldeiserWeigert, testversieRegel, verstuurMail } from "./verstuur"
import { magMailen } from "./mail"

const beheer = "beheer@betaalpauze.nl"

const naarBedrijf = {
  soort: "schuldeiser" as const,
  vanNaam: "Sanne via Betaalpauze",
  vanAdres: "voorstel@betaalpauze.nl",
  aan: "klant@bedrijf.nl",
  onderwerp: "Betalingsvoorstel",
  react: null as never,
  tekst: "",
}

describe("mail naar een schuldeiser alleen met MAIL_ECHT=true", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("weigert zonder MAIL_ECHT, en alleen een schuldeiser", () => {
    expect(schuldeiserWeigert("schuldeiser", undefined)).not.toBeNull()
    expect(schuldeiserWeigert("schuldeiser", "")).not.toBeNull()
    expect(schuldeiserWeigert("schuldeiser", "TRUE")).not.toBeNull()
    expect(schuldeiserWeigert("schuldeiser", "true")).toBeNull()
    expect(schuldeiserWeigert("gebruiker", undefined)).toBeNull()
    expect(schuldeiserWeigert("beheer", undefined)).toBeNull()
  })

  it("testmodus uit, bèta uit, MAIL_ECHT ontbreekt: niets naar het bedrijf", async () => {
    vi.stubEnv("MAIL_TEST_MODE", "false")
    vi.stubEnv("MAIL_BETA", "false")
    delete process.env.MAIL_ECHT
    expect(await verstuurMail(naarBedrijf)).toEqual({ fout: "Mail naar een schuldeiser kan alleen met MAIL_ECHT=true." })
  })

  it("weigert ook in testmodus, en ook als alles leeg is", async () => {
    delete process.env.MAIL_ECHT
    vi.stubEnv("MAIL_TEST_MODE", "true")
    expect(await verstuurMail(naarBedrijf)).toHaveProperty("fout")
    vi.stubEnv("MAIL_TEST_MODE", "")
    vi.stubEnv("MAIL_BETA", "")
    expect(await verstuurMail(naarBedrijf)).toHaveProperty("fout")
  })

  it("weigert in de bètaversie, ook met MAIL_ECHT=true", async () => {
    vi.stubEnv("MAIL_ECHT", "true")
    vi.stubEnv("MAIL_BETA", "true")
    expect(await verstuurMail(naarBedrijf)).toEqual({ fout: "In de bètaversie gaat er nooit mail naar een schuldeiser." })
  })
})

describe("bètaversie: nooit mail naar een schuldeiser", () => {
  it("weigert elke mail voor een schuldeiser", () => {
    expect(betaWeigert({ soort: "schuldeiser", aan: "klant@bedrijf.nl" }, beheer)).toMatch(/nooit mail naar een schuldeiser/)
  })

  it("laat mail voor de gebruiker door", () => {
    expect(betaWeigert({ soort: "gebruiker", aan: "sanne@voorbeeld.nl" }, beheer)).toBeNull()
  })

  it("laat mail voor beheer alleen door naar NOTIFY_EMAIL, zonder cc", () => {
    expect(betaWeigert({ soort: "beheer", aan: "BEHEER@betaalpauze.nl" }, beheer)).toBeNull()
    expect(betaWeigert({ soort: "beheer", aan: "klant@bedrijf.nl" }, beheer)).not.toBeNull()
    expect(betaWeigert({ soort: "beheer", aan: beheer, cc: "klant@bedrijf.nl" }, beheer)).not.toBeNull()
    expect(betaWeigert({ soort: "beheer", aan: beheer }, undefined)).not.toBeNull()
  })
})

describe("verstuurMail met MAIL_BETA", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("stuurt niets naar een schuldeiser, ook niet in testmodus", async () => {
    vi.stubEnv("MAIL_BETA", "true")
    vi.stubEnv("MAIL_ECHT", "true")
    for (const testmodus of ["true", "false"]) {
      vi.stubEnv("MAIL_TEST_MODE", testmodus)
      expect(await verstuurMail(naarBedrijf)).toEqual({ fout: "In de bètaversie gaat er nooit mail naar een schuldeiser." })
    }
  })
})

describe("de regel bovenaan de testbrief", () => {
  it("noemt het bedrijf", () => {
    expect(testversieRegel("Vattenfall")).toBe("Testversie: deze brief is niet naar Vattenfall gestuurd.")
  })
})

describe("inlogcode sturen", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("mag in de bètaversie naar elk adres", () => {
    vi.stubEnv("MAIL_BETA", "true")
    vi.stubEnv("MAIL_TEST_MODE", "true")
    vi.stubEnv("MAIL_TEST_ADDRESS", "test@demmyonink.nl")
    expect(magMailen("sanne@voorbeeld.nl")).toBe(true)
  })

  it("mag in testmodus zonder bèta alleen naar het testadres", () => {
    vi.stubEnv("MAIL_BETA", "")
    vi.stubEnv("MAIL_TEST_MODE", "true")
    vi.stubEnv("MAIL_TEST_ADDRESS", "test@demmyonink.nl")
    expect(magMailen("sanne@voorbeeld.nl")).toBe(false)
    expect(magMailen("test+1@demmyonink.nl")).toBe(true)
  })
})
