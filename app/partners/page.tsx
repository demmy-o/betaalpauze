import { Menu } from "../components/Menu"
import { buttonVariants } from "@/components/ui/button"
import { Beeldsectie } from "@/components/ui/beeldsectie"
import { PartnerFormulier } from "./PartnerFormulier"
import { PauseIllustration } from "../components/PauseIllustration"

export const metadata = {
  title: "Voor schuldeisers · Betaalpauze.nl",
  description:
    "Betaalpauze helpt klanten met een betaalachterstand om zelf een voorstel te doen. We zoeken schuldeisers die dit samen met ons willen testen.",
}

// Partnerpagina voor schuldeisers (ticket 15). Teksten van Demmy, niet aanpassen.
// Opbouw: tekst op de neutrale achtergrond, met naast elk blok een kleurvlak voor een illustratie (Beeldsectie).
// Het vlak wisselt per blok van kant, naast elkaar liggende blokken hebben een andere kleur.
// Onderaan het formulier over de volle breedte.

function Lijst({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-lead">
          <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-ink" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PartnersPagina() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Menu actief="schuldeisers" knop={{ tekst: "Een pilot bespreken", href: "#pilot" }} />

      <main className="flex-1">
        {/* HERO */}
        <Beeldsectie kleur="bg-mint" beeld={<PauseIllustration achtergrond={false} />}>
          <h1 className="font-display text-display text-ink">Betaalproblemen oplossen voordat incasso nodig is</h1>
          <p className="text-lead">
            Betaalpauze helpt klanten met een betaalachterstand om zelf een voorstel te doen. Op tijd en met een plan
            dat ze kunnen volhouden. We zoeken schuldeisers die dit samen met ons willen testen.
          </p>
          <a
            href="#pilot"
            className={buttonVariants({ variant: "primair", size: "groot", className: "w-full md:w-auto md:self-start" })}
          >
            Een pilot bespreken
          </a>
        </Beeldsectie>

        {/* BLOK 1: WAT ER VERANDERT */}
        <Beeldsectie kleur="bg-geel-soft" beeldKant="links">
          <h2 className="text-h2 text-ink">Een gemiste betaling begint meestal klein</h2>
          <p className="text-lead">
            Een onverwachte rekening. Een maand waarin het net niet rondkomt. Wie dan een betaling mist, stelt contact
            vaak uit. Uit schaamte, of omdat regelen moeite kost.
          </p>
          <p className="text-lead">
            Ondertussen loopt de achterstand op en komen er kosten bij. Hoe later het eerste contact, hoe moeilijker het
            wordt om er samen uit te komen.
          </p>
        </Beeldsectie>

        {/* BLOK 2: WAT WE ZAGEN */}
        <Beeldsectie kleur="bg-grijs-soft">
          <h2 className="text-h2 text-ink">De regeling bestaat al. De klant komt er alleen niet altijd</h2>
          <p className="text-lead">
            We keken in oktober 2026 bij vijftien grote schuldeisers hoe je een betalingsregeling aanvraagt. Bijna
            allemaal doen ze dat via een eigen online omgeving of de telefoon. Vaak met voorwaarden, zoals een minimaal
            bedrag per maand of een automatische incasso.
          </p>
          <p className="text-lead">
            Voor veel klanten werkt dat goed. Wij denken dat juist de klanten die het moeilijk hebben, die stap niet
            zetten. Dat willen we samen met jou testen.
          </p>
        </Beeldsectie>

        {/* BLOK 3: WAT BETAALPAUZE DOET */}
        <Beeldsectie kleur="bg-groen-soft" beeldKant="links">
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
        </Beeldsectie>

        {/* BLOK 4: WAT HET OPLEVERT */}
        <Beeldsectie kleur="bg-mint-soft">
          <h2 className="text-h2 text-ink">Wat je eraan hebt</h2>
          <Lijst
            items={[
              "Klanten die zich zelf melden, met een concreet voorstel.",
              "Voorstellen in een vaste vorm, met alle gegevens die je nodig hebt.",
              "Klanten die vaker op tijd betalen, omdat we ze helpen het plan vol te houden.",
              "Cijfers over hoe vaak klanten een voorstel doen en of ze het volhouden. Bruikbaar voor je rapportage over sociaal incasseren.",
            ]}
          />
        </Beeldsectie>

        {/* BLOK 5: HOE EEN PILOT WERKT */}
        <Beeldsectie kleur="bg-geel-soft" beeldKant="links">
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
                <span className="font-medium">Testen.</span> Drie maanden. Je krijgt elke maand de cijfers.
              </>,
              <>
                <span className="font-medium">Samen evalueren</span>, en beslissen of en hoe we verder gaan.
              </>,
            ].map((stap, i) => (
              <li key={i} className="flex gap-4 text-lead">
                <span
                  aria-hidden
                  className="tabular flex size-9 shrink-0 items-center justify-center rounded-full bg-mint font-sans text-base font-medium text-ink"
                >
                  {i + 1}
                </span>
                <span className="pt-1">{stap}</span>
              </li>
            ))}
          </ol>
          <p className="text-base text-muted-foreground">
            Tijdens de pilot betaal je niets. Daarna spreken we samen een prijs per opgeloste zaak af.
          </p>
        </Beeldsectie>

        {/* OVER MIJ */}
        <section className="pb-4">
          <div className="mx-auto max-w-page px-5 md:px-8 lg:px-12">
            <p className="max-w-prose border-t border-line pt-8 text-base text-muted-foreground">
              Ik ben Demmy Onink, product- en gedragsontwerper. Ik werk al ruim twintig jaar aan digitale producten,
              vooral voor financiële dienstverleners. Betaalpauze bouw ik omdat ik zie dat goede regelingen vaak niet
              aankomen bij de mensen die ze nodig hebben.
            </p>
          </div>
        </section>

        {/* FORMULIER: over de volle breedte. Op desktop de uitleg links en de velden rechts. */}
        <section id="pilot" className="scroll-mt-4 py-12 lg:py-16">
          <div className="mx-auto max-w-page px-5 md:px-8 lg:px-12">
            <div className="grid gap-8 rounded-lg bg-surface p-6 md:p-10 lg:grid-cols-2 lg:gap-16 lg:p-12">
              <div className="flex flex-col gap-2">
                <h2 className="text-h2 text-ink">Een pilot bespreken</h2>
                <p className="text-lead">Laat je gegevens achter. Ik neem binnen twee werkdagen contact met je op.</p>
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
