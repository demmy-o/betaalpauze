import * as React from "react"

import { cn } from "@/lib/utils"

// Betaalpauze: de basis van elke pagina. Regelt de achtergrond, de marges per formaat en de breedte.
// Drie formaten, twee breakpoints (zie Fundamenten/Breakpoints in Storybook):
// mobiel (tot 768px), tablet (768 tot 1024px) en desktop (vanaf 1024px, container maximaal 1200px).
// De inhoud staat in een gecentreerde kolom.
const kolommen = {
  stap: "max-w-kop", // 880px: een stap in de aanvraag, met brede kop en smalle antwoordkolom (zie Stap)
  breed: "max-w-kop", // 880px: overzichten en bevestigingen, zoals Mijn plan
  formulier: "max-w-form", // 480px: een los formulier
  tekst: "max-w-prose", // 680px: lopende tekst
  vol: "", // de hele container
}

function Pagina({
  kolom = "formulier",
  className,
  children,
  ...props
}: React.ComponentProps<"main"> & { kolom?: keyof typeof kolommen }) {
  return (
    <main
      data-slot="pagina"
      className={cn(
        "min-h-screen bg-canvas px-5 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16",
        // Een stap krijgt veel lucht boven de vraag, voor rust en focus.
        kolom === "stap" && "pt-16 md:pt-20 lg:pt-24",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-page">
        {/* data-kolom="smal": een Kaart in deze kolom mag op tablet en desktop uitsteken (zie Kaart). */}
        <div
          data-kolom={kolom === "formulier" ? "smal" : undefined}
          className={cn("group/kolom mx-auto flex w-full flex-col gap-8", kolommen[kolom])}
        >
          {children}
        </div>
      </div>
    </main>
  )
}

export { Pagina }
