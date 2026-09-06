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
      <div className="rounded-[12px] bg-mint px-5 py-4 text-[15px] text-ink">
        Bedankt! Je staat op de lijst. We laten van ons horen zodra Betaalpauze
        live gaat.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1">
        <Label htmlFor="email" className="text-[14px] font-medium text-ink">
          E-mailadres
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jouw@email.nl"
          className="h-12 rounded-[12px] border-line bg-white px-4 text-[16px] text-ink placeholder:text-line md:text-[16px]"
        />

        {state.status === "invalid" && (
          <p className="text-[14px] text-[#a3251c]">
            Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt
            gemaakt.
          </p>
        )}
        {state.status === "duplicate" && (
          <p className="text-[14px] text-ink-soft">
            Dit e-mailadres staat al op de lijst.
          </p>
        )}
        {state.status === "error" && (
          <p className="text-[14px] text-[#a3251c]">
            Er ging iets mis. Probeer het zo nog eens.
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 self-start rounded-full bg-black px-[26px] text-[16px] font-medium text-white hover:bg-black/90"
      >
        {isPending ? "Bezig..." : "Houd me op de hoogte"}
      </Button>

      <p className="text-[12px] leading-[1.6] text-line">
        Door je aan te melden ga je akkoord dat we je e-mailadres bewaren om je
        op de hoogte te houden. Je kunt je op elk moment afmelden.
      </p>
    </form>
  )
}
