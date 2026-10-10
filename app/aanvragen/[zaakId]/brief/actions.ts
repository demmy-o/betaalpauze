"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logEvent } from "@/lib/events"
import { createAdminClient } from "@/lib/supabase/admin"
import { haalZaak } from "@/lib/zaak"
import { rekenPlan, vandaag } from "@/lib/betaalplan"
import { MAX_TOELICHTING, briefAlsTekst, maakBrief } from "@/lib/brief"
import { maakPdf } from "@/lib/briefPdf"
import { vervangConceptPlan } from "@/lib/planOpslaan"
import { AFZENDER_BRIEF, verstuurMail } from "@/lib/verstuur"
import { BriefMail } from "@/emails/BriefMail"

// Verstuurt de brief naar de schuldeiser:
// vanaf voorstel@betaalpauze.nl, "namens [naam]", antwoorden gaan naar de gebruiker,
// de gebruiker krijgt een kopie (cc), en de PDF zit in de bijlage.
// In testmodus gaat alles naar het testadres (zie lib/verstuur.ts).
export async function verstuurBrief(zaakId: string, toelichtingRuw: string): Promise<{ melding: string } | void> {
  let zaak = await haalZaak(zaakId)
  if (!zaak?.brief || !zaak.plan) return { melding: "We konden je brief niet vinden. Log opnieuw in en probeer het nog eens." }
  if (zaak.status !== "concept") redirect(`/aanvragen/${zaakId}/verstuurd`)
  const schuldeiserEmail = zaak.schuldeiserEmail
  if (!schuldeiserEmail) return { melding: "Het e-mailadres van het bedrijf ontbreekt. Vul het in bij stap 1." }

  // Voorstel op een eerdere dag gemaakt? Dan rekenen we de datums opnieuw uit vanaf vandaag,
  // zodat de brief en de betaaldata kloppen met de dag van versturen.
  const nu = vandaag()
  if (zaak.plan.aangemaakt !== nu) {
    const { soort, pauzeMaanden, termijnen } = zaak.plan
    const nieuwPlan = rekenPlan({
      soort,
      bedragCenten: zaak.bedragCenten,
      startdatum: nu,
      pauzeMaanden: soort === "termijnen" ? undefined : pauzeMaanden,
      aantalTermijnen: soort === "pauze" ? undefined : termijnen.length,
    })
    if (!(await vervangConceptPlan(zaakId, nieuwPlan))) return { melding: "Versturen lukte niet. Probeer het opnieuw." }
    zaak = await haalZaak(zaakId)
    if (!zaak?.brief || !zaak.plan) return { melding: "Versturen lukte niet. Probeer het opnieuw." }
  }

  const supabase = await createClient()
  // De status mag alleen de server zetten. haalZaak hierboven heeft met de sessie van
  // de gebruiker al gecontroleerd dat deze zaak van hem is.
  const admin = createAdminClient()

  // Zet de zaak eerst op verstuurd. Lukt dat niet, dan is hij al verstuurd
  // (bijvoorbeeld door twee keer klikken). Zo gaat de brief nooit twee keer weg.
  const { data: vergrendeld } = await admin
    .from("zaken")
    .update({ status: "verstuurd", verstuurd_op: new Date().toISOString() })
    .eq("id", zaakId)
    .eq("status", "concept")
    .select("id")
  if (!vergrendeld?.length) redirect(`/aanvragen/${zaakId}/verstuurd`)

  const toelichting = toelichtingRuw.trim().slice(0, MAX_TOELICHTING)
  const brief = maakBrief({ ...zaak.brief, plan: zaak.plan, datum: nu, toelichting })
  const gebruikerEmail = zaak.brief.afzender.email

  const verzonden = await verstuurMail({
    vanNaam: `${brief.naam} via Betaalpauze`,
    vanAdres: AFZENDER_BRIEF,
    aan: schuldeiserEmail,
    cc: gebruikerEmail,
    antwoordAan: gebruikerEmail,
    onderwerp: brief.onderwerp,
    react: BriefMail({ brief }),
    tekst: briefAlsTekst(brief),
    bijlagen: [{ bestandsnaam: `betaalvoorstel-${zaak.brief.factuur.factuurnummer}.pdf`, inhoud: await maakPdf(brief) }],
  })

  if ("fout" in verzonden) {
    // Terug naar concept, zodat de gebruiker het opnieuw kan proberen.
    await admin.from("zaken").update({ status: "concept", verstuurd_op: null }).eq("id", zaakId)
    console.error("Brief versturen mislukt:", verzonden.fout)
    return { melding: "Versturen lukte niet. Probeer het over een paar minuten opnieuw." }
  }

  // De verstuurde brief bewaren. Alleen de server mag in brieven schrijven.
  const { data: plan } = await supabase
    .from("betaalplannen")
    .select("id")
    .eq("zaak_id", zaakId)
    .order("versie", { ascending: false })
    .limit(1)
    .single()

  await admin
    .from("brieven")
    .insert({
      zaak_id: zaakId,
      betaalplan_id: plan?.id ?? null,
      tekst: briefAlsTekst(brief),
      toelichting: toelichting || null,
      resend_id: verzonden.id,
      verstuurd_op: new Date().toISOString(),
    })

  await logEvent("brief_verstuurd", zaakId, { resend_id: verzonden.id })

  redirect(`/aanvragen/${zaakId}/verstuurd`)
}
