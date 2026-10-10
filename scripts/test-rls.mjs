// Test: ziet gebruiker B de zaak van gebruiker A? Dat mag niet.
// Draaien: npm run test:rls
//
// Wat het doet:
// 1. Maakt twee testgebruikers aan via de server (er gaat geen mail weg).
// 2. Logt ze allebei in met een code die de server opvraagt.
// 3. A maakt een zaak. B probeert die te lezen en aan te passen.
//    A probeert de status van de eigen zaak te veranderen (mag alleen de server).
// 4. Ruimt de twee testgebruikers weer op (hun zaak gaat mee).

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const secretKey = process.env.SUPABASE_SECRET_KEY

const admin = createClient(url, secretKey, { auth: { persistSession: false } })
const geenSessie = { auth: { persistSession: false, autoRefreshToken: false } }

const stempel = Date.now()
const emailA = `rls-test-a-${stempel}@betaalpauze.nl`
const emailB = `rls-test-b-${stempel}@betaalpauze.nl`

let gelukt = 0
let mislukt = 0

function check(omschrijving, ok) {
  console.log(`${ok ? "✓" : "✗"} ${omschrijving}`)
  if (ok) gelukt++
  else mislukt++
}

async function maakIngelogdeGebruiker(email) {
  const { data: aangemaakt, error: maakFout } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (maakFout) throw maakFout

  const { data: link, error: linkFout } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  })
  if (linkFout) throw linkFout

  const client = createClient(url, anonKey, geenSessie)
  const { error: codeFout } = await client.auth.verifyOtp({
    email,
    token: link.properties.email_otp,
    type: "email",
  })
  if (codeFout) throw codeFout

  return { id: aangemaakt.user.id, client }
}

const opruimen = []
const testZaken = []

try {
  const a = await maakIngelogdeGebruiker(emailA)
  opruimen.push(a.id)
  const b = await maakIngelogdeGebruiker(emailB)
  opruimen.push(b.id)

  // Profiel wordt vanzelf aangemaakt
  const { data: profielA } = await a.client.from("profielen").select("id")
  check("A heeft automatisch een profiel gekregen", profielA?.length === 1)

  // A maakt een zaak
  const { data: zaak, error: zaakFout } = await a.client
    .from("zaken")
    .insert({ factuurnummer: "TEST-001", bedrag_centen: 12500 })
    .select()
    .single()
  check("A kan een eigen zaak aanmaken", !zaakFout && zaak?.user_id === a.id)
  if (zaak) testZaken.push(zaak.id)

  // Plannen en termijnen maakt alleen de server. Voor de test zet de server er een klaar.
  const { data: plan } = await admin
    .from("betaalplannen")
    .insert({ zaak_id: zaak.id, soort: "termijnen", aantal_termijnen: 2 })
    .select("id")
    .single()
  const { data: termijn } = await admin
    .from("termijnen")
    .insert({ betaalplan_id: plan.id, volgnummer: 1, vervaldatum: "2026-12-01", bedrag_centen: 6250 })
    .select("id")
    .single()

  const { data: planA } = await a.client.from("betaalplannen").select("id").eq("zaak_id", zaak.id)
  const { data: termijnA } = await a.client.from("termijnen").select("id").eq("betaalplan_id", plan.id)
  check("A ziet het eigen plan en de eigen termijnen", planA?.length === 1 && termijnA?.length === 1)

  // A ziet de eigen zaak
  const { data: zakenA } = await a.client.from("zaken").select("id").eq("id", zaak.id)
  check("A ziet de eigen zaak", zakenA?.length === 1)

  // B ziet de zaak van A niet
  const { data: zakenB } = await b.client.from("zaken").select("id").eq("id", zaak.id)
  check("B ziet de zaak van A niet", zakenB?.length === 0)

  const { data: plannenB } = await b.client.from("betaalplannen").select("id").eq("zaak_id", zaak.id)
  check("B ziet het betaalplan van A niet", plannenB?.length === 0)

  // B kan de zaak van A niet aanpassen
  const { data: aangepast } = await b.client
    .from("zaken")
    .update({ bedrag_centen: 1 })
    .eq("id", zaak.id)
    .select()
  check("B kan de zaak van A niet aanpassen", (aangepast ?? []).length === 0)

  const { data: naCheck } = await admin.from("zaken").select("bedrag_centen").eq("id", zaak.id).single()
  check("Het bedrag van A is niet veranderd", naCheck?.bedrag_centen === 12500)

  // B kan geen plan bij de zaak van A maken
  const { error: indringFout } = await b.client
    .from("betaalplannen")
    .insert({ zaak_id: zaak.id, soort: "pauze", versie: 2 })
  check("B kan geen betaalplan bij de zaak van A maken", !!indringFout)

  // De status van een zaak mag alleen de server zetten, ook bij je eigen zaak.
  const { error: statusFout } = await a.client.from("zaken").update({ status: "verstuurd" }).eq("id", zaak.id)
  const { data: statusNa } = await admin.from("zaken").select("status").eq("id", zaak.id).single()
  check("A kan de status van de eigen zaak niet zelf veranderen", !!statusFout && statusNa?.status === "concept")

  const { error: verstuurdOpFout } = await a.client
    .from("zaken")
    .update({ verstuurd_op: new Date().toISOString() })
    .eq("id", zaak.id)
  check("A kan verstuurd_op niet zelf invullen", !!verstuurdOpFout)

  const { error: nepFout } = await a.client
    .from("zaken")
    .insert({ factuurnummer: "TEST-NEP", bedrag_centen: 100, status: "verstuurd" })
  check("A kan geen zaak aanmaken die al op verstuurd staat", !!nepFout)

  const { error: factuurFout } = await a.client.from("zaken").update({ factuurnummer: "TEST-002" }).eq("id", zaak.id)
  check("A kan de factuurgegevens van de eigen zaak nog wel aanpassen", !factuurFout)

  // brieven, berichten en events schrijft alleen de server. Ook niet bij je eigen zaak.
  const { data: brief } = await admin.from("brieven").insert({ zaak_id: zaak.id, tekst: "origineel" }).select("id").single()
  const { data: bericht } = await admin
    .from("berichten")
    .insert({ zaak_id: zaak.id, stap: "checkin", template: "heb-je-betaald", gepland_op: "2026-12-01" })
    .select("id")
    .single()
  const { data: event } = await admin.from("events").insert({ user_id: a.id, zaak_id: zaak.id, naam: "origineel" }).select("id").single()

  for (const [tabel, rij, nieuw, veld] of [
    ["brieven", { zaak_id: zaak.id, tekst: "nep" }, { tekst: "aangepast" }, "tekst"],
    ["berichten", { zaak_id: zaak.id, stap: "nep", template: "nep", gepland_op: "2026-12-01" }, { status: "verstuurd" }, "status"],
    ["events", { zaak_id: zaak.id, naam: "nep" }, { naam: "aangepast" }, "naam"],
  ]) {
    const id = { brieven: brief.id, berichten: bericht.id, events: event.id }[tabel]
    const { data: voor } = await admin.from(tabel).select(veld).eq("id", id).single()

    const { error: toevoegFout } = await a.client.from(tabel).insert(rij)
    check(`A kan niets toevoegen aan ${tabel}`, !!toevoegFout)

    await a.client.from(tabel).update(nieuw).eq("id", id)
    const { data: na } = await admin.from(tabel).select(veld).eq("id", id).single()
    check(`A kan niets aanpassen in ${tabel}`, na?.[veld] === voor?.[veld])

    await a.client.from(tabel).delete().eq("id", id)
    const { data: nog } = await admin.from(tabel).select("id").eq("id", id).maybeSingle()
    check(`A kan niets verwijderen uit ${tabel}`, !!nog)
  }

  // betaalplannen en termijnen: lezen mag, schrijven alleen de server. Ook niet bij je eigen zaak.
  const { error: planToevoegFout } = await a.client
    .from("betaalplannen")
    .insert({ zaak_id: zaak.id, soort: "pauze", versie: 3 })
  check("A kan zelf geen betaalplan toevoegen", !!planToevoegFout)

  await a.client.from("betaalplannen").update({ soort: "pauze" }).eq("id", plan.id)
  const { data: planNa } = await admin.from("betaalplannen").select("soort").eq("id", plan.id).single()
  check("A kan het eigen betaalplan niet aanpassen", planNa?.soort === "termijnen")

  await a.client.from("betaalplannen").delete().eq("id", plan.id)
  const { data: planNog } = await admin.from("betaalplannen").select("id").eq("id", plan.id).maybeSingle()
  check("A kan het eigen betaalplan niet verwijderen", !!planNog)

  const { error: termijnToevoegFout } = await a.client
    .from("termijnen")
    .insert({ betaalplan_id: plan.id, volgnummer: 2, vervaldatum: "2027-01-01", bedrag_centen: 6250 })
  check("A kan zelf geen termijn toevoegen", !!termijnToevoegFout)

  await a.client.from("termijnen").update({ status: "betaald", bedrag_centen: 1 }).eq("id", termijn.id)
  const { data: termijnNa } = await admin.from("termijnen").select("status, bedrag_centen").eq("id", termijn.id).single()
  check("A kan de eigen termijn niet aanpassen (status of bedrag)", termijnNa?.status === "open" && termijnNa?.bedrag_centen === 6250)

  await a.client.from("termijnen").delete().eq("id", termijn.id)
  const { data: termijnNog } = await admin.from("termijnen").select("id").eq("id", termijn.id).maybeSingle()
  check("A kan de eigen termijn niet verwijderen", !!termijnNog)

  // Zonder inloggen zie je niets
  const anoniem = createClient(url, anonKey, geenSessie)
  const { data: zakenAnoniem } = await anoniem.from("zaken").select("id")
  check("Zonder inloggen zie je geen zaken", (zakenAnoniem ?? []).length === 0)
} catch (fout) {
  console.error("De test liep vast:", fout.message ?? fout)
  mislukt++
} finally {
  // Events blijven bestaan als een gebruiker verdwijnt, dus die ruimen we eerst zelf op.
  if (testZaken.length) await admin.from("events").delete().in("zaak_id", testZaken)
  if (opruimen.length) await admin.from("events").delete().in("user_id", opruimen)
  for (const id of opruimen) {
    await admin.auth.admin.deleteUser(id)
  }
  console.log(`\n${gelukt} gelukt, ${mislukt} mislukt. Testgebruikers opgeruimd: ${opruimen.length}.`)
  process.exitCode = mislukt > 0 ? 1 : 0
}
