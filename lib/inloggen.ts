// Waar je heen gaat na het inloggen. Alleen eigen paden in de aanvraag of Mijn plan, nooit een ander adres.
// Zonder geldig adres ga je naar Mijn plan.
const TOEGESTAAN = ["/aanvragen", "/mijn-plan"]

export function naInloggen(terug: string | null | undefined) {
  if (!terug || !terug.startsWith("/") || terug.startsWith("//") || terug.includes("\\")) return "/mijn-plan"
  const pad = terug.split(/[?#]/)[0]
  const magHet = TOEGESTAAN.some((begin) => pad === begin || pad.startsWith(`${begin}/`))
  return magHet ? terug : "/mijn-plan"
}

// Komt iemand vanuit de aanvraag inloggen? Dan zeggen we dat de antwoorden bewaard blijven.
export function komtUitAanvraag(terug: string | null | undefined) {
  return naInloggen(terug).startsWith("/aanvragen")
}
