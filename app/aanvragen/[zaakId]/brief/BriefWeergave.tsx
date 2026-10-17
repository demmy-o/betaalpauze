import type { Brief } from "@/lib/brief"

// De brief als een vel papier op het scherm. Zelfde opbouw als de PDF.
export function BriefWeergave({ brief }: { brief: Brief }) {
  return (
    <article
      aria-label="Voorbeeld van je brief"
      className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5 text-sm leading-relaxed text-ink md:p-8"
    >
      <div className="flex flex-col">
        {brief.afzender.map((regel) => (
          <span key={regel}>{regel}</span>
        ))}
      </div>

      <div className="flex flex-col">
        {brief.ontvanger.map((regel) => (
          <span key={regel}>{regel}</span>
        ))}
      </div>

      <p>{brief.plaatsEnDatum}</p>
      <p className="font-medium">Onderwerp: {brief.onderwerp}</p>
      <p>{brief.aanhef}</p>

      {brief.blokken.map((blok, i) =>
        "tekst" in blok ? (
          <p key={i}>{blok.tekst}</p>
        ) : (
          <ul key={i} className="tabular flex list-disc flex-col gap-1 pl-5">
            {blok.lijst.map((regel) => (
              <li key={regel}>{regel}</li>
            ))}
          </ul>
        )
      )}

      <div className="flex flex-col gap-6">
        <p>{brief.groet}</p>
        <p>{brief.naam}</p>
      </div>

      <p className="border-t border-line pt-4 text-xs text-muted-foreground">{brief.voetnoot}</p>
    </article>
  )
}
