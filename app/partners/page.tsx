import { Menu } from "../components/Menu"
import { buttonVariants } from "@/components/ui/button"
import { PartnerFormulier } from "./PartnerFormulier"

export const metadata = {
  title: "Voor schuldeisers · Betaalpauze.nl",
  description:
    "Betaalpauze helpt klanten met een betaalachterstand om zelf een voorstel te doen. We zoeken schuldeisers die dit samen met ons willen testen.",
}

// Partnerpagina voor schuldeisers (ticket 15). Teksten van Demmy, niet aanpassen.
// Opbouw volgens docs/design.md: brede pastelbanden, één boodschap per blok, formulier onderaan.

function Placeholder({ children }: { children: React.ReactNode }) {
  // Tekst tussen [haken] die Demmy later invult. Zichtbaar gemarkeerd, zodat hij niet vergeten wordt.
  return <span className="rounded-sm bg-warning-tint px-1 outline outline-1 outline-dashed outline-warning">{children}</span>
}

function Band({ kleur, children }: { kleur: string; children: React.ReactNode }) {
  return (
    <section className={`band ${kleur}`}>
      <div className="mx-auto max-w-page px-5 md:px-8 lg:px-12">
        <div className="flex max-w-prose flex-col gap-5">{children}</div>
      </div>
    </section>
  )
}

function Lijst({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-lead text-ink">
          <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-ink" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PartnersPagina() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Menu actief="schuldeisers" knop={{ tekst: "Een pilot bespreken", href: "#pilot" }} />

      <main className="flex-1">
        {/* HERO */}
        <section className="band bg-mint">
          <div className="mx-auto max-w-page px-5 md:px-8 lg:px-12">
            <div className="flex max-w-prose flex-col gap-6">
              <h1 className="text-display tracking-display text-ink">Betaalproblemen oplossen voordat incasso nodig is</h1>
              <p className="text-lead text-ink">
                Betaalpauze helpt klanten met een betaalachterstand om zelf een voorstel te doen. Op tijd en met een
                plan dat ze kunnen volhouden. We zoeken schuldeisers die dit samen met ons willen testen.
              </p>
              <a
                href="#pilot"
                className={buttonVariants({ variant: "primair", size: "groot", className: "w-full md:w-auto md:self-start" })}
              >
                Een pilot bespreken
              </a>
            </div>
          </div>
        </section>

        {/* BLOK 1: WAT ER VERANDERT */}
        <Band kleur="bg-geel-tint">
          <h2 className="text-h2 text-ink">Een gemiste betaling begint meestal klein</h2>
          <p className="text-lead text-ink">
            Een onverwachte rekening. Een maand waarin het net niet rondkomt. Wie dan een betaling mist, stelt contact
            vaak uit. Uit schaamte, of omdat regelen moeite kost.
          </p>
          <p className="text-lead text-ink">
            Ondertussen loopt de achterstand op en komen er kosten bij. Hoe later het eerste contact, hoe moeilijker het
            wordt om er samen uit te komen.
          </p>
        </Band>

        {/* BLOK 2: WAT WE ZAGEN */}
        <Band kleur="bg-grijs-soft">
          <h2 className="text-h2 text-ink">De regeling bestaat al. De klant komt er alleen niet altijd</h2>
          <p className="text-lead text-ink">
            We keken in oktober 2026 bij vijftien grote schuldeisers hoe je een betalingsregeling aanvraagt. Bijna
            allemaal doen ze dat via een eigen online omgeving of de telefoon. Vaak met voorwaarden, zoals een minimaal
            bedrag per maand of een automatische incasso.
          </p>
          <p className="text-lead text-ink">
            Voor veel klanten werkt dat goed. Wij denken dat juist de klanten die het moeilijk hebben, die stap niet
            zetten. Dat willen we samen met jou testen.
          </p>
        </Band>

        {/* BLOK 3: WAT BETAALPAUZE DOET */}
        <Band kleur="bg-surface">
          <h2 className="text-h2 text-ink">Een voorstel van de klant, in een vorm die jij kunt verwerken</h2>
          <Lijst
            items={[
              "De klant kiest zelf wat haalbaar is: een korte pauze, termijnen of allebei.",
              "Wij maken er een duidelijke brief van, met factuurnummer, klantnummer en betaaldata.",
              "De brief komt bij jou binnen per mail of per post. Of we verwijzen de klant naar jouw eigen omgeving, als dat beter past.",
              "Daarna helpen we de klant het plan vol te houden, met herinneringen rond elke betaaldatum.",
              "Er gaat geen geld via Betaalpauze. De klant betaalt rechtstreeks aan jou.",
            ]}
          />
        </Band>

        {/* BLOK 4: WAT HET OPLEVERT */}
        <Band kleur="bg-groen-tint">
          <h2 className="text-h2 text-ink">Wat je eraan hebt</h2>
          <Lijst
            items={[
              "Klanten die zich zelf melden, met een concreet voorstel.",
              "Voorstellen in een vaste vorm, met alle gegevens die je nodig hebt.",
              "Klanten die vaker op tijd betalen, omdat we ze helpen het plan vol te houden.",
              "Cijfers over hoe vaak klanten een voorstel doen en of ze het volhouden. Bruikbaar voor je rapportage over sociaal incasseren.",
            ]}
          />
        </Band>

        {/* BLOK 5: HOE EEN PILOT WERKT */}
        <Band kleur="bg-surface">
          <h2 className="text-h2 text-ink">Zo werkt een pilot</h2>
          <ol className="flex flex-col gap-4">
            {[
              <>
                <span className="font-medium">Kennismaken.</span> Een halfuur over hoe jullie nu met achterstanden omgaan.
              </>,
              <>
                <span className="font-medium">Afspraken maken.</span> Welke klanten doen mee, hoe komen voorstellen binnen,
                en wat zijn jullie grenzen, zoals een minimaal bedrag of een maximale pauze.
              </>,
              <>
                <span className="font-medium">Testen.</span> <Placeholder>[duur, bijvoorbeeld drie maanden]</Placeholder>. Je
                krijgt elke maand de cijfers.
              </>,
              <>
                <span className="font-medium">Samen evalueren</span>, en beslissen of en hoe we verder gaan.
              </>,
            ].map((stap, i) => (
              <li key={i} className="flex gap-4 text-lead text-ink">
                <span
                  aria-hidden
                  className="tabular flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-base font-medium"
                >
                  {i + 1}
                </span>
                <span className="pt-1">{stap}</span>
              </li>
            ))}
          </ol>
          <p className="text-base text-muted-foreground">
            <Placeholder>[kosten van de pilot: nog invullen]</Placeholder>
          </p>
        </Band>

        {/* OVER MIJ */}
        <section className="bg-surface pb-14 lg:pb-24">
          <div className="mx-auto max-w-page px-5 md:px-8 lg:px-12">
            <p className="max-w-prose border-t border-line pt-8 text-base text-muted-foreground">
              Ik ben Demmy Onink, product- en gedragsontwerper. Ik werk al ruim twintig jaar aan digitale producten,
              vooral voor financiële dienstverleners. Betaalpauze bouw ik omdat ik zie dat goede regelingen vaak niet
              aankomen bij de mensen die ze nodig hebben.
            </p>
          </div>
        </section>

        {/* FORMULIER */}
        <section id="pilot" className="band scroll-mt-4 bg-rood-tint">
          <div className="mx-auto max-w-page px-5 md:px-8 lg:px-12">
            <div className="flex max-w-form flex-col gap-6 rounded-lg bg-surface p-6 md:p-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-h2 text-ink">Een pilot bespreken</h2>
                <p className="text-base text-muted-foreground">
                  Laat je gegevens achter. Ik neem binnen twee werkdagen contact met je op.
                </p>
              </div>
              <PartnerFormulier />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-ink px-5 py-8 text-sm text-white md:px-8 lg:px-12">
        <div className="mx-auto max-w-page">betaalpauze.nl</div>
      </footer>
    </div>
  )
}
