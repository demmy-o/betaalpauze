// Een brief per post definitief maken en op "verstuurd" zetten. Draait op je eigen laptop.
//
//   npm run post -- <zaak-id of factuurnummer> <postdatum JJJJ-MM-DD>
//   npm run post -- <zaak-id of factuurnummer> <postdatum> --proef    (laat alleen zien wat er gaat gebeuren)
//
// Draai het op de dag dat je de brief op de post doet. Het script:
// - werkt alleen bij een zaak met status per_post (nog een keer draaien doet dus niets)
// - rekent de betaaldata opnieuw uit vanaf de postdatum en maakt de definitieve brief
// - mailt jou de PDF om te printen, en mailt de gebruiker dat de brief op de post is
// - zet de zaak op verstuurd en plant de herinneringen in vanaf de postdatum
//
// Let op: het script praat met de database uit .env.local. Na de livegang is dat de echte.

import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"
import { datumLang, euro } from "@/lib/betaalplan"
import { bereidPostVoor, verstuurPerPost } from "@/lib/postVersturen"

const args = process.argv.slice(2)
const proef = args.includes("--proef")
const [zaakOfFactuur, postdatum] = args.filter((a) => a !== "--proef")

if (!zaakOfFactuur || !postdatum) {
  console.log("Gebruik: npm run post -- <zaak-id of factuurnummer> <JJJJ-MM-DD> [--proef]")
  process.exit(1)
}

// Altijd eerst laten zien waar we mee praten.
const testmodus = process.env.MAIL_TEST_MODE === "true"
const database = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://onbekend").host
console.log("")
console.log(`Database:        ${database}`)
console.log(
  `MAIL_TEST_MODE:  ${testmodus ? `AAN (alle mail gaat naar ${process.env.MAIL_TEST_ADDRESS})` : "UIT (mail gaat naar de echte gebruiker)"}`
)
console.log(`Soort:           ${proef ? "proef, er verandert niets" : "ECHT, dit verandert de database en verstuurt mail"}`)
console.log("")

const voorbereiding = await bereidPostVoor(zaakOfFactuur, postdatum)
if (!voorbereiding.ok) {
  console.log(voorbereiding.melding)
  process.exit(1)
}
const v = voorbereiding.v

console.log(`Zaak:            ${v.zaakId}`)
console.log(`Aangevraagd op:  ${datumLang(v.aanvraagdatum)}`)
console.log(`Postdatum:       ${datumLang(v.postdatum)}`)
console.log(`Aan:             ${v.brief.ontvanger.join(", ")}`)
console.log(`Van:             ${v.brief.naam} (${v.gebruikerEmail})`)
console.log(`Toelichting:     ${v.toelichting ? "ja" : "nee"}`)
console.log(`Betaaldata:`)
for (const t of v.plan.termijnen) console.log(`                 ${datumLang(t.vervaldatum)}: ${euro(t.bedragCenten)}`)
console.log(`Herinneringen:   ${v.aantalHerinneringen}, de eerste op ${v.eersteHerinnering ? datumLang(v.eersteHerinnering) : "-"}`)
console.log("")

if (proef) {
  console.log("Dit zou er gebeuren:")
  console.log("  1. De zaak gaat op verstuurd, met de postdatum.")
  console.log("  2. Het plan en de brief worden definitief, met de betaaldata hierboven.")
  console.log(`  3. De herinneringen worden ingepland (${v.aantalHerinneringen}).`)
  console.log(`  4. Jij krijgt de PDF om te printen op ${process.env.NOTIFY_EMAIL || process.env.MAIL_TEST_ADDRESS}.`)
  console.log(`  5. De gebruiker krijgt een mail dat de brief op de post is${testmodus ? " (in testmodus naar het testadres)" : ""}.`)
  console.log("")
  console.log("Proef: er is niets veranderd en er is geen mail verstuurd.")
  process.exit(0)
}

const vraag = createInterface({ input: stdin, output: stdout })
const antwoord = (await vraag.question("Doorgaan? (j/n) ")).trim().toLowerCase()
vraag.close()
if (antwoord !== "j") {
  console.log("Gestopt. Er is niets veranderd.")
  process.exit(0)
}

const { waarschuwingen } = await verstuurPerPost(v, process.env.SITE_URL ?? "https://betaalpauze.nl")
console.log("")
console.log("Klaar: de zaak staat op verstuurd, de herinneringen zijn ingepland en de mails zijn verstuurd.")
for (const w of waarschuwingen) console.log(`Let op: ${w}`)
process.exit(waarschuwingen.length ? 1 : 0)
