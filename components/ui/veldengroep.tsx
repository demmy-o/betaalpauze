"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

// Betaalpauze: de invulvelden van een stap, onder elkaar met ruim lucht ertussen. Geen vlak eromheen:
// de grijze velden zelf laten zien wat je moet invullen (naar de Framer-versie).
// Bij het openen van een stap komen de velden één voor één binnen: elk veld schuift 24px omhoog en wordt
// zichtbaar, 0,2 seconde na het vorige. Wie minder beweging wil (instelling van het toestel), ziet ze meteen.
const VELD_IN = { duration: 0.4, ease: [0.21, 0.73, 0.5, 1] } as const
const VERTRAGING = 0.2

function Veldengroep({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const rustig = useReducedMotion()

  return (
    <div
      data-slot="veldengroep"
      className={cn("mx-auto flex w-full max-w-form flex-col gap-8", className)}
      {...props}
    >
      {React.Children.toArray(children).map((veld, i) => (
        <motion.div
          key={React.isValidElement(veld) ? veld.key : i}
          className="flex flex-col gap-4" // voor een blok met meer onderdelen, zoals tekst met een veld
          initial={rustig ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...VELD_IN, delay: i * VERTRAGING }}
        >
          {veld}
        </motion.div>
      ))}
    </div>
  )
}

export { Veldengroep }
