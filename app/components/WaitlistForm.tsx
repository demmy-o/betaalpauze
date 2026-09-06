"use client"

import { useActionState } from "react"
import { subscribe, type SubscribeResult } from "../actions/subscribe"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const initialState: SubscribeResult = { status: "idle" }

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(subscribe, initialState)

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-[#e6f7eb] px-5 py-4 text-sm text-[#1b6e52]">
        Bedankt! Je staat op de lijst. We laten van ons horen zodra Betaalpauze
        live gaat.
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="email" className="text-sm text-[#55536b]">
          E-mailadres
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jouw@email.nl"
          className="mt-1 h-12 rounded-full border border-[#e3e1ec] bg-white px-5"
        />
      </div>

      {state.status === "invalid" && (
        <p className="text-sm text-[#a3251c]">
          Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt
          gemaakt.
        </p>
      )}
      {state.status === "duplicate" && (
        <p className="text-sm text-[#55536b]">
          Dit e-mailadres staat al op de lijst.
        </p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-[#a3251c]">
          Er ging iets mis. Probeer het zo nog eens.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full rounded-full bg-[#1c1b2e] text-white hover:bg-[#1c1b2e]/90"
      >
        {isPending ? "Bezig..." : "Houd me op de hoogte"}
      </Button>

      <p className="text-xs text-[#8b899e]">
        Door je aan te melden ga je akkoord dat we je e-mailadres bewaren om je
        op de hoogte te houden. Je kunt je op elk moment afmelden.
      </p>
    </form>
  )
}
