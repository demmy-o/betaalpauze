// De bètaversie staat achter een wachtwoord (BETA_WACHTWOORD). Wie het goede wachtwoord invult
// op /beta, krijgt een cookie. Die cookie bevat niet het wachtwoord zelf, maar een code die je
// alleen kunt maken als je het wachtwoord kent. Verander je het wachtwoord, dan werken alle oude
// cookies niet meer. Draait ook in de middleware, daarom Web Crypto en geen node:crypto.

export const BETA_COOKIE = "beta_toegang"
export const BETA_DAGEN = 30

// Deze delen van de site zitten achter het wachtwoord. /api/kvk hoort erbij: alleen de aanvraag
// gebruikt het, en het KVK-adres kost geld per opvraging.
const AFGESCHERMD = ["/aanvragen", "/mijn-plan", "/inloggen", "/api/kvk"]

// Deze pagina's blijven open, maar Google mag ze niet tonen.
const NIET_INDEXEREN = ["/beta", "/betaald"]

function valtOnder(pad: string, lijst: string[]) {
  return lijst.some((p) => pad === p || pad.startsWith(p + "/"))
}

export function isAfgeschermd(pad: string) {
  return valtOnder(pad, AFGESCHERMD)
}

export function nietIndexeren(pad: string) {
  return isAfgeschermd(pad) || valtOnder(pad, NIET_INDEXEREN)
}

// Waar je na het wachtwoord naartoe gaat. Alleen een pad binnen de bètaversie, nooit een andere site.
export function veiligTerug(terug: string | null | undefined) {
  if (!terug || !terug.startsWith("/") || terug.startsWith("//") || terug.includes("\\")) return "/aanvragen"
  const pad = terug.split(/[?#]/)[0]
  return isAfgeschermd(pad) && !pad.startsWith("/api/") ? terug : "/aanvragen"
}

export async function maakToegangsCode(wachtwoord: string) {
  const sleutel = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(wachtwoord),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const handtekening = await crypto.subtle.sign("HMAC", sleutel, new TextEncoder().encode("betaalpauze-beta"))
  return [...new Uint8Array(handtekening)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Vergelijkt zonder te verraden hoeveel tekens er al goed zijn.
export function gelijk(a: string, b: string) {
  if (a.length !== b.length) return false
  let verschil = 0
  for (let i = 0; i < a.length; i++) verschil |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return verschil === 0
}

// Zonder wachtwoord in de env is de bètaversie dicht voor iedereen.
export async function heeftToegang(cookie: string | undefined, wachtwoord = process.env.BETA_WACHTWOORD) {
  if (!wachtwoord || !cookie) return false
  return gelijk(cookie, await maakToegangsCode(wachtwoord))
}
