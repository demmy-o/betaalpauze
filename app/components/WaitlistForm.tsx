"use client"

import { useActionState } from "react"
import { subscribe, type SubscribeResult } from "../actions/subscribe"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Foutmelding } from "@/components/ui/foutmelding"

const initialState: SubscribeResult = { status: "idle" }

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(subscribe, initialState)

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-lg bg-surface p-6 text-base">
        Bedankt! Je staat op de lijst. We laten van ons horen zodra Betaalpauze
        live gaat.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1">
        <Label htmlFor="email">
          E-mailadres
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jouw@email.nl"
          aria-invalid={state.status === "invalid" ? true : undefined}
        />

        {state.status === "invalid" && (
          <Foutmelding>
            Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt
            gemaakt.
          </Foutmelding>
        )}
        {state.status === "duplicate" && (
          <p className="text-sm">
            Dit e-mailadres staat al op de lijst.
          </p>
        )}
        {state.status === "error" && (
          <Foutmelding>
            Er ging iets mis. Probeer het zo nog eens.
          </Foutmelding>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        variant="primair"
        size="groot"
        className="self-start"
      >
        {isPending ? "Bezig..." : "Houd me op de hoogte"}
      </Button>

      <p className="text-caption text-muted-foreground">
        Door je aan te melden ga je akkoord dat we je e-mailadres bewaren om je
        op de hoogte te houden. Je kunt je op elk moment afmelden.
      </p>
    </form>
  )
}
