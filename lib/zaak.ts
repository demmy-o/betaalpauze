import "server-only"
import { createClient } from "@/lib/supabase/server"
import { plusMaanden, MAX_PAUZE_MAANDEN, type Plan, type Soort } from "@/lib/betaalplan"
import type { BriefGegevens } from "@/lib/brief"

// Alles wat we van een zaak nodig hebben, opgehaald als de ingelogde gebruiker.
// Row level security zorgt dat je alleen je eigen zaak krijgt. Anders: null.

export type ZaakMetPlan = {
  id: string
  bedragCenten: number
  status: string
  plan: (Plan & { aangemaakt: string }) | null
  brief: Omit<BriefGegevens, "plan" | "datum" | "toelichting"> | null
}

export async function haalZaak(zaakId: string): Promise<ZaakMetPlan | null> {
  if (!/^[0-9a-f-]{36}$/.test(zaakId)) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: zaak } = await supabase
    .from("zaken")
    .select(
      "id, factuurnummer, factuurdatum, bedrag_centen, klantnummer, status, schuldeisers(naam, straat, postcode, plaats)"
    )
    .eq("id", zaakId)
    .maybeSingle()
  if (!zaak) return null

  const { data: profiel } = await supabase
    .from("profielen")
    .select("voornaam, achternaam, straat, postcode, plaats")
    .eq("id", user.id)
    .single()

  // Het nieuwste voorstel (hoogste versie), met de termijnen.
  const { data: planRij } = await supabase
    .from("betaalplannen")
    .select("soort, pauze_tot, created_at, termijnen(volgnummer, vervaldatum, bedrag_centen)")
    .eq("zaak_id", zaakId)
    .order("versie", { ascending: false })
    .limit(1)
    .maybeSingle()

  const schuldeiser = Array.isArray(zaak.schuldeisers) ? zaak.schuldeisers[0] : zaak.schuldeisers

  return {
    id: zaak.id,
    bedragCenten: zaak.bedrag_centen,
    status: zaak.status,
    plan: planRij ? naarPlan(planRij, zaak.bedrag_centen) : null,
    brief:
      profiel && schuldeiser
        ? {
            afzender: {
              voornaam: profiel.voornaam ?? "",
              achternaam: profiel.achternaam ?? "",
              straat: profiel.straat ?? "",
              postcode: profiel.postcode ?? "",
              plaats: profiel.plaats ?? "",
              email: user.email ?? "",
            },
            schuldeiser: {
              naam: schuldeiser.naam,
              straat: schuldeiser.straat ?? undefined,
              postcode: schuldeiser.postcode ?? undefined,
              plaats: schuldeiser.plaats ?? undefined,
            },
            factuur: {
              factuurnummer: zaak.factuurnummer,
              factuurdatum: zaak.factuurdatum,
              bedragCenten: zaak.bedrag_centen,
              klantnummer: zaak.klantnummer ?? undefined,
            },
          }
        : null,
  }
}

type PlanRij = {
  soort: Soort
  pauze_tot: string | null
  created_at: string
  termijnen: { volgnummer: number; vervaldatum: string; bedrag_centen: number }[]
}

function naarPlan(rij: PlanRij, totaalCenten: number): Plan & { aangemaakt: string } {
  const termijnen = [...rij.termijnen]
    .sort((a, b) => a.volgnummer - b.volgnummer)
    .map((t) => ({ volgnummer: t.volgnummer, vervaldatum: t.vervaldatum, bedragCenten: t.bedrag_centen }))

  // De dag waarop het voorstel is gemaakt, in Nederlandse tijd.
  const aangemaakt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date(rij.created_at))

  // Hoeveel maanden pauze? Dat volgt uit de startdatum en het einde van de pauze.
  let pauzeMaanden: number | undefined
  if (rij.pauze_tot) {
    for (let m = 1; m <= MAX_PAUZE_MAANDEN; m++) {
      if (plusMaanden(aangemaakt, m) === rij.pauze_tot) pauzeMaanden = m
    }
  }

  return {
    soort: rij.soort,
    termijnen,
    pauzeTot: rij.pauze_tot ?? undefined,
    pauzeMaanden,
    einddatum: termijnen[termijnen.length - 1]?.vervaldatum ?? "",
    totaalCenten,
    aangemaakt,
  }
}
