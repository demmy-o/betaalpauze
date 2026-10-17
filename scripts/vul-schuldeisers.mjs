// Vult onze eigen lijst met bekende schuldeisers (ticket 14). Draaien: npm run vul-schuldeisers
// Gegevens uitgezocht op 11 oktober 2026, alleen van officiële pagina's (zie bron_url).
// Opnieuw draaien mag: bestaande rijen worden bijgewerkt (op KVK-nummer, of op naam als er geen is).
//
// regeling_via:
//   email      we kunnen de brief mailen
//   portaal    het bedrijf wil dat je het in de eigen online omgeving regelt (regeling_url)
//   formulier  het bedrijf heeft een contactformulier (regeling_url)
//   telefoon   alleen telefonisch

import { createClient } from "@supabase/supabase-js"

const GECONTROLEERD = "2026-10-11"

const LIJST = [
  // Zorg
  {
    naam: "Zilveren Kruis Zorgverzekeringen N.V.", kvk_nummer: "06088185", regeling_via: "portaal",
    regeling_url: "https://www.zilverenkruis.nl/consumenten/mijn/financieel-overzicht", telefoon: "071 751 00 51",
    bron_url: "https://www.zilverenkruis.nl/consumenten/service/betalen/betalingsregeling",
    opmerking: "Via Mijn Zilveren Kruis of de app. Vanaf € 25, minimaal € 25 per maand, betalen via automatische incasso.",
    straat: "Postbus 444", postcode: "2300 AK", plaats: "Leiden",
  },
  {
    naam: "VGZ Zorgverzekeraar N.V.", kvk_nummer: "09156723", regeling_via: "portaal",
    regeling_url: "https://mijn.vgz.nl/betalingsregelingen/aanvragen/selecteer-facturen", telefoon: "0900 84 90",
    bron_url: "https://www.vgz.nl/betalen/betalingsregeling",
    opmerking: "Via Mijn VGZ. Rekening vanaf € 50, 2 tot 12 termijnen, minimaal € 25 per termijn.",
  },
  {
    naam: "CZ Zorgverzekeringen N.V.", kvk_nummer: "27093766", regeling_via: "portaal",
    regeling_url: "https://mijn.cz.nl/Betalingsregeling/Aanvragen", telefoon: "088 555 77 77",
    bron_url: "https://www.cz.nl/betalen/betalingsregeling-aanvragen",
    opmerking: "Via Mijn CZ of de app. Rekening vanaf € 50.",
  },
  {
    naam: "Menzis Zorgverzekeraar N.V.", kvk_nummer: "50544810", regeling_via: "portaal",
    regeling_url: "https://www.menzis.nl/mijn/geldzaken/betalingsregelingen/betalingsregeling-aanvragen", telefoon: "088 222 40 40",
    bron_url: "https://www.menzis.nl/klantenservice/premie-en-rekeningen-betalen/betalingsregeling",
    opmerking: "Via Mijn Menzis. Vanaf € 50, 2 tot 12 termijnen, minimaal € 25 per termijn.",
  },
  {
    naam: "Onderlinge Waarborgmaatschappij DSW Zorgverzekeraar U.A.", kvk_nummer: "24168208", regeling_via: "formulier",
    regeling_url: "https://www.dsw.nl/Consumenten/klantenservice/contactformulier", telefoon: "010 246 64 66",
    bron_url: "https://www.dsw.nl/consumenten/klantenservice/betalen/betalingsachterstand",
    opmerking: "Via het contactformulier of telefonisch.",
  },
  // Energie
  {
    naam: "Vattenfall Sales Nederland N.V.", kvk_nummer: "09105390", regeling_via: "email", email: "vattenfall@vattenfall.nl",
    regeling_url: "https://www.vattenfall.nl/klantenservice/betalingsregeling/", telefoon: "0900 0808",
    bron_url: "https://www.vattenfall.nl/klantenservice/contact/",
    opmerking: "Algemeen e-mailadres, noem je klantnummer. Een regeling kan ook via Mijn Vattenfall (vanaf € 60, minimaal € 30 per maand).",
  },
  {
    naam: "Eneco Consumenten B.V.", kvk_nummer: "24324527", regeling_via: "portaal",
    regeling_url: "https://www.eneco.nl/mijn-eneco/notas/betalingsregeling/", telefoon: "088 895 59 55",
    bron_url: "https://www.eneco.nl/klantenservice/betalingsregeling/",
    opmerking: "Via Mijn Eneco of de app.",
  },
  {
    naam: "Essent Retail Energie B.V.", kvk_nummer: "13041611", regeling_via: "portaal",
    regeling_url: "https://mijn.essent.nl/facturen-en-betalen", telefoon: "0900 15 50",
    bron_url: "https://www.essent.nl/klantenservice/facturen-en-betalen/ik-kan-niet-betalen",
    opmerking: "Via Mijn Essent. Vanaf € 100.",
  },
  {
    naam: "Budget Thuis B.V. (Budget Energie)", kvk_nummer: "34297646", regeling_via: "email", email: "klanten.energie@budgetthuis.nl",
    telefoon: "020 205 55 55", bron_url: "https://www.budgetthuis.nl/energie/contact",
    opmerking: "Voorheen Budget Energie. Algemeen e-mailadres. Volgens de voorwaarden een schriftelijk verzoek met reden.",
  },
  {
    naam: "Greenchoice B.V.", kvk_nummer: "24302685", regeling_via: "email", email: "vragen@greenchoice.nl",
    regeling_url: "https://mijn.greenchoice.nl/notas", telefoon: "010 478 23 26",
    bron_url: "https://www.greenchoice.nl/klantenservice/hulp-bij-betalen/",
    opmerking: "Algemeen e-mailadres. Een regeling kan ook in Mijn Greenchoice.",
  },
  // Telecom
  {
    naam: "KPN B.V.", kvk_nummer: "27124701", regeling_via: "portaal",
    regeling_url: "https://www.kpn.com/service/ugs/online-betaalafspraak-maken",
    bron_url: "https://www.kpn.com/service/ugs/online-betaalafspraak-maken",
    opmerking: "Online kun je alleen uitstel krijgen, tot een maand na de factuurdatum.",
  },
  {
    naam: "Ziggo B.V.", kvk_nummer: "37026706", regeling_via: "portaal",
    regeling_url: "https://www.ziggo.nl/mijn-ziggo/facturen/overzicht", telefoon: "0900 1884",
    bron_url: "https://www.ziggo.nl/klantenservice/abonnement/factuur/betaalachterstand",
    opmerking: "Via Mijn Ziggo of telefonisch.",
  },
  {
    naam: "Vodafone Libertel B.V.", kvk_nummer: "14052264", regeling_via: "portaal",
    regeling_url: "https://www.vodafone.nl/my/rekeningen", telefoon: "0800 0094",
    bron_url: "https://www.vodafone.nl/support/abonnement-en-rekening/hulp-bij-je-rekening",
    opmerking: "Via My Vodafone of telefonisch.",
  },
  {
    naam: "Odido Netherlands B.V.", kvk_nummer: "33265679", regeling_via: "portaal",
    regeling_url: "https://www.odido.nl/my/facturen", telefoon: "0800 0092",
    bron_url: "https://www.odido.nl/service/veelgestelde-vragen/kan-ik-een-betalingsafspraak-maken-voor-mijn-factuur/000453038",
    opmerking: "Via Mijn Odido. Vanaf € 30, 2 tot 4 maanden.",
  },
  // Water
  {
    naam: "Vitens N.V.", kvk_nummer: "05069581", regeling_via: "telefoon",
    regeling_url: "https://www.vitens.nl/contact", telefoon: "0900 0650",
    bron_url: "https://www.vitens.nl/Service/Hulp-bij-betalen",
    opmerking: "Alleen via de klantenservice. Uitstel kan via Mijn Vitens.",
  },
  // Overheid (niet in het KVK-register)
  {
    naam: "Centraal Justitieel Incassobureau (CJIB)", kvk_nummer: null, regeling_via: "portaal",
    regeling_url: "https://www.cjib.nl/betalenindelen", telefoon: "058 215 95 55",
    bron_url: "https://www.cjib.nl/contact",
    opmerking: "Overheidsdienst, niet in het KVK-register. Een regeling kan online met DigiD. Mailen kan niet.",
    straat: "Postbus 1794", postcode: "8901 CB", plaats: "Leeuwarden",
  },
]

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

let nieuw = 0
let bijgewerkt = 0

for (const partij of LIJST) {
  const rij = {
    ...partij,
    email: partij.email ?? null,
    email_bron: partij.email ? "gecureerd" : null,
    gecontroleerd_op: GECONTROLEERD,
  }

  const zoek = admin.from("schuldeisers").select("id")
  const { data: bestaand } = await (rij.kvk_nummer ? zoek.eq("kvk_nummer", rij.kvk_nummer) : zoek.eq("naam", rij.naam)).maybeSingle()

  const { error } = bestaand
    ? await admin.from("schuldeisers").update(rij).eq("id", bestaand.id)
    : await admin.from("schuldeisers").insert(rij)
  if (error) {
    console.error(`Mislukt: ${rij.naam}: ${error.message}`)
    process.exitCode = 1
    continue
  }
  if (bestaand) bijgewerkt++
  else nieuw++
}

console.log(`Klaar: ${nieuw} nieuw, ${bijgewerkt} bijgewerkt.`)
