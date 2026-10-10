import "server-only"
import type { ReactElement } from "react"
import { Resend } from "resend"

// Alle mail van Betaalpauze gaat via deze functie.
// - Altijd vanaf een adres op @betaalpauze.nl.
// - Staat MAIL_TEST_MODE op "true", dan gaat alles naar MAIL_TEST_ADDRESS,
//   met in het onderwerp naar wie hij eigenlijk zou gaan. Zo mailen we nooit
//   per ongeluk een echte schuldeiser.

export const AFZENDER_BRIEF = "voorstel@betaalpauze.nl"

type Mail = {
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

export async function verstuurMail(mail: Mail): Promise<{ id: string } | { fout: string }> {
  if (!mail.vanAdres.endsWith("@betaalpauze.nl")) {
    return { fout: "Mail mag alleen vanaf een adres op @betaalpauze.nl." }
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
