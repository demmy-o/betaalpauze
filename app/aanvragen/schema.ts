import { z } from "zod"

// De regels per stap. Elke foutmelding zegt wat er mis is en wat je kunt doen.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTCODE = /^\d{4}\s?[a-zA-Z]{2}$/

// Stap 1: het bedrijf, en hoe de brief verstuurd wordt.
// route "email": we mailen de brief. route "post": Betaalpauze stuurt hem per post.
// Bij post zonder volledig adres van het bedrijf vult de gebruiker het adres van de factuur in.
// Ook als het adres wel bekend is, mag de gebruiker het adres van de factuur gebruiken.
export const schuldeiserSchema = z
  .object({
    schuldeiserId: z.string().optional(), // uit onze eigen lijst
    kvkNummer: z.string().optional(),
    naam: z.string(),
    straat: z.string().optional(),
    postcode: z.string().optional(),
    plaats: z.string().optional(),
    // Alleen om de melding in stap 1 te kunnen tonen als je terugkomt.
    regelingVia: z.string().optional(),
    regelingUrl: z.string().optional(),
    regelingTelefoon: z.string().optional(),
    regelingOpmerking: z.string().optional(),
    route: z.string(),
    email: z
      .string()
      .trim()
      .refine((v) => v === "" || EMAIL.test(v), "Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt gemaakt."),
    // "ja" als de gebruiker een ander adres van de factuur wil gebruiken dan het bekende adres.
    postAdresAnders: z.string().optional(),
    postStraat: z.string().trim().optional(),
    postPostcode: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || POSTCODE.test(v), "Een postcode heeft 4 cijfers en 2 letters, zoals 1234 AB."),
    postPlaats: z.string().trim().optional(),
  })
  .superRefine((s, ctx) => {
    if (!s.schuldeiserId && !/^\d{8}$/.test(s.kvkNummer ?? "")) {
      ctx.addIssue({ code: "custom", path: ["kvkNummer"], message: "Kies een bedrijf uit de lijst." })
      return
    }
    if (s.route !== "email" && s.route !== "post") {
      ctx.addIssue({ code: "custom", path: ["route"], message: "Kies hoe je de brief wilt laten versturen." })
      return
    }
    if (s.route === "email" && !s.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Vul het e-mailadres van het bedrijf in. Het staat meestal op de factuur.",
      })
    }
    const eigenAdresNodig = s.postAdresAnders === "ja" || !(s.straat && s.postcode && s.plaats)
    if (s.route === "post" && eigenAdresNodig) {
      if (!s.postStraat || !/\d/.test(s.postStraat)) {
        ctx.addIssue({
          code: "custom",
          path: ["postStraat"],
          message: "Vul de straat en het huisnummer van het bedrijf in, of de postbus. Het staat op de factuur.",
        })
      }
      if (!s.postPostcode) {
        ctx.addIssue({ code: "custom", path: ["postPostcode"], message: "Vul de postcode van het bedrijf in." })
      }
      if (!s.postPlaats) {
        ctx.addIssue({ code: "custom", path: ["postPlaats"], message: "Vul de plaats van het bedrijf in." })
      }
    }
  })

// Bedrag zoals mensen het typen: 248, 248,50 of 1.248,50
const BEDRAG = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/

export const factuurSchema = z.object({
  factuurnummer: z
    .string()
    .trim()
    .min(1, "Vul het factuurnummer in. Het staat bovenaan de factuur.")
    .max(50, "Dit factuurnummer is erg lang. Check of je er niet iets anders bij hebt gezet."),
  factuurdatum: z
    .string()
    .min(1, "Vul de datum van de factuur in.")
    .refine((d) => new Date(d) <= new Date(), "Deze datum ligt in de toekomst. Check de datum op de factuur."),
  bedrag: z
    .string()
    .trim()
    .min(1, "Vul het bedrag in dat op de factuur staat.")
    .regex(BEDRAG, "Vul het bedrag in als 248,50. Gebruik een komma voor de centen.")
    .refine((b) => naarCenten(b) > 0, "Het bedrag moet hoger zijn dan € 0."),
  klantnummer: z.string().trim().max(50).optional(),
})

export const gegevensSchema = z.object({
  voornaam: z.string().trim().min(1, "Vul je voornaam in."),
  achternaam: z.string().trim().min(1, "Vul je achternaam in."),
  straat: z
    .string()
    .trim()
    .min(1, "Vul je straat en huisnummer in.")
    .regex(/\d/, "Vul ook je huisnummer in, bijvoorbeeld Kerkstraat 12."),
  postcode: z
    .string()
    .trim()
    .regex(/^\d{4}\s?[a-zA-Z]{2}$/, "Een postcode heeft 4 cijfers en 2 letters, zoals 1234 AB."),
  plaats: z.string().trim().min(2, "Vul je woonplaats in."),
})

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vul je e-mailadres in. Daar sturen we de code naartoe.")
    .email("Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt gemaakt."),
})

export const aanvraagSchema = z.object({
  schuldeiser: schuldeiserSchema,
  factuur: factuurSchema,
  gegevens: gegevensSchema,
  email: emailSchema.shape.email,
})

export type Schuldeiser = z.infer<typeof schuldeiserSchema>
export type Factuur = z.infer<typeof factuurSchema>
export type Gegevens = z.infer<typeof gegevensSchema>
export type AanvraagData = z.infer<typeof aanvraagSchema>

// "1.248,50" wordt 124850
export function naarCenten(bedrag: string) {
  const schoon = bedrag.trim().replace(/\./g, "").replace(",", ".")
  return Math.round(Number(schoon) * 100)
}

// Postcode netjes: "1234ab" wordt "1234 AB"
export function netjesPostcode(postcode: string) {
  const p = postcode.replace(/\s/g, "").toUpperCase()
  return `${p.slice(0, 4)} ${p.slice(4)}`
}
