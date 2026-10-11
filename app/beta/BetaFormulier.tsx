"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { geefToegang, type BetaStand } from "./actions"

const beginStand: BetaStand = {}

export function BetaFormulier({ terug }: { terug?: string }) {
  const [stand, verstuur, bezig] = useActionState(geefToegang, beginStand)

  return (
    <form action={verstuur} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="terug" value={terug ?? ""} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="wachtwoord" className="text-sm font-medium text-ink">
          Wachtwoord
        </Label>
        <Input
          id="wachtwoord"
          name="wachtwoord"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={stand.fout ? true : undefined}
          aria-describedby={stand.fout ? "wachtwoord-fout" : undefined}
          className="h-12 rounded-md border-line-strong bg-surface px-4 focus-visible:border-line-strong focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet text-base text-ink placeholder:text-subtle"
        />
        {stand.fout && (
          <p id="wachtwoord-fout" role="alert" className="text-sm text-error">
            {stand.fout}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={bezig}
        className="h-12 w-full rounded-full bg-ink px-6 text-base font-medium text-white hover:bg-ink-soft sm:w-auto sm:self-start"
      >
        {bezig ? "Bezig met controleren..." : "Naar de bètaversie"}
      </Button>
    </form>
  )
}
