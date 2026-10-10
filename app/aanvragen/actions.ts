"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { magMailen } from "@/lib/mail"
import { zoekOpNummer } from "@/lib/kvk"
import { aanvraagSchema, naarCenten, netjesPostcode, type AanvraagData } from "./schema"

type Uitkomst = { ok: true; zaakId?: string } | { ok: false; melding: string }

// Stap 4: stuur een code naar het ingevulde e-mailadres.
export async function stuurAanvraagCode(email: string): Promise<Uitkomst> {
  if (!magMailen(email)) {
    return {
      ok: false,
      melding: "We testen nog. Inloggen kan nu alleen met het testadres.",
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

// Stap 4: controleer de code en bewaar de zaak.
export async function bevestigEnBewaar(aanvraag: AanvraagData, code: string): Promise<Uitkomst> {
  const controle = aanvraagSchema.safeParse(aanvraag)
  if (!controle.success) {
    return { ok: false, melding: "Er mist nog iets in een eerdere stap. Ga terug en check je antwoorden." }
  }
  const { schuldeiser, factuur, gegevens, email } = controle.data

  if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) {
    return { ok: false, melding: "De code heeft 6 cijfers. Check of je er geen mist." }
  }

  // 1. Code controleren. Daarna is de gebruiker ingelogd.
  const supabase = await createClient()
  const { data: sessie, error: codeFout } = await supabase.auth.verifyOtp({
    email: email.toLowerCase(),
    token: code.replace(/\s/g, ""),
    type: "email",
  })
  if (codeFout || !sessie.user) {
    return { ok: false, melding: "Deze code klopt niet of is verlopen. Vraag een nieuwe code aan." }
  }

  // 2. Schuldeiser opzoeken (meestal al bewaard bij het kiezen in stap 1) of toevoegen.
  const admin = createAdminClient()
  const { data: bestaand } = await admin
    .from("schuldeisers")
    .select("id")
    .eq("kvk_nummer", schuldeiser.kvkNummer)
    .maybeSingle()

  // Nog niet bekend: naam en adres van de KVK zelf, nooit uit de browser.
  let schuldeiserId = bestaand?.id
  if (!schuldeiserId) {
    const bedrijf = await zoekOpNummer(schuldeiser.kvkNummer).catch(() => null)
    if (!bedrijf) return { ok: false, melding: "We konden dit bedrijf niet vinden bij de KVK. Kies het bedrijf opnieuw in stap 1." }
    const { data: nieuw, error } = await admin
      .from("schuldeisers")
      .insert({
        naam: bedrijf.naam,
        kvk_nummer: bedrijf.kvkNummer,
        straat: bedrijf.straat ?? null,
        plaats: bedrijf.plaats ?? null,
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
