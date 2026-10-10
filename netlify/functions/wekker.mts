// De wekker: verstuurt elke ochtend om 08:00 Nederlandse tijd de herinneringen van die dag.
// Het eigenlijke werk gebeurt in de app zelf (app/api/wekker/route.ts). Deze functie
// klopt daar alleen aan, met de geheime sleutel.
//
// Netlify rekent in UTC. 08:00 in Nederland is 06:00 UTC in de zomer en 07:00 UTC in de winter.
// Daarom draait hij om allebei die tijden, en gaat hij alleen door als het in Nederland 08:00 is.

const wekker = async () => {
  const uurInNederland = Number(
    new Intl.DateTimeFormat("nl-NL", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Amsterdam" }).format(new Date())
  )
  if (uurInNederland !== 8) {
    console.log(`Wekker: het is ${uurInNederland}:00 in Nederland, niet 08:00. Niets te doen.`)
    return
  }

  const site = process.env.URL
  const geheim = process.env.WEKKER_GEHEIM
  if (!site || !geheim) {
    console.error("Wekker: URL of WEKKER_GEHEIM ontbreekt")
    return
  }

  const antwoord = await fetch(`${site}/api/wekker`, {
    method: "POST",
    headers: { Authorization: `Bearer ${geheim}` },
  })
  console.log(`Wekker: HTTP ${antwoord.status}`, await antwoord.text())
}

export default wekker

// Elke dag om 06:00 en 07:00 UTC (een van de twee is 08:00 in Nederland)
export const config = {
  schedule: "0 6,7 * * *",
}
