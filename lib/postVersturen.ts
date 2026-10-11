import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { MAX_PAUZE_MAANDEN, datumLang, euro, plusDagen, plusMaanden, rekenPlan, vandaag, type Plan, type Soort } from "@/lib/betaalplan"
import { briefAlsTekst, maakBrief, type Brief } from "@/lib/brief"
import { berekenBerichten } from "@/lib/herinneringen"
import { maakPdf } from "@/lib/briefPdf"
import { vervangConceptPlan } from "@/lib/planOpslaan"
import { planBerichten } from "@/lib/wekker"
import { verstuurMail } from "@/lib/verstuur"
import { EenvoudigeMail } from "@/emails/EenvoudigeMail"
import { HerinneringMail } from "@/emails/HerinneringMail"

// Een brief die per post moet (status per_post) definitief maken en op "verstuurd" zetten.
// Wordt gebruikt door het script `npm run post`. Alles telt vanaf de postdatum:
// de datum in de brief, de betaaldata, de 14 dagen voor het bedrijf en de herinneringen.

export const MAX_DAGEN_VOORUIT = 3

export type PostVoorbereiding = {
  zaakId: string
  userId: string
  gebruikerEmail: string
  gebruikerVoornaam: string
  aanvraagdatum: string
  postdatum: string
  brief: Brief
  plan: Plan
  conceptBriefId: string | null
  toelichting: string | null
  aantalHerinneringen: number
  eersteHerinnering: string | null
}

// Zoekt de zaak op en controleert alles. Verandert nog niets.
// Geeft een melding terug als er iets niet klopt.
export async function bereidPostVoor(
  zaakOfFactuur: string,
  postdatum: string
): Promise<{ ok: true; v: PostVoorbereiding } | { ok: false; melding: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(postdatum)) return { ok: false, melding: "De postdatum moet zo: JJJJ-MM-DD." }

  const admin = createAdminClient()
  const isId = /^[0-9a-f-]{36}$/.test(zaakOfFactuur)
  const { data: zaken } = await admin
    .from("zaken")
    .select(
      `id, user_id, status, verstuurd_op, verzendroute, factuurnummer, factuurdatum, bedrag_centen, klantnummer,
       post_straat, post_postcode, post_plaats, schuldeisers(naam, straat, postcode, plaats)`
    )
    .eq(isId ? "id" : "factuurnummer", zaakOfFactuur)

  if (!zaken?.length) return { ok: false, melding: `Geen zaak gevonden voor "${zaakOfFactuur}".` }
  if (zaken.length > 1) {
    return {
      ok: false,
      melding: `Er zijn ${zaken.length} zaken met factuurnummer ${zaakOfFactuur}. Gebruik het zaak-id:\n${zaken.map((z) => `  ${z.id} (${z.status})`).join("\n")}`,
    }
  }
  const zaak = zaken[0]

  // Alleen bij status per_post. Zo doet nog een keer draaien niets.
  if (zaak.status !== "per_post") {
    const sinds = zaak.verstuurd_op ? ` sinds ${datumLang(zaak.verstuurd_op.slice(0, 10))}` : ""
    return { ok: false, melding: `Deze zaak staat op "${zaak.status}"${sinds}, niet op "per_post". Er is niets gedaan.` }
  }

  // Wanneer is de brief per post aangevraagd?
  const { data: aanvraag } = await admin
    .from("events")
    .select("created_at")
    .eq("zaak_id", zaak.id)
    .eq("naam", "brief_per_post_aangevraagd")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle()
  const { data: concept } = await admin
    .from("brieven")
    .select("id, toelichting, created_at")
    .eq("zaak_id", zaak.id)
    .is("verstuurd_op", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  const aanvraagMoment = aanvraag?.created_at ?? concept?.created_at
  if (!aanvraagMoment) return { ok: false, melding: "We vinden niet wanneer deze brief is aangevraagd. Er is niets gedaan." }
  const aanvraagdatum = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date(aanvraagMoment))

  if (postdatum < aanvraagdatum) {
    return { ok: false, melding: `De postdatum ligt vóór de aanvraag (${datumLang(aanvraagdatum)}). Er is niets gedaan.` }
  }
  if (postdatum > plusDagen(vandaag(), MAX_DAGEN_VOORUIT)) {
    return { ok: false, melding: `De postdatum ligt meer dan ${MAX_DAGEN_VOORUIT} dagen vooruit. Er is niets gedaan.` }
  }

  // Het voorstel zoals de gebruiker het koos, opnieuw uitgerekend vanaf de postdatum.
  const { data: planRij } = await admin
    .from("betaalplannen")
    .select("soort, pauze_tot, created_at, termijnen(id)")
    .eq("zaak_id", zaak.id)
    .order("versie", { ascending: false })
    .limit(1)
    .single()
  if (!planRij) return { ok: false, melding: "Deze zaak heeft geen voorstel. Er is niets gedaan." }

  const soort = planRij.soort as Soort
  const planStart = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date(planRij.created_at))
  let pauzeMaanden: number | undefined
  if (planRij.pauze_tot) {
    for (let m = 1; m <= MAX_PAUZE_MAANDEN; m++) if (plusMaanden(planStart, m) === planRij.pauze_tot) pauzeMaanden = m
  }
  const plan = rekenPlan({
    soort,
    bedragCenten: zaak.bedrag_centen,
    startdatum: postdatum,
    pauzeMaanden: soort === "termijnen" ? undefined : pauzeMaanden,
    aantalTermijnen: soort === "pauze" ? undefined : planRij.termijnen.length,
  })

  const { data: gebruiker } = await admin.auth.admin.getUserById(zaak.user_id)
  const { data: profiel } = await admin
    .from("profielen")
    .select("voornaam, achternaam, straat, postcode, plaats")
    .eq("id", zaak.user_id)
    .single()
  const sd = (Array.isArray(zaak.schuldeisers) ? zaak.schuldeisers[0] : zaak.schuldeisers) as {
    naam: string
    straat: string | null
    postcode: string | null
    plaats: string | null
  }

  const brief = maakBrief({
    afzender: {
      voornaam: profiel?.voornaam ?? "",
      achternaam: profiel?.achternaam ?? "",
      straat: profiel?.straat ?? "",
      postcode: profiel?.postcode ?? "",
      plaats: profiel?.plaats ?? "",
      email: gebruiker.user?.email ?? "",
    },
    // Het postadres van de zaak gaat voor (als de gebruiker dat van de factuur overnam).
    schuldeiser: zaak.post_straat
      ? { naam: sd.naam, straat: zaak.post_straat, postcode: zaak.post_postcode ?? undefined, plaats: zaak.post_plaats ?? undefined }
      : { naam: sd.naam, straat: sd.straat ?? undefined, postcode: sd.postcode ?? undefined, plaats: sd.plaats ?? undefined },
    factuur: {
      factuurnummer: zaak.factuurnummer,
      factuurdatum: zaak.factuurdatum,
      bedragCenten: zaak.bedrag_centen,
      klantnummer: zaak.klantnummer ?? undefined,
    },
    plan,
    datum: postdatum,
    toelichting: concept?.toelichting ?? undefined,
    route: "post",
  })

  // Hoeveel herinneringen er komen (met nep-id's, alleen om te tellen).
  const proefBerichten = berekenBerichten(
    postdatum,
    plan.termijnen.map((t) => ({ id: `t${t.volgnummer}`, volgnummer: t.volgnummer, vervaldatum: t.vervaldatum }))
  )

  return {
    ok: true,
    v: {
      zaakId: zaak.id,
      userId: zaak.user_id,
      gebruikerEmail: gebruiker.user?.email ?? "",
      gebruikerVoornaam: profiel?.voornaam ?? "",
      aanvraagdatum,
      postdatum,
      brief,
      plan,
      conceptBriefId: concept?.id ?? null,
      toelichting: concept?.toelichting ?? null,
      aantalHerinneringen: proefBerichten.length,
      eersteHerinnering: proefBerichten[0]?.gepland_op ?? null,
    },
  }
}

// Voert alles uit: zaak op verstuurd, plan en brief definitief, herinneringen inplannen,
// PDF naar Betaalpauze om te printen, en de gebruiker laten weten dat de brief op de post is.
export async function verstuurPerPost(v: PostVoorbereiding, siteUrl: string): Promise<{ waarschuwingen: string[] }> {
  const admin = createAdminClient()
  const waarschuwingen: string[] = []

  // Eerst de status, alleen als hij nog op per_post staat. Zo kan het nooit dubbel.
  const { data: vergrendeld } = await admin
    .from("zaken")
    .update({ status: "verstuurd", verstuurd_op: `${v.postdatum}T12:00:00+00:00` })
    .eq("id", v.zaakId)
    .eq("status", "per_post")
    .select("id")
  if (!vergrendeld?.length) throw new Error("De zaak staat niet meer op per_post. Er is niets gedaan.")

  if (!(await vervangConceptPlan(v.zaakId, v.plan))) {
    waarschuwingen.push("Het oude plan weghalen lukte niet. Het nieuwe plan is wel opgeslagen en gaat voor.")
  }

  const tekst = briefAlsTekst(v.brief)
  const briefRij = { tekst, verstuurd_op: `${v.postdatum}T12:00:00+00:00` }
  const { error: briefFout } = v.conceptBriefId
    ? await admin.from("brieven").update(briefRij).eq("id", v.conceptBriefId)
    : await admin.from("brieven").insert({ ...briefRij, zaak_id: v.zaakId, toelichting: v.toelichting })
  if (briefFout) waarschuwingen.push(`De brief bewaren lukte niet: ${briefFout.message}`)

  await planBerichten(v.zaakId, v.postdatum)

  const pdf = await maakPdf(v.brief)
  const bestandsnaam = `betaalvoorstel-${v.brief.onderwerp.match(/factuur (\S+?)(,|$)/)?.[1] ?? "brief"}.pdf`

  // De definitieve PDF naar Betaalpauze, om te printen.
  const naarJou = await verstuurMail({
    vanNaam: "Betaalpauze",
    vanAdres: "post@betaalpauze.nl",
    aan: process.env.NOTIFY_EMAIL || process.env.MAIL_TEST_ADDRESS || "",
    onderwerp: `Printen en posten: ${v.brief.onderwerp}`,
    react: EenvoudigeMail({
      alineas: [
        `De definitieve brief met postdatum ${datumLang(v.postdatum)} zit in de bijlage. Print hem en doe hem op de post.`,
        `Aan:\n${v.brief.ontvanger.join("\n")}`,
        `De zaak staat nu op verstuurd en de herinneringen zijn ingepland. Zaak-id: ${v.zaakId}`,
      ],
    }),
    tekst: `De definitieve brief met postdatum ${v.postdatum} zit in de bijlage.\n\nAan:\n${v.brief.ontvanger.join("\n")}`,
    bijlagen: [{ bestandsnaam, inhoud: pdf }],
  })
  if ("fout" in naarJou) waarschuwingen.push(`De PDF naar jou mailen lukte niet: ${naarJou.fout}`)

  // De gebruiker laten weten dat de brief op de post is.
  const eerste = v.plan.termijnen[0]
  const naarGebruiker = await verstuurMail({
    vanNaam: "Betaalpauze",
    vanAdres: "voorstel@betaalpauze.nl",
    aan: v.gebruikerEmail,
    onderwerp: "Je brief is op de post",
    react: HerinneringMail({
      inhoud: {
        onderwerp: "Je brief is op de post",
        alineas: [
          `Hoi ${v.gebruikerVoornaam},`,
          `We hebben je brief op ${datumLang(v.postdatum)} op de post gedaan. Hij zit ook als PDF bij deze mail.`,
          `${v.brief.ontvanger[0]} heeft tot ${datumLang(plusDagen(v.postdatum, 14))} om te reageren. Het antwoord komt in jouw mailbox. Hoor je niets, dan begin je op ${datumLang(eerste.vervaldatum)} met betalen: ${euro(eerste.bedragCenten)}.`,
        ],
        knoppen: [{ tekst: "Naar Mijn plan", url: `${siteUrl}/mijn-plan`, soort: "primair" }],
      },
    }),
    tekst: `We hebben je brief op ${v.postdatum} op de post gedaan. De brief zit als PDF bij deze mail.`,
    bijlagen: [{ bestandsnaam, inhoud: pdf }],
  })
  if ("fout" in naarGebruiker) waarschuwingen.push(`De gebruiker mailen lukte niet: ${naarGebruiker.fout}`)

  await admin.from("events").insert({
    user_id: v.userId,
    zaak_id: v.zaakId,
    naam: "brief_op_post",
    data: { postdatum: v.postdatum },
  })

  return { waarschuwingen }
}
