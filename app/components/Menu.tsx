"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

// Hoofdmenu voor de marketingpagina's (/ en /partners). Niet in de aanvraagflow (docs/design.md, hoofdstuk 10).
// Desktop: tekstlinks op een witte balk, eventueel één pill-knop rechts.
// Mobiel: knop "Menu" opent een menu over het hele scherm in lilac.

export type MenuItem = "klanten" | "schuldeisers" | "beta"

const LINKS: { id: MenuItem | "beta"; tekst: string; href: string }[] = [
  { id: "klanten", tekst: "Voor klanten", href: "/#wachtlijst" },
  { id: "schuldeisers", tekst: "Voor schuldeisers", href: "/partners" },
  { id: "beta", tekst: "Bètaversie", href: "/beta" },
]

type Props = {
  actief?: MenuItem
  knop?: { tekst: string; href: string } // de pill-knop rechts, alleen waar dat past
}

export function Menu({ actief, knop }: Props) {
  const [open, setOpen] = useState(false)
  const menuKnop = useRef<HTMLButtonElement>(null)
  const paneel = useRef<HTMLDivElement>(null)

  // Als het menu open is: niet scrollen achter het menu, Esc sluit, Tab blijft binnen het menu.
  useEffect(() => {
    if (!open) return
    const knopBijOpenen = menuKnop.current
    const vorigeOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    paneel.current?.querySelector<HTMLElement>("a, button")?.focus()

    function opToets(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
      if (e.key !== "Tab" || !paneel.current) return
      const focusbaar = [...paneel.current.querySelectorAll<HTMLElement>("a, button")]
      const eerste = focusbaar[0]
      const laatste = focusbaar[focusbaar.length - 1]
      if (e.shiftKey && document.activeElement === eerste) {
        e.preventDefault()
        laatste.focus()
      } else if (!e.shiftKey && document.activeElement === laatste) {
        e.preventDefault()
        eerste.focus()
      }
    }
    document.addEventListener("keydown", opToets)
    return () => {
      document.removeEventListener("keydown", opToets)
      document.body.style.overflow = vorigeOverflow
      knopBijOpenen?.focus()
    }
  }, [open])

  return (
    <header className="bg-surface">
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-5 py-4 md:px-8 lg:px-12">
        <Link href="/" className="flex h-10 shrink-0 items-center">
          <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} priority />
        </Link>

        {/* Desktop */}
        <nav aria-label="Hoofdmenu" className="hidden items-center gap-8 lg:flex">
          <ul className="flex items-center gap-8">
            {LINKS.map((l) => (
              <li key={l.id}>
                <Link
                  href={l.href}
                  aria-current={l.id === actief ? "page" : undefined}
                  className="flex h-11 items-center border-b-2 border-transparent text-base text-ink-soft hover:text-ink aria-[current=page]:border-violet aria-[current=page]:text-ink"
                >
                  {l.tekst}
                </Link>
              </li>
            ))}
          </ul>
          {knop && (
            <Link
              href={knop.href}
              className="flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink-soft"
            >
              {knop.tekst}
            </Link>
          )}
        </nav>

        {/* Mobiel */}
        <button
          ref={menuKnop}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobiel-menu"
          className="flex h-11 items-center gap-2 rounded-full px-3 text-base font-medium text-ink hover:bg-lilac-soft lg:hidden"
        >
          Menu
          <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          ref={paneel}
          id="mobiel-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-lilac lg:hidden"
        >
          <div className="flex items-center justify-between gap-6 px-5 py-4 md:px-8">
            <Link href="/" onClick={() => setOpen(false)} className="flex h-10 items-center">
              <Image src="/logo-betaalpauze.svg" alt="betaalpauze.nl" width={152} height={40} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center gap-2 rounded-full px-3 text-base font-medium text-ink hover:bg-lilac-soft"
            >
              Sluiten
              <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav aria-label="Hoofdmenu" className="flex flex-col gap-8 px-5 pt-6 pb-10 md:px-8">
            <ul className="flex flex-col gap-2">
              {LINKS.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={l.id === actief ? "page" : undefined}
                    className="flex min-h-12 items-center text-h2 text-ink underline-offset-8 aria-[current=page]:underline aria-[current=page]:decoration-violet aria-[current=page]:decoration-2"
                  >
                    {l.tekst}
                  </Link>
                </li>
              ))}
            </ul>
            {knop && (
              <Link
                href={knop.href}
                onClick={() => setOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft"
              >
                {knop.tekst}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
