import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { plusDagen } from "@/lib/betaalplan"
import { HERINNERINGEN, STATUS_MET_HERINNERINGEN, berekenBerichten, type Template } from "@/lib/herinneringen"
import { herinneringTekst } from "@/lib/herinneringTeksten"
import { verstuurMail } from "@/lib/verstuur"
import { HerinneringMail } from "@/emails/HerinneringMail"

const AFZENDER = "herinnering@betaalpauze.nl"
const TERMIJN_TEMPLATES: Template[] = ["termijn-komt-eraan", "vandaag-betalen", "heb-je-betaald"]

// ---------------------------------------------------------------
// Inplannen: bij het versturen van de brief
// ---------------------------------------------------------------

// Zet alle herinneringen voor een zaak klaar in de tabel berichten.
// Nog niet verstuurde berichten van deze zaak worden eerst weggehaald. Berichten die al
// verstuurd of overgeslagen zijn, blijven staan en worden niet opnieuw ingepland.
// Zo geeft opnieuw inplannen nooit dubbele mails.
export async function planBerichten(zaakId: string, verstuurdOp: string) {
  const admin = createAdminClient()

  const { data: plan } = await admin
    .from("betaalplannen")
    .select("termijnen(id, volgnummer, vervaldatum)")
    .eq("zaak_id", zaakId)
    .order("versie", { ascending: false })
    .limit(1)
    .single()
  if (!plan) return

  const { data: alGedaan } = await admin
    .from("berichten")
    .select("stap, termijn_id")
    .eq("zaak_id", zaakId)
    .neq("status", "gepland")
  const sleutel = (b: { stap: string; termijn_id: string | null }) => `${b.stap}|${b.termijn_id ?? ""}`
  const gedaan = new Set((alGedaan ?? []).map(sleutel))

  const berichten = berekenBerichten(verstuurdOp, plan.termijnen).filter((b) => !gedaan.has(sleutel(b)))

  await admin.from("berichten").delete().eq("zaak_id", zaakId).eq("status", "gepland")
  if (berichten.length) await admin.from("berichten").insert(berichten.map((b) => ({ ...b, zaak_id: zaakId })))
}

// ---------------------------------------------------------------
// De wekker: elke ochtend om 08:00 (Nederlandse tijd)
// ---------------------------------------------------------------

type Uitslag = { verstuurd: number; overgeslagen: number; mislukt: number; regels: string[] }

type BerichtRij = {
  id: string
  stap: string
  template: Template
  gepland_op: string
  zaak_id: string
  termijn_id: string | null
  zaken: {
    status: string
    user_id: string
    factuurnummer: string
    schuldeisers: { naam: string } | null
    betaalplannen: { versie: number; termijnen: { id: string; volgnummer: number; vervaldatum: string; bedrag_centen: number; status: string }[] }[]
  }
}

// Verstuurt alle berichten die voor deze datum gepland staan.
// Is de wekker een dag gemist, dan sturen we die van gisteren alsnog. Ouder dan dat: overgeslagen.
export async function draaiWekker(datum: string, basisUrl: string): Promise<Uitslag> {
  const admin = createAdminClient()
  const uitslag: Uitslag = { verstuurd: 0, overgeslagen: 0, mislukt: 0, regels: [] }

  const { data, error } = await admin
    .from("berichten")
    .select(
      `id, stap, template, gepland_op, zaak_id, termijn_id,
       zaken(status, user_id, factuurnummer, schuldeisers(naam),
             betaalplannen(versie, termijnen(id, volgnummer, vervaldatum, bedrag_centen, status)))`
    )
    .eq("status", "gepland")
    .lte("gepland_op", datum)
    .order("gepland_op")
  if (error) throw new Error(`Berichten ophalen mislukt: ${error.message}`)

  const emailPerGebruiker = new Map<string, { email: string; voornaam: string }>()

  for (const b of (data ?? []) as unknown as BerichtRij[]) {
    const zaak = b.zaken
    const plan = [...zaak.betaalplannen].sort((x, y) => y.versie - x.versie)[0]
    const termijnen = [...(plan?.termijnen ?? [])].sort((x, y) => x.volgnummer - y.volgnummer)
    const termijn = termijnen.find((t) => t.id === b.termijn_id)
    const stap = HERINNERINGEN.find((s) => s.stap === b.stap)

    // Mag dit bericht (nog) weg?
    const reden = waaromNiet(b, zaak.status, stap?.alleenBij, termijn?.status, datum)
    if (reden) {
      await admin.from("berichten").update({ status: "overgeslagen" }).eq("id", b.id).eq("status", "gepland")
      uitslag.overgeslagen++
      uitslag.regels.push(`overgeslagen: ${b.stap} (${b.gepland_op}), ${reden}`)
      continue
    }

    // Eerst afvinken, dan versturen. Zo gaat een bericht nooit twee keer weg,
    // ook niet als de wekker per ongeluk twee keer draait.
    const { data: geclaimd } = await admin
      .from("berichten")
      .update({ status: "verstuurd", verstuurd_op: new Date().toISOString() })
      .eq("id", b.id)
      .eq("status", "gepland")
      .select("id")
    if (!geclaimd?.length) continue

    if (!emailPerGebruiker.has(zaak.user_id)) {
      const { data: gebruiker } = await admin.auth.admin.getUserById(zaak.user_id)
      const { data: profiel } = await admin.from("profielen").select("voornaam").eq("id", zaak.user_id).single()
      emailPerGebruiker.set(zaak.user_id, { email: gebruiker.user?.email ?? "", voornaam: profiel?.voornaam ?? "" })
    }
    const ontvanger = emailPerGebruiker.get(zaak.user_id)!

    const inhoud = herinneringTekst(b.template, {
      voornaam: ontvanger.voornaam,
      schuldeiser: zaak.schuldeisers?.naam ?? "het bedrijf",
      factuurnummer: zaak.factuurnummer,
      eersteBetaling: termijnen[0]?.vervaldatum ?? datum,
      termijn: termijn && {
        volgnummer: termijn.volgnummer,
        aantal: termijnen.length,
        vervaldatum: termijn.vervaldatum,
        bedragCenten: termijn.bedrag_centen,
      },
      mijnPlanUrl: `${basisUrl}/mijn-plan`,
    })

    const verzonden = ontvanger.email
      ? await verstuurMail({
          vanNaam: "Betaalpauze",
          vanAdres: AFZENDER,
          aan: ontvanger.email,
          onderwerp: inhoud.onderwerp,
          react: HerinneringMail({ inhoud }),
          tekst: [...inhoud.alineas, `${inhoud.knop.tekst}: ${inhoud.knop.url}`].join("\n\n"),
        })
      : { fout: "geen e-mailadres" }

    if ("fout" in verzonden) {
      await admin.from("berichten").update({ status: "mislukt" }).eq("id", b.id)
      uitslag.mislukt++
      uitslag.regels.push(`mislukt: ${b.stap} (${b.gepland_op}), ${verzonden.fout}`)
      continue
    }

    await admin.from("events").insert({
      user_id: zaak.user_id,
      zaak_id: b.zaak_id,
      naam: "herinnering_verstuurd",
      data: { stap: b.stap, bericht_id: b.id },
    })
    uitslag.verstuurd++
    uitslag.regels.push(`verstuurd: ${b.stap} (${b.gepland_op}) naar ${ontvanger.email}`)
  }

  return uitslag
}

// Geeft de reden terug waarom een bericht niet weg mag, of null als het wel mag.
function waaromNiet(
  b: { template: Template; gepland_op: string },
  zaakStatus: string,
  alleenBij: string[] | undefined,
  termijnStatus: string | undefined,
  datum: string
): string | null {
  if (!(STATUS_MET_HERINNERINGEN as readonly string[]).includes(zaakStatus)) return `zaak staat op ${zaakStatus}`
  if (alleenBij && !alleenBij.includes(zaakStatus)) return `alleen bij ${alleenBij.join(" of ")}`
  if (b.gepland_op < plusDagen(datum, -1)) return "te laat, de wekker heeft deze dag gemist"
  if (TERMIJN_TEMPLATES.includes(b.template) && termijnStatus === "betaald") return "termijn is al betaald"
  return null
}
