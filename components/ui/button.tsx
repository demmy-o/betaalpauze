import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Betaalpauze: de knop. Drie niveaus (primair, secundair, tertiair) in drie maten (groot, middel, klein).
// Kleuren komen uit het palet (zie Fundamenten/Kleuren). Alle knoppen zijn pills.
const knopVarianten = cva(
  // Basis: vorm, letter, focusring en uitgeschakeld
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border font-sans font-medium whitespace-nowrap transition-[background-color,translate] duration-[120ms] outline-none select-none active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // De hoofdactie. Maximaal één per scherm. Geen hoverkleur: lichter worden leest als "uitgeschakeld".
        primair: "border-ink bg-ink text-white",
        // Een tweede keuze naast de hoofdactie.
        secundair: "border-ink bg-transparent text-ink hover:bg-mint-tint",
        // Een kleine actie, zonder rand. Bijvoorbeeld "Ander adres gebruiken".
        tertiair: "border-transparent bg-transparent text-ink underline underline-offset-4 hover:bg-mint-tint",
      },
      size: {
        groot: "h-12 gap-2 px-6 text-base [&_svg:not([class*='size-'])]:size-5",
        middel: "h-11 gap-2 px-5 text-sm [&_svg:not([class*='size-'])]:size-[18px]",
        // Klein is 36px hoog, maar het klikvlak is 44px (minimaal aanraakvlak).
        klein: "h-9 gap-1.5 px-4 text-sm after:absolute after:-inset-1 [&_svg:not([class*='size-'])]:size-4",
      },
      // Alleen een icoon: een ronde knop. Geef dan altijd een aria-label mee.
      alleenIcoon: { true: "px-0" },
    },
    compoundVariants: [
      { alleenIcoon: true, size: "groot", className: "w-12" },
      { alleenIcoon: true, size: "middel", className: "w-11" },
      { alleenIcoon: true, size: "klein", className: "w-9" },
    ],
    defaultVariants: { variant: "primair", size: "middel" },
  }
)

type KnopOpties = VariantProps<typeof knopVarianten>

// Voor links die eruitzien als knop: <Link className={buttonVariants({ variant: "secundair", size: "groot" })}>.
function buttonVariants({ variant, size, alleenIcoon, className }: KnopOpties & { className?: string } = {}) {
  return cn(knopVarianten({ variant, size, alleenIcoon }), className)
}

function Button({
  className,
  variant,
  size,
  alleenIcoon,
  icoonLinks,
  icoonRechts,
  children,
  ...props
}: ButtonPrimitive.Props &
  KnopOpties & {
    icoonLinks?: React.ReactNode // bijvoorbeeld <ChevronLeftIcon />
    icoonRechts?: React.ReactNode // bijvoorbeeld <ArrowRightIcon />
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(knopVarianten({ variant, size, alleenIcoon, className }))}
      {...props}
    >
      {icoonLinks}
      {children}
      {icoonRechts}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
