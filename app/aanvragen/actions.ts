"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { magMailen } from "@/lib/mail"
import { aanvraagSchema, naarCenten, netjesPostcode, type AanvraagData } from "./schema"

type Uitkomst = { ok: true; zaakId?: string } | { ok: false; melding: string }

// Stap 4a: stuur een code naar het adres uit stap 3.
export async function stuurAanvraagCode(email: string): Promise<Uitkomst> {
  if (!magMailen(email)) {
    return {
      ok: false,
      melding: "We testen nog. Vul bij je e-mailadres het testadres in.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  })

  if (error) {
    return { ok: false, melding: "We konden geen code sturen. Probeer het over een minuut opnieuw." }
  }
  return { ok: true }
}

// Stap 4b: controleer de code en bewaar de zaak.
export async function bevestigEnBewaar(aanvraag: AanvraagData, code: string): Promise<Uitkomst> {
  const controle = aanvraagSchema.safeParse(aanvraag)
  if (!controle.success) {
    return { ok: false, melding: "Er mist nog iets in een eerdere stap. Ga terug en check je antwoorden." }
  }
  const { schuldeiser, factuur, gegevens } = controle.data

  if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) {
    return { ok: false, melding: "De code heeft 6 cijfers. Check of je er geen mist." }
  }

  // 1. Code controleren. Daarna is de gebruiker ingelogd.
  const supabase = await createClient()
  const { data: sessie, error: codeFout } = await supabase.auth.verifyOtp({
    email: gegevens.email.toLowerCase(),
    token: code.replace(/\s/g, ""),
    type: "email",
  })
  if (codeFout || !sessie.user) {
    return { ok: false, melding: "Deze code klopt niet of is verlopen. Vraag een nieuwe code aan." }
  }

  // 2. Schuldeiser opzoeken of toevoegen. Dat mag alleen de server.
  const admin = createAdminClient()
  const { data: bestaand } = await admin
    .from("schuldeisers")
    .select("id")
    .eq("kvk_nummer", schuldeiser.kvkNummer)
    .maybeSingle()

  let schuldeiserId = bestaand?.id
  if (!schuldeiserId) {
    const { data: nieuw, error } = await admin
      .from("schuldeisers")
      .insert({
        naam: schuldeiser.naam,
        kvk_nummer: schuldeiser.kvkNummer,
        straat: schuldeiser.straat,
        plaats: schuldeiser.plaats,
      })
      .select("id")
      .single()
    if (error) return { ok: false, melding: "Opslaan lukte niet. Probeer het opnieuw." }
    schuldeiserId = nieuw.id
  }

  // 3. Profiel en zaak bewaren als de gebruiker zelf (row level security geldt).
  const { error: profielFout } = await supabase
    .from("profielen")
    .update({
      voornaam: gegevens.voornaam,
      achternaam: gegevens.achternaam,
      straat: gegevens.straat,
      postcode: netjesPostcode(gegevens.postcode),
      plaats: gegevens.plaats,
    })
    .eq("id", sessie.user.id)
  if (profielFout) return { ok: false, melding: "Opslaan lukte niet. Probeer het opnieuw." }

  const { data: zaak, error: zaakFout } = await supabase
    .from("zaken")
    .insert({
      schuldeiser_id: schuldeiserId,
      schuldeiser_email: schuldeiser.email.toLowerCase(),
      factuurnummer: factuur.factuurnummer,
      factuurdatum: factuur.factuurdatum,
      bedrag_centen: naarCenten(factuur.bedrag),
      klantnummer: factuur.klantnummer || null,
    })
    .select("id")
    .single()
  if (zaakFout) return { ok: false, melding: "Opslaan lukte niet. Probeer het opnieuw." }

  await supabase.from("events").insert({ zaak_id: zaak.id, naam: "aanvraag_stap4_bevestigd" })

  return { ok: true, zaakId: zaak.id }
}
