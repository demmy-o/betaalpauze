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

  // 2. Schuldeiser: uit onze eigen lijst (op id), anders op KVK-nummer.
  //    Naam en adres komen altijd uit onze lijst of van de KVK zelf, nooit uit de browser.
  const admin = createAdminClient()
  let schuldeiserId: string | undefined
  let regelingVia: string | null = null
  let adresVanBedrijfCompleet = false

  if (schuldeiser.schuldeiserId) {
    const { data } = await admin
      .from("schuldeisers")
      .select("id, regeling_via, straat, postcode, plaats")
      .eq("id", schuldeiser.schuldeiserId)
      .maybeSingle()
    if (!data) return { ok: false, melding: "We konden dit bedrijf niet meer vinden. Kies het bedrijf opnieuw in stap 1." }
    schuldeiserId = data.id
    regelingVia = data.regeling_via
    adresVanBedrijfCompleet = Boolean(data.straat && data.postcode && data.plaats)
  } else if (schuldeiser.kvkNummer) {
    const { data: bestaand } = await admin
      .from("schuldeisers")
      .select("id, regeling_via, straat, postcode, plaats")
      .eq("kvk_nummer", schuldeiser.kvkNummer)
      .maybeSingle()
    schuldeiserId = bestaand?.id
    regelingVia = bestaand?.regeling_via ?? null
    adresVanBedrijfCompleet = Boolean(bestaand?.straat && bestaand?.postcode && bestaand?.plaats)

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
  }
  if (!schuldeiserId) return { ok: false, melding: "Kies het bedrijf opnieuw in stap 1." }

  const route = schuldeiser.route === "post" ? "post" : "email"
  // Per post met het adres dat de gebruiker van de factuur overnam: als het adres van het bedrijf
  // niet compleet is, of als de gebruiker een ander adres koos. Dat komt op de zaak, nooit in schuldeisers.
  const postadres =
    route === "post" && (!adresVanBedrijfCompleet || schuldeiser.postAdresAnders === "ja")
      ? {
          post_straat: schuldeiser.postStraat ?? null,
          post_postcode: schuldeiser.postPostcode ? netjesPostcode(schuldeiser.postPostcode) : null,
          post_plaats: schuldeiser.postPlaats ?? null,
        }
      : {}

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
      schuldeiser_email: route === "email" ? schuldeiser.email.toLowerCase() : null,
      factuurnummer: factuur.factuurnummer,
      factuurdatum: factuur.factuurdatum,
      bedrag_centen: naarCenten(factuur.bedrag),
      klantnummer: factuur.klantnummer || null,
    })
    .select("id")
    .single()
  if (zaakFout) return { ok: false, melding: "Opslaan lukte niet. Probeer het opnieuw." }

  // De route en een eventueel postadres zet de server; gebruikers mogen die kolommen niet schrijven.
  const { error: routeFout } = await admin.from("zaken").update({ verzendroute: route, ...postadres }).eq("id", zaak.id)
  if (routeFout) return { ok: false, melding: "Opslaan lukte niet. Probeer het opnieuw." }

  await admin.from("events").insert([
    { user_id: sessie.user.id, zaak_id: zaak.id, naam: "aanvraag_stap4_bevestigd", data: {} },
    {
      user_id: sessie.user.id,
      zaak_id: zaak.id,
      naam: "route_gekozen",
      // reden: wat we van dit bedrijf wisten (email, portaal, formulier, telefoon) of "onbekend"
      data: { route, reden: regelingVia ?? "onbekend", postadres_ingevuld: "post_straat" in postadres },
    },
  ])

  return { ok: true, zaakId: zaak.id }
}
