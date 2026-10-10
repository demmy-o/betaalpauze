import { z } from "zod"

// De regels per stap. Elke foutmelding zegt wat er mis is en wat je kunt doen.

export const schuldeiserSchema = z.object({
  kvkNummer: z.string().regex(/^\d{8}$/, "Kies een bedrijf uit de lijst."),
  naam: z.string().min(1, "Kies een bedrijf uit de lijst."),
  straat: z.string().optional(),
  postcode: z.string().optional(),
  plaats: z.string().optional(),
  email: z
    .string()
    .trim()
    .min(1, "Vul het e-mailadres van het bedrijf in. Het staat meestal op de factuur.")
    .email("Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt gemaakt."),
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
