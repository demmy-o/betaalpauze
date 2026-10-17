"use client"

import { useSyncExternalStore } from "react"

// Hulpcomponenten voor de uitlegpagina's. Alleen voor Storybook, niet voor de app.

// Leest de echte waarde van een token uit de CSS, zodat hier nooit een hex-code verkeerd kan staan.
function useTokenWaarde(naam: string) {
  return useSyncExternalStore(
    () => () => {},
    () => getComputedStyle(document.documentElement).getPropertyValue(naam).trim(),
    () => ""
  )
}

export function Kleurvlak({
  naam,
  token,
  klasse,
  gebruik,
}: {
  naam: string
  token: string
  klasse: string // volledige Tailwind-klasse, bijvoorbeeld "bg-mint"
  gebruik: string
}) {
  const waarde = useTokenWaarde(token)
  return (
    <div className="sb-unstyled flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className={`h-20 ${klasse}`} />
      <div className="flex flex-col gap-1 p-3">
        <p className="text-sm font-medium text-ink">{naam}</p>
        <p className="tabular text-caption text-muted-foreground">{waarde.toUpperCase()}</p>
        <p className="text-caption text-muted-foreground">{gebruik}</p>
      </div>
    </div>
  )
}

export function Kleurraster({ children }: { children: React.ReactNode }) {
  return <div className="my-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{children}</div>
}

export function Tekstmaat({
  naam,
  token,
  children,
}: {
  naam: string
  token: string // bijvoorbeeld "--text-h1"
  children: React.ReactNode
}) {
  const waarde = useTokenWaarde(token)
  const regel = useTokenWaarde(`${token}--line-height`)
  return (
    <div className="sb-unstyled grid gap-2 border-b border-line py-6 md:grid-cols-[200px_1fr] md:gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink">{naam}</p>
        <p className="tabular text-caption text-muted-foreground">{waarde}</p>
        {regel && <p className="tabular text-caption text-muted-foreground">regelafstand {regel}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

export function Vormvoorbeeld({ naam, waarde, children }: { naam: string; waarde: string; children: React.ReactNode }) {
  return (
    <div className="sb-unstyled flex flex-col gap-2">
      {children}
      <p className="text-sm font-medium text-ink">{naam}</p>
      <p className="tabular text-caption text-muted-foreground">{waarde}</p>
    </div>
  )
}

// Rekent het WCAG-contrast uit tussen twee hex-kleuren.
function helderheid(hex: string) {
  const delen = hex.replace("#", "").match(/.{2}/g) ?? []
  const [r, g, b] = delen.map((d) => {
    const c = parseInt(d, 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  if (!a.startsWith("#") || !b.startsWith("#")) return 0
  const [licht, donker] = [helderheid(a), helderheid(b)].sort((x, y) => y - x)
  return (licht + 0.05) / (donker + 0.05)
}

// Eén tekstkleur op een paar achtergronden, met het contrast erbij.
// AA vraagt 4.5:1 voor gewone tekst en 3:1 voor grote tekst en randen van invoervelden.
export function Tekstkleur({
  naam,
  token,
  klasse,
  gebruik,
  achtergronden,
}: {
  naam: string
  token: string
  klasse: string // bijvoorbeeld "text-ink"
  gebruik: string
  achtergronden: { naam: string; token: string; klasse: string }[] // klasse mag ook een tekstkleur bevatten voor het onderschrift
}) {
  const kleur = useTokenWaarde(token)
  return (
    <div className="sb-unstyled grid gap-3 border-b border-line py-6 md:grid-cols-[200px_1fr] md:gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink">{naam}</p>
        <p className="tabular text-caption text-muted-foreground">
          {klasse} · {kleur.toUpperCase()}
        </p>
        <p className="text-caption text-muted-foreground">{gebruik}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {achtergronden.map((a) => (
          <Contrastvlak key={a.naam} kleur={kleur} tekstKlasse={klasse} achtergrond={a} />
        ))}
      </div>
    </div>
  )
}

function Contrastvlak({
  kleur,
  tekstKlasse,
  achtergrond,
}: {
  kleur: string
  tekstKlasse: string
  achtergrond: { naam: string; token: string; klasse: string }
}) {
  const vlak = useTokenWaarde(achtergrond.token)
  const verhouding = contrast(kleur, vlak)
  const oordeel = verhouding >= 4.5 ? "AA" : verhouding >= 3 ? "Alleen groot" : "Niet doen"
  return (
    <div className={`flex flex-col gap-1 rounded-md border border-line p-3 text-ink ${achtergrond.klasse}`}>
      <p className={`text-base font-medium ${tekstKlasse}`}>Aa</p>
      <p className="text-caption">{achtergrond.naam}</p>
      <p className="tabular text-caption">
        {verhouding ? `${verhouding.toFixed(1)}:1` : ""} · {oordeel}
      </p>
    </div>
  )
}

// Eén rij in de tabel met component-rollen: shadcn-naam, waar die naar verwijst, waarvoor.
export function Rol({ naam, token, verwijst, gebruik }: { naam: string; token: string; verwijst: string; gebruik: string }) {
  const waarde = useTokenWaarde(token)
  return (
    <div className="sb-unstyled grid grid-cols-[32px_1fr] items-start gap-3 border-b border-line py-3 md:grid-cols-[32px_200px_200px_1fr]">
      <div className="size-8 rounded-sm border border-line" style={{ background: `var(${token})` }} />
      <p className="tabular text-sm font-medium text-ink">{naam}</p>
      <p className="tabular col-start-2 text-caption text-muted-foreground md:col-start-auto">
        {verwijst} · {waarde.toUpperCase()}
      </p>
      <p className="col-start-2 text-sm text-muted-foreground md:col-start-auto">{gebruik}</p>
    </div>
  )
}

// Overzicht van alle tekststijlen. Pas je een stijl aan in app/globals.css, werk dan ook deze lijst bij.
const tekststijlen = [
  { stijl: "Display", klasse: "font-display text-display", mobiel: "40px", desktop: "60px", regel: "1.1", gewicht: "500", font: "Noto Serif" },
  { stijl: "Kop 1", klasse: "text-h1", mobiel: "32px", desktop: "48px", regel: "1.12", gewicht: "500", font: "Noto Serif" },
  { stijl: "Kop 2", klasse: "text-h2", mobiel: "24px", desktop: "32px", regel: "1.3", gewicht: "500", font: "Noto Serif" },
  { stijl: "Kop 3", klasse: "text-h3", mobiel: "20px", desktop: "24px", regel: "1.35", gewicht: "500", font: "Noto Serif" },
  { stijl: "Lead", klasse: "text-lead", mobiel: "18px", desktop: "20px", regel: "1.65", gewicht: "400", font: "Noto Serif" },
  { stijl: "Body", klasse: "text-base", mobiel: "16px", desktop: "16px", regel: "1.65", gewicht: "400", font: "Noto Serif" },
  { stijl: "Klein", klasse: "text-sm", mobiel: "14px", desktop: "14px", regel: "1.65", gewicht: "400", font: "Noto Serif" },
  { stijl: "Label", klasse: "font-sans text-sm font-medium", mobiel: "14px", desktop: "14px", regel: "1.65", gewicht: "500", font: "Noto Sans" },
  { stijl: "Knop en veld", klasse: "font-sans text-base", mobiel: "16px", desktop: "16px", regel: "1.2", gewicht: "500 / 400", font: "Noto Sans" },
  { stijl: "Kleine kapitalen", klasse: "eyebrow", mobiel: "13px", desktop: "13px", regel: "1.65", gewicht: "500", font: "Noto Sans" },
]

export function Tekststijlen() {
  const koppen = ["Stijl", "Klasse", "Mobiel", "Vanaf 1024px", "Regelafstand", "Gewicht", "Lettertype"]
  return (
    <div className="sb-unstyled my-6 overflow-x-auto">
      <table className="w-full text-sm text-ink">
        <thead>
          <tr>
            {koppen.map((k) => (
              <th key={k} className="py-2 pr-4 text-left font-medium">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tekststijlen.map((t) => (
            <tr key={t.stijl} className="border-t border-line">
              <td className="py-2 pr-4">{t.stijl}</td>
              <td className="py-2 pr-4"><code>{t.klasse}</code></td>
              <td className="tabular py-2 pr-4">{t.mobiel}</td>
              <td className="tabular py-2 pr-4">{t.desktop}</td>
              <td className="tabular py-2 pr-4">{t.regel}</td>
              <td className="tabular py-2 pr-4">{t.gewicht}</td>
              <td className="py-2 pr-4">{t.font}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Overzicht van de drie formaten. Pas je een breakpoint aan in app/globals.css, werk dan ook deze lijst bij.
const formaten = [
  { naam: "Mobiel", vanaf: "0", tot: "767px", voorvoegsel: "geen", marge: "20px", container: "volle breedte", breedte: 26 },
  { naam: "Tablet", vanaf: "768px", tot: "1023px", voorvoegsel: "md:", marge: "32px", container: "volle breedte", breedte: 56 },
  { naam: "Desktop", vanaf: "1024px", tot: "", voorvoegsel: "lg:", marge: "48px", container: "maximaal 1200px", breedte: 100 },
]

export function Formaten() {
  return (
    <div className="sb-unstyled my-6 flex flex-col gap-4">
      {formaten.map((f) => (
        <div key={f.naam} className="grid gap-3 border-b border-line pb-4 md:grid-cols-[200px_1fr] md:gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink">{f.naam}</p>
            <p className="tabular text-caption text-muted-foreground">
              {f.tot ? `${f.vanaf} tot ${f.tot}` : `vanaf ${f.vanaf}`} · {f.voorvoegsel}
            </p>
            <p className="text-caption text-muted-foreground">
              Marge {f.marge} · container {f.container}
            </p>
          </div>
          <div className="flex h-16 items-center rounded-md bg-mint-tint px-3" style={{ width: `${f.breedte}%` }}>
            <div className="h-6 w-full max-w-[40%] rounded-sm bg-mint" />
          </div>
        </div>
      ))}
    </div>
  )
}
