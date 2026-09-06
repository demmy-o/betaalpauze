"use server"

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SubscribeResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "invalid" }
  | { status: "error" }

export async function subscribe(
  _prevState: SubscribeResult,
  formData: FormData
): Promise<SubscribeResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return { status: "invalid" }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.from("signups").insert({ email })

  if (error) {
    if (error.code === "23505") {
      return { status: "duplicate" }
    }
    console.error("Supabase insert error", error)
    return { status: "error" }
  }

  await notifyByEmail(email)

  return { status: "success" }
}

async function notifyByEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const toEmail = process.env.NOTIFY_EMAIL ?? "contact@demmyonink.nl"

  if (!apiKey || !fromEmail) {
    console.warn("Resend niet geconfigureerd, mail overgeslagen")
    return
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Nieuwe aanmelding wachtlijst Betaalpauze",
      html: `<p>Nieuw e-mailadres op de wachtlijst: <strong>${email}</strong></p>`,
    })
  } catch (err) {
    console.error("Resend mail versturen mislukt", err)
  }
}
