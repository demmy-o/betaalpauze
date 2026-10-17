import { mailBeta } from "@/lib/verstuur"

// Balk bovenaan alle pagina's van de bètaversie (ticket 23). Alleen zichtbaar met MAIL_BETA=true,
// want alleen dan klopt de zin "Er gaat geen brief naar het bedrijf".
export function TestBalk() {
  if (!mailBeta()) return null
  return (
    <div role="note" className="border-b border-warning/30 bg-warning-tint px-5 py-3 text-center text-sm text-ink md:px-8">
      <span className="font-medium">Testversie.</span> Er gaat geen brief naar het bedrijf. Gebruik liever verzonnen
      gegevens.
    </div>
  )
}
