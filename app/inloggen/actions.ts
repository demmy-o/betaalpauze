"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CodeResult =
  | { status: "idle" }
  | { status: "code_verstuurd"; email: string }
  | { status: "fout"; email?: string; melding: string }

// In testmodus gaat er alleen mail naar MAIL_TEST_ADDRESS (of een +variant daarvan).
function magMailen(email: string) {
  if (process.env.MAIL_TEST_MODE !== "true") return true

  const test = (process.env.MAIL_TEST_ADDRESS ?? "").toLowerCase()
  const [testNaam, testDomein] = test.split("@")
  const [naam, domein] = email.split("@")
  return domein === testDomein && naam.split("+")[0] === testNaam
}

export async function stuurCode(
  _prev: CodeResult,
  formData: FormData
): Promise<CodeResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return { status: "fout", email, melding: "Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt gemaakt." }
  }

  if (!magMailen(email)) {
    return { status: "fout", email, melding: "We testen nog. Inloggen kan nu alleen met het testadres." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) {
    return { status: "fout", email, melding: "We konden geen code sturen. Probeer het over een paar minuten opnieuw." }
  }

  return { status: "code_verstuurd", email }
}

export async function controleerCode(
  _prev: CodeResult,
  formData: FormData
): Promise<CodeResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const code = String(formData.get("code") ?? "").replace(/\s/g, "")

  if (!/^\d{6}$/.test(code)) {
    return { status: "fout", email, melding: "De code heeft 6 cijfers. Check of je er geen mist." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" })

  if (error) {
    return { status: "fout", email, melding: "Deze code klopt niet of is verlopen. Vraag een nieuwe code aan." }
  }

  redirect("/inloggen")
}

export async function uitloggen() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/inloggen")
}
