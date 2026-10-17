"use client"

import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { geefToegang, type BetaStand } from "./actions"
import { Foutmelding } from "@/components/ui/foutmelding"
import { Veldengroep } from "@/components/ui/veldengroep"

const beginStand: BetaStand = {}

export function BetaFormulier({ terug }: { terug?: string }) {
  const [stand, verstuur, bezig] = useActionState(geefToegang, beginStand)

  return (
    <form action={verstuur} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="terug" value={terug ?? ""} />
      <Veldengroep>
        <Label htmlFor="wachtwoord">
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
        />
        {stand.fout && (
          <Foutmelding id="wachtwoord-fout" role="alert">
            {stand.fout}
          </Foutmelding>
        )}
      </Veldengroep>

      <Button
        type="submit"
        disabled={bezig}
        variant="primair"
        size="groot"
        className="w-full md:w-auto md:self-start"
      >
        {bezig ? "Bezig met controleren..." : "Naar de bètaversie"}
      </Button>
    </form>
  )
}
