import "server-only"
import type { ReactElement } from "react"
import { Resend } from "resend"

// Alle mail van Betaalpauze gaat via deze functie.
// - Altijd vanaf een adres op @betaalpauze.nl.
// - Elke mail zegt voor wie hij is (soort): de schuldeiser, de gebruiker zelf, of Betaalpauze (beheer).
// - Staat MAIL_TEST_MODE op "true", dan gaat alles naar MAIL_TEST_ADDRESS,
//   met in het onderwerp naar wie hij eigenlijk zou gaan. Zo mailen we nooit
//   per ongeluk een echte schuldeiser.
// - Mail naar een schuldeiser gaat alleen weg als MAIL_ECHT op "true" staat. Anders weigeren we
//   hem altijd, wat de andere variabelen ook zeggen. MAIL_ECHT staat bewust niet in Netlify.
// - Staat MAIL_BETA op "true" (de bètaversie), dan gaat er NOOIT mail naar een schuldeiser,
//   ook niet met MAIL_ECHT. Mail voor de gebruiker gaat gewoon naar de gebruiker, mail voor
//   beheer alleen naar NOTIFY_EMAIL.

export const AFZENDER_BRIEF = "voorstel@betaalpauze.nl"

export type MailSoort = "schuldeiser" | "gebruiker" | "beheer"

type Mail = {
  soort: MailSoort
  vanNaam: string
  vanAdres: string
  aan: string
  cc?: string
  antwoordAan?: string
  onderwerp: string
  react: ReactElement
  tekst: string
  bijlagen?: { bestandsnaam: string; inhoud: Buffer }[]
}

export function testmodus() {
  return process.env.MAIL_TEST_MODE === "true"
}

export function mailBeta() {
  return process.env.MAIL_BETA === "true"
}

// De regel bovenaan de brief in de bètaversie (mail en PDF).
export function testversieRegel(bedrijf: string) {
  return `Testversie: deze brief is niet naar ${bedrijf} gestuurd.`
}

// Mag een mail naar een schuldeiser weg? Alleen met MAIL_ECHT=true. Los te testen (lib/verstuur.test.ts).
export function schuldeiserWeigert(soort: MailSoort, mailEcht: string | undefined): string | null {
  if (soort === "schuldeiser" && mailEcht !== "true") return "Mail naar een schuldeiser kan alleen met MAIL_ECHT=true."
  return null
}

// Mag deze mail in de bètaversie weg? Los te testen (lib/verstuur.test.ts).
export function betaWeigert(mail: Pick<Mail, "soort" | "aan" | "cc">, beheerAdres: string | undefined): string | null {
  if (mail.soort === "schuldeiser") return "In de bètaversie gaat er nooit mail naar een schuldeiser."
  if (mail.soort === "beheer" && (!beheerAdres || mail.aan.toLowerCase() !== beheerAdres.toLowerCase() || mail.cc)) {
    return "In de bètaversie gaat mail voor beheer alleen naar NOTIFY_EMAIL."
  }
  return null
}

export async function verstuurMail(mail: Mail): Promise<{ id: string } | { fout: string }> {
  if (!mail.vanAdres.endsWith("@betaalpauze.nl")) {
    return { fout: "Mail mag alleen vanaf een adres op @betaalpauze.nl." }
  }

  const geenEcht = schuldeiserWeigert(mail.soort, process.env.MAIL_ECHT)
  if (geenEcht) return { fout: geenEcht }

  if (mailBeta()) {
    const geweigerd = betaWeigert(mail, process.env.NOTIFY_EMAIL || process.env.MAIL_TEST_ADDRESS)
    if (geweigerd) return { fout: geweigerd }
  }

  let aan = mail.aan
  let cc = mail.cc
  let onderwerp = mail.onderwerp

  if (testmodus()) {
    const testAdres = process.env.MAIL_TEST_ADDRESS
    if (!testAdres) return { fout: "MAIL_TEST_MODE staat aan, maar MAIL_TEST_ADDRESS is leeg." }
    const echt = [mail.aan, mail.cc && `cc ${mail.cc}`].filter(Boolean).join(", ")
    onderwerp = `[TEST naar: ${echt}] ${mail.onderwerp}`
    aan = testAdres
    cc = undefined
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: `${mail.vanNaam} <${mail.vanAdres}>`,
    to: [aan],
    cc: cc ? [cc] : undefined,
    replyTo: mail.antwoordAan,
    subject: onderwerp,
    react: mail.react,
    text: mail.tekst,
    attachments: mail.bijlagen?.map((b) => ({ filename: b.bestandsnaam, content: b.inhoud })),
  })

  if (error || !data) return { fout: error?.message ?? "Onbekende fout bij Resend" }
  return { id: data.id }
}
