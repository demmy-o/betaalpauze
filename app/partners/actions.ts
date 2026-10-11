"use server"

import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { hashIp, leesIp } from "@/lib/ip"
import { verstuurMail } from "@/lib/verstuur"
import { EenvoudigeMail } from "@/emails/EenvoudigeMail"
import { partnerSchema, type PartnerAanmelding } from "./schema"

// Een aanmelding voor een pilot. Slaat op met de geheime sleutel (de tabel is dicht voor
// iedereen behalve de server) en mailt Betaalpauze (NOTIFY_EMAIL).
// Tegen spam: een honeypot-veld en maximaal 5 aanmeldingen per uur per IP-adres.

const MAX_PER_UUR = 5
export async function meldAan(
  gegevens: PartnerAanmelding,
  website: string // het honeypot-veld: mensen zien het niet, bots vullen het in
): Promise<{ ok: true } | { ok: false; melding: string }> {
  // Honeypot ingevuld? Dan doen we alsof het gelukt is, maar slaan we niets op.
  if (website.trim()) return { ok: true }

  const controle = partnerSchema.safeParse(gegevens)
  if (!controle.success) return { ok: false, melding: controle.error.issues[0]?.message ?? "Er klopt iets niet." }
  const g = controle.data

  // Het IP-adres als hash met een geheim zout (lib/ip.ts). Zonder zout slaan we niets op.
  const zout = process.env.IP_ZOUT
  if (!zout) {
    console.error("IP_ZOUT ontbreekt: partneraanmelding niet opgeslagen")
    return { ok: false, melding: "Versturen lukte niet. Probeer het over een paar minuten opnieuw." }
  }
  const ipHash = hashIp(leesIp(await headers()), zout)

  const admin = createAdminClient()
  const uurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await admin
    .from("partner_aanmeldingen")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", uurGeleden)
  if ((count ?? 0) >= MAX_PER_UUR) {
    return { ok: false, melding: "Je hebt al een paar aanmeldingen gestuurd. Probeer het over een uur opnieuw." }
  }

  const { error } = await admin.from("partner_aanmeldingen").insert({
    naam: g.naam,
    organisatie: g.organisatie,
    functie: g.functie || null,
    email: g.email.toLowerCase(),
    bericht: g.bericht || null,
    ip_hash: ipHash,
  })
  if (error) {
    console.error("Partneraanmelding opslaan mislukt:", error.message)
    return { ok: false, melding: "Versturen lukte niet. Probeer het over een paar minuten opnieuw." }
  }

  // Mail naar Betaalpauze. Lukt die niet, dan staat de aanmelding wel in de database.
  const regels = [
    `Nieuwe aanmelding voor een pilot via betaalpauze.nl/partners.`,
    `Naam: ${g.naam}\nOrganisatie: ${g.organisatie}\nFunctie: ${g.functie || "-"}\nE-mail: ${g.email}`,
    `Bericht:\n${g.bericht || "-"}`,
  ]
  const gemaild = await verstuurMail({
    vanNaam: "Betaalpauze",
    vanAdres: "partners@betaalpauze.nl",
    aan: process.env.NOTIFY_EMAIL || process.env.MAIL_TEST_ADDRESS || "",
    antwoordAan: g.email,
    onderwerp: `Pilot-aanmelding: ${g.organisatie} (${g.naam})`,
    react: EenvoudigeMail({ alineas: regels }),
    tekst: regels.join("\n\n"),
  })
  if ("fout" in gemaild) console.error("Mail over partneraanmelding mislukt:", gemaild.fout)

  return { ok: true }
}
