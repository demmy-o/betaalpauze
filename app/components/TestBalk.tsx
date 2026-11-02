import { mailBeta } from "@/lib/verstuur"

// Balk bovenaan alle pagina's van de bètaversie (ticket 23). Alleen zichtbaar met MAIL_BETA=true,
// want alleen dan klopt de zin "Er gaat geen brief naar het bedrijf".
export function TestBalk() {
  if (!mailBeta()) return null
  return (
    <div role="note" className="bg-ink px-5 py-3 text-center text-sm text-white md:px-8">
      Dit is een testversie. Er gaat geen brief naar het bedrijf. Je hoeft geen echte gegevens te gebruiken.
    </div>
  )
}
