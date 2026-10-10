// De wekker met de hand laten draaien, voor een datum naar keuze.
// Gebruik (met npm run dev aan):
//   npm run wekker                 -> vandaag
//   npm run wekker -- 2026-11-07   -> doen alsof het 7 november 2026 is
// Een eigen datum werkt alleen als MAIL_TEST_MODE aan staat. Dan gaat alle mail naar het testadres.

const datum = process.argv[2]
const basis = process.env.WEKKER_URL ?? "http://localhost:3000"
const url = `${basis}/api/wekker${datum ? `?datum=${datum}` : ""}`

const antwoord = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.WEKKER_GEHEIM}` },
})
const uitslag = await antwoord.json()

if (!antwoord.ok) {
  console.error(`Mislukt (HTTP ${antwoord.status}):`, uitslag.fout)
  process.exitCode = 1
} else {
  console.log(`Wekker voor ${uitslag.datum}: ${uitslag.verstuurd} verstuurd, ${uitslag.overgeslagen} overgeslagen, ${uitslag.mislukt} mislukt`)
  for (const regel of uitslag.regels) console.log(`  - ${regel}`)
}
