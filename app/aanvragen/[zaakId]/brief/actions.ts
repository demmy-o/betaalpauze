"use server"

import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { haalZaak, type ZaakMetPlan } from "@/lib/zaak"
import { rekenPlan, vandaag } from "@/lib/betaalplan"
import { MAX_TOELICHTING, briefAlsTekst, maakBrief } from "@/lib/brief"
import { maakPdf } from "@/lib/briefPdf"
import { vervangConceptPlan } from "@/lib/planOpslaan"
import { AFZENDER_BRIEF, mailBeta, testversieRegel, verstuurMail } from "@/lib/verstuur"
import { planBerichten } from "@/lib/wekker"
import { BriefMail } from "@/emails/BriefMail"
import { PostMelding } from "@/emails/PostMelding"

type Klaar = ZaakMetPlan & { brief: NonNullable<ZaakMetPlan["brief"]>; plan: NonNullable<ZaakMetPlan["plan"]> }

// Verstuurt de brief. Twee routes (gekozen in stap 1):
// - per mail: vanaf voorstel@betaalpauze.nl, "namens [naam]", antwoorden naar de gebruiker,
//   gebruiker in cc, PDF als bijlage. In testmodus gaat alles naar het testadres (lib/verstuur.ts).
// - per post: de zaak gaat op "wordt per post verstuurd" en Betaalpauze krijgt een melding.
//   Het script `npm run post` maakt later de definitieve brief met de postdatum.
// In de bètaversie (MAIL_BETA) gaat de brief bij beide routes alleen naar de gebruiker zelf (alsTest).
export async function verstuurBrief(zaakId: string, toelichtingRuw: string): Promise<{ melding: string } | void> {
  let zaak = await haalZaak(zaakId)
  if (!zaak?.brief || !zaak.plan) return { melding: "We konden je brief niet vinden. Log opnieuw in en probeer het nog eens." }
  if (zaak.status !== "concept") redirect(`/aanvragen/${zaakId}/verstuurd`)

  // Voorstel op een eerdere dag gemaakt? Dan rekenen we de datums opnieuw uit vanaf vandaag.
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

  const toelichting = toelichtingRuw.trim().slice(0, MAX_TOELICHTING)
  const klaar = zaak as Klaar

  const route = zaak.verzendroute === "post" ? "post" : "email"
  if (route === "post" && !postadresCompleet(klaar)) {
    return { melding: "Het postadres van het bedrijf is niet compleet. Vul het in bij stap 1." }
  }
  if (mailBeta()) return alsTest(klaar, toelichting, nu, route)

  return route === "post" ? perPost(klaar, toelichting, nu) : perMail(klaar, toelichting, nu)
}

function postadresCompleet(zaak: Klaar) {
  const { straat, postcode, plaats } = zaak.brief.schuldeiser
  return Boolean(straat && postcode && plaats)
}

// ---------------------------------------------------------------
// Route 1: per mail
// ---------------------------------------------------------------

async function perMail(zaak: Klaar, toelichting: string, nu: string): Promise<{ melding: string } | void> {
  const schuldeiserEmail = zaak.schuldeiserEmail
  if (!schuldeiserEmail) return { melding: "Het e-mailadres van het bedrijf ontbreekt. Vul het in bij stap 1." }

  // De status mag alleen de server zetten. haalZaak heeft met de sessie van de gebruiker
  // al gecontroleerd dat deze zaak van hem is.
  const admin = createAdminClient()

  // Zet de zaak eerst op verstuurd. Lukt dat niet, dan is hij al verstuurd
  // (bijvoorbeeld door twee keer klikken). Zo gaat de brief nooit twee keer weg.
  const { data: vergrendeld } = await admin
    .from("zaken")
    .update({ status: "verstuurd", verstuurd_op: new Date().toISOString() })
    .eq("id", zaak.id)
    .eq("status", "concept")
    .select("id, user_id")
  if (!vergrendeld?.length) redirect(`/aanvragen/${zaak.id}/verstuurd`)

  const brief = maakBrief({ ...zaak.brief, plan: zaak.plan, datum: nu, toelichting, route: "email" })
  const gebruikerEmail = zaak.brief.afzender.email

  const verzonden = await verstuurMail({
    soort: "schuldeiser",
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
    await admin.from("zaken").update({ status: "concept", verstuurd_op: null }).eq("id", zaak.id)
    console.error("Brief versturen mislukt:", verzonden.fout)
    return { melding: "Versturen lukte niet. Probeer het over een paar minuten opnieuw." }
  }

  // De verstuurde brief bewaren. Alleen de server mag in brieven schrijven.
  await admin.from("brieven").insert({
    zaak_id: zaak.id,
    betaalplan_id: await planId(zaak.id),
    tekst: briefAlsTekst(brief),
    toelichting: toelichting || null,
    resend_id: verzonden.id,
    verstuurd_op: new Date().toISOString(),
  })

  // Alle herinneringen inplannen (lib/herinneringen.ts). De wekker verstuurt ze op de juiste dag.
  await planBerichten(zaak.id, nu)

  await admin.from("events").insert({
    user_id: vergrendeld[0].user_id,
    zaak_id: zaak.id,
    naam: "brief_verstuurd",
    data: { route: "email", resend_id: verzonden.id },
  })

  redirect(`/aanvragen/${zaak.id}/verstuurd`)
}

// ---------------------------------------------------------------
// Route 2: per post
// ---------------------------------------------------------------

async function perPost(zaak: Klaar, toelichting: string, nu: string): Promise<{ melding: string } | void> {
  const { schuldeiser, afzender, factuur } = zaak.brief
  if (!schuldeiser.straat || !schuldeiser.postcode || !schuldeiser.plaats) {
    return { melding: "Het postadres van het bedrijf is niet compleet. Vul het in bij stap 1." }
  }

  const admin = createAdminClient()

  // Op "wordt per post verstuurd" zetten. Lukt dat niet, dan is hij al aangevraagd.
  const { data: vergrendeld } = await admin
    .from("zaken")
    .update({ status: "per_post" })
    .eq("id", zaak.id)
    .eq("status", "concept")
    .select("id, user_id")
  if (!vergrendeld?.length) redirect(`/aanvragen/${zaak.id}/verstuurd`)

  // De conceptbrief bewaren, met de toelichting. Het script vervangt hem door de
  // definitieve brief met de postdatum, en vult dan ook verstuurd_op in.
  const concept = maakBrief({ ...zaak.brief, plan: zaak.plan, datum: nu, toelichting, route: "post" })
  const { data: briefRij } = await admin
    .from("brieven")
    .insert({
      zaak_id: zaak.id,
      betaalplan_id: await planId(zaak.id),
      tekst: briefAlsTekst(concept),
      toelichting: toelichting || null,
    })
    .select("id")
    .single()

  // Melding aan Betaalpauze. In testmodus gaat ook deze naar het testadres.
  const naar = process.env.NOTIFY_EMAIL || process.env.MAIL_TEST_ADDRESS || ""
  const gemeld = await verstuurMail({
    soort: "beheer",
    vanNaam: "Betaalpauze",
    vanAdres: "post@betaalpauze.nl",
    aan: naar,
    onderwerp: `Brief per post versturen: ${factuur.factuurnummer} aan ${schuldeiser.naam}`,
    react: PostMelding({
      g: {
        zaakId: zaak.id,
        factuurnummer: factuur.factuurnummer,
        aan: [schuldeiser.naam, schuldeiser.straat, `${schuldeiser.postcode} ${schuldeiser.plaats}`],
        van: `${afzender.voornaam} ${afzender.achternaam} (${afzender.email})`,
        heeftToelichting: Boolean(toelichting),
      },
    }),
    tekst: [
      `Brief per post versturen voor factuur ${factuur.factuurnummer}.`,
      `Aan: ${schuldeiser.naam}, ${schuldeiser.straat}, ${schuldeiser.postcode} ${schuldeiser.plaats}`,
      `Van: ${afzender.voornaam} ${afzender.achternaam} (${afzender.email})`,
      `Draai op de postdag: npm run post -- ${zaak.id} JJJJ-MM-DD`,
    ].join("\n"),
  })

  if ("fout" in gemeld) {
    await admin.from("zaken").update({ status: "concept" }).eq("id", zaak.id)
    if (briefRij) await admin.from("brieven").delete().eq("id", briefRij.id)
    console.error("Postmelding mislukt:", gemeld.fout)
    return { melding: "Versturen lukte niet. Probeer het over een paar minuten opnieuw." }
  }

  await admin.from("events").insert({
    user_id: vergrendeld[0].user_id,
    zaak_id: zaak.id,
    naam: "brief_per_post_aangevraagd",
    data: { route: "post" },
  })

  redirect(`/aanvragen/${zaak.id}/verstuurd`)
}

// ---------------------------------------------------------------
// Bètaversie: de brief gaat alleen naar de gebruiker zelf
// ---------------------------------------------------------------

// Werkt voor beide routes hetzelfde: de brief gaat met PDF naar de gebruiker, met bovenaan
// "Testversie: deze brief is niet naar [bedrijf] gestuurd". Daarna gaat alles verder alsof
// hij verstuurd is (status verstuurd, herinneringen ingepland), zodat testers de hele route zien.
// Geen printopdracht, en nooit mail naar het bedrijf (dat bewaakt lib/verstuur.ts ook zelf).
async function alsTest(zaak: Klaar, toelichting: string, nu: string, route: "email" | "post"): Promise<{ melding: string } | void> {
  const admin = createAdminClient()

  const { data: vergrendeld } = await admin
    .from("zaken")
    .update({ status: "verstuurd", verstuurd_op: new Date().toISOString() })
    .eq("id", zaak.id)
    .eq("status", "concept")
    .select("id, user_id")
  if (!vergrendeld?.length) redirect(`/aanvragen/${zaak.id}/verstuurd`)

  const brief = maakBrief({ ...zaak.brief, plan: zaak.plan, datum: nu, toelichting, route })
  const regel = testversieRegel(zaak.brief.schuldeiser.naam)

  const verzonden = await verstuurMail({
    soort: "gebruiker",
    vanNaam: "Betaalpauze",
    vanAdres: AFZENDER_BRIEF,
    aan: zaak.brief.afzender.email,
    onderwerp: `[Testversie] ${brief.onderwerp}`,
    react: BriefMail({ brief, testversie: regel }),
    tekst: `${regel}\n\n${briefAlsTekst(brief)}`,
    bijlagen: [
      { bestandsnaam: `betaalvoorstel-${zaak.brief.factuur.factuurnummer}.pdf`, inhoud: await maakPdf(brief, regel) },
    ],
  })

  if ("fout" in verzonden) {
    await admin.from("zaken").update({ status: "concept", verstuurd_op: null }).eq("id", zaak.id)
    console.error("Testbrief versturen mislukt:", verzonden.fout)
    return { melding: "Versturen lukte niet. Probeer het over een paar minuten opnieuw." }
  }

  await admin.from("brieven").insert({
    zaak_id: zaak.id,
    betaalplan_id: await planId(zaak.id),
    tekst: briefAlsTekst(brief),
    toelichting: toelichting || null,
    resend_id: verzonden.id,
    verstuurd_op: new Date().toISOString(),
  })

  await planBerichten(zaak.id, nu)

  await admin.from("events").insert({
    user_id: vergrendeld[0].user_id,
    zaak_id: zaak.id,
    naam: "brief_verstuurd",
    data: { route, resend_id: verzonden.id, beta: true },
  })

  redirect(`/aanvragen/${zaak.id}/verstuurd`)
}

async function planId(zaakId: string) {
  const { data } = await createAdminClient()
    .from("betaalplannen")
    .select("id")
    .eq("zaak_id", zaakId)
    .order("versie", { ascending: false })
    .limit(1)
    .single()
  return data?.id ?? null
}
