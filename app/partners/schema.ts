import { z } from "zod"

// De velden van het aanmeldformulier op /partners.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const partnerSchema = z.object({
  naam: z.string().trim().min(1, "Vul je naam in.").max(200),
  organisatie: z.string().trim().min(1, "Vul de naam van je organisatie in.").max(200),
  functie: z.string().trim().max(200),
  email: z
    .string()
    .trim()
    .min(1, "Vul je e-mailadres in.")
    .regex(EMAIL, "Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt gemaakt."),
  bericht: z.string().trim().max(2000, "Je bericht is wat lang. Houd het onder de 2000 tekens."),
})

export type PartnerAanmelding = z.infer<typeof partnerSchema>

