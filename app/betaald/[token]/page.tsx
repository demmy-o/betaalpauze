import Link from "next/link"
import { bekijkToken } from "@/lib/betaling"
import { datumLang, euro } from "@/lib/betaalplan"
import { createAdminClient } from "@/lib/supabase/admin"
import { BevestigKnop } from "./BevestigKnop"
import { Pagina } from "@/components/ui/pagina"
import { Kaart } from "@/components/ui/kaart"

export const metadata = { title: "Je betaling · Betaalpauze.nl", robots: { index: false } }

// De pagina achter de ja/nee-knoppen in de mail "Heb je betaald?".
// Geen inloggen nodig: de eenmalige code in de link is genoeg.
export default async function BetaaldPagina({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ antwoord?: string }>
}) {
  const { token } = await params
  const { antwoord } = await searchParams
  const info = await bekijkToken(token)

  // Elke klik in de mail vastleggen (ook als de link niet meer werkt).
  await createAdminClient()
    .from("events")
    .insert({
      user_id: info.geldig ? info.userId : null,
      zaak_id: info.geldig ? info.zaakId : null,
      naam: antwoord === "nee" ? "betaalvraag_nee_geklikt" : "betaalvraag_ja_geklikt",
      data: info.geldig ? { bericht_id: info.berichtId } : { reden: info.reden },
    })

  return (
    <Pagina kolom="breed">
      {!info.geldig ? (
        <LinkWerktNiet reden={info.reden} />
      ) : antwoord === "nee" ? (
        <NogNietBetaald token={token} schuldeiser={info.schuldeiser} bedrag={info.bedragCenten} />
      ) : info.termijnBetaald ? (
        <AlBetaald />
      ) : (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 text-ink">Heb je betaald?</h1>
            <p className="text-lead text-muted-foreground">
              Op {datumLang(info.vervaldatum)} moest je{" "}
              <span className="tabular font-medium text-ink">{euro(info.bedragCenten)}</span> betalen aan{" "}
              {info.schuldeiser}.
            </p>
          </div>
          <BevestigKnop token={token} knopTekst={`Ja, ik heb ${euro(info.bedragCenten)} betaald`} />
          <Link
            href={`/betaald/${token}?antwoord=nee`}
            className="self-start text-sm text-ink underline underline-offset-4 hover:text-ink-soft"
          >
            Nee, nog niet
          </Link>
        </section>
      )}
    </Pagina>
  )
}

function NogNietBetaald({ token, schuldeiser, bedrag }: { token: string; schuldeiser: string; bedrag: number }) {
  return (
    <section className="flex flex-col gap-6">
      <Kaart as="div">
        <h1 className="text-h2 text-ink">Dat kan gebeuren</h1>
        <p className="text-base text-ink">
          Het is goed dat je het laat weten. Dit kun je nu doen:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-base text-ink">
          <li>
            <span className="font-medium">Betaal een deel.</span> Ook een deel van{" "}
            <span className="tabular">{euro(bedrag)}</span> laat zien dat je je afspraak serieus neemt.
          </li>
          <li>
            <span className="font-medium">Laat {schuldeiser} het weten.</span> Stuur een korte mail: wanneer je wel kunt
            betalen en hoeveel. Doe dat liefst vandaag.
          </li>
          <li>
            <span className="font-medium">Past je plan niet meer?</span> Vraag {schuldeiser} om de termijnen aan te
            passen, bijvoorbeeld kleinere bedragen over meer maanden.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Kom je er niet uit? Het Juridisch Loket helpt gratis, via juridischloket.nl of 0900 8020.
        </p>
      </Kaart>
      <Link
        href={`/betaald/${token}?antwoord=ja`}
        className="self-start text-sm text-ink underline underline-offset-4 hover:text-ink-soft"
      >
        Toch al betaald? Geef het hier door
      </Link>
    </section>
  )
}

function AlBetaald() {
  return (
    <Kaart className="gap-3">
      <h1 className="text-h2 text-ink">Deze betaling staat al op betaald</h1>
      <p className="text-base text-ink">Je hoeft niets meer te doen.</p>
      <Link href="/mijn-plan" className="self-start text-sm text-ink underline underline-offset-4 hover:text-ink-soft">
        Naar Mijn plan
      </Link>
    </Kaart>
  )
}

function LinkWerktNiet({ reden }: { reden: "onbekend" | "gebruikt" | "verlopen" }) {
  const tekst = {
    gebruikt: "Deze link is al gebruikt. Je antwoord stond al genoteerd.",
    verlopen: "Deze link is verlopen. Je kunt je betaling ook op Mijn plan doorgeven.",
    onbekend: "Deze link werkt niet. Je kunt je betaling ook op Mijn plan doorgeven.",
  }[reden]
  return (
    <Kaart className="gap-3">
      <h1 className="text-h2 text-ink">Deze link werkt niet meer</h1>
      <p className="text-base text-ink">{tekst}</p>
      <Link href="/mijn-plan" className="self-start text-sm text-ink underline underline-offset-4 hover:text-ink-soft">
        Naar Mijn plan
      </Link>
    </Kaart>
  )
}
