"use client"

import { useSyncExternalStore } from "react"
import type { Factuur, Gegevens, Schuldeiser } from "./schema"

export type Antwoorden = {
  schuldeiser?: Schuldeiser
  factuur?: Factuur
  gegevens?: Gegevens
  email?: string
  codeVerstuurd?: { email: string; tijd: number }
  laatsteCode?: { email: string; tijd: number } // bewaard bij "ander e-mailadres"
}

// Antwoorden blijven bewaard in dit tabblad (sessionStorage), ook bij teruggaan of herladen.
// Ze verdwijnen als het tabblad dicht gaat of als de zaak is opgeslagen.
const SLEUTEL = "betaalpauze-aanvraag"

const luisteraars = new Set<() => void>()
let reserve = "{}" // als de browser geen opslag toestaat
let laatsteTekst: string | null = null
let laatsteWaarde: Antwoorden = {}

function leesTekst() {
  try {
    return sessionStorage.getItem(SLEUTEL) ?? "{}"
  } catch {
    return reserve
  }
}

function snapshot(): Antwoorden {
  const tekst = leesTekst()
  if (tekst !== laatsteTekst) {
    laatsteTekst = tekst
    try {
      laatsteWaarde = JSON.parse(tekst)
    } catch {
      laatsteWaarde = {}
    }
  }
  return laatsteWaarde
}

function abonneer(luisteraar: () => void) {
  luisteraars.add(luisteraar)
  return () => luisteraars.delete(luisteraar)
}

function schrijf(tekst: string) {
  reserve = tekst
  try {
    sessionStorage.setItem(SLEUTEL, tekst)
  } catch {
    // Geen opslag beschikbaar: we onthouden het alleen in het geheugen.
  }
  luisteraars.forEach((l) => l())
}

export function bewaarAntwoorden(nieuw: Partial<Antwoorden>) {
  schrijf(JSON.stringify({ ...snapshot(), ...nieuw }))
}

export function wisAntwoorden() {
  schrijf("{}")
}

// Op de server zijn er nog geen antwoorden (null). In de browser wel.
export function useAntwoorden(): Antwoorden | null {
  return useSyncExternalStore(abonneer, snapshot, () => null)
}
