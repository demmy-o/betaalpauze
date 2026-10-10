// Test: ziet gebruiker B de zaak van gebruiker A? Dat mag niet.
// Draaien: npm run test:rls
//
// Wat het doet:
// 1. Maakt twee testgebruikers aan via de server (er gaat geen mail weg).
// 2. Logt ze allebei in met een code die de server opvraagt.
// 3. A maakt een zaak. B probeert die te lezen en aan te passen.
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

  const { data: plan, error: planFout } = await a.client
    .from("betaalplannen")
    .insert({ zaak_id: zaak.id, soort: "termijnen", aantal_termijnen: 3 })
    .select()
    .single()
  check("A kan een betaalplan bij de eigen zaak maken", !planFout && !!plan)

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

  // Zonder inloggen zie je niets
  const anoniem = createClient(url, anonKey, geenSessie)
  const { data: zakenAnoniem } = await anoniem.from("zaken").select("id")
  check("Zonder inloggen zie je geen zaken", (zakenAnoniem ?? []).length === 0)
} catch (fout) {
  console.error("De test liep vast:", fout.message ?? fout)
  mislukt++
} finally {
  for (const id of opruimen) {
    await admin.auth.admin.deleteUser(id)
  }
  console.log(`\n${gelukt} gelukt, ${mislukt} mislukt. Testgebruikers opgeruimd: ${opruimen.length}.`)
  process.exitCode = mislukt > 0 ? 1 : 0
}
