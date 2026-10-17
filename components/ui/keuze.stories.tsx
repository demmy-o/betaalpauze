import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Keuzerondje, Vinkje, Keuzekaart, Keuzeknop, Keuzetegel } from "./keuze"
import { TekeningBeide, TekeningPauze, TekeningTermijnen } from "@/app/aanvragen/[zaakId]/voorstel/tekeningen"

// Eén pagina voor alle keuze-elementen, zodat je ze naast elkaar ziet.
const meta = {
  title: "Basis/Keuzes",
  component: Keuzekaart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Vijf manieren om iets te kiezen. Allemaal echte invoerelementen, dus met toetsenbord en schermlezer te gebruiken. " +
          "Zet keuzes altijd in een `<fieldset>` met een `<legend>` die de vraag stelt.\n\n" +
          "- **Keuzetegel**: 2 tot 4 opties die je met een tekening kunt laten zien. Op tablet en desktop naast elkaar.\n" +
          "- **Keuzekaart**: een keuze die uitleg nodig heeft. Eén kaart per optie, onder elkaar.\n" +
          "- **Keuzeknop**: 2 tot 4 korte opties naast elkaar, zoals een aantal maanden.\n" +
          "- **Keuzerondje**: een eenvoudige lijst met korte opties.\n" +
          "- **Vinkje**: ja of nee, of iets aanzetten. Nooit voor één keuze uit meer opties.",
      },
    },
  },
  args: { name: "soort-los", titel: "Alleen een pauze", uitleg: "Je betaalt een paar maanden niets. Daarna betaal je het hele bedrag." },
} satisfies Meta<typeof Keuzekaart>

export default meta
type Story = StoryObj<typeof meta>

// Elke story krijgt een eigen groepsnaam, anders beïnvloeden ze elkaar op de docs-pagina.
function KaartenVoorbeeld({ groep }: { groep: string }) {
  return (
    <fieldset className="flex max-w-form flex-col gap-3">
      <legend className="mb-2 font-sans text-sm font-medium text-ink">Wat wil je voorstellen?</legend>
      <Keuzekaart name={groep} value="pauze" defaultChecked titel="Alleen een pauze" uitleg="Je betaalt een paar maanden niets. Daarna betaal je het hele bedrag." />
      <Keuzekaart name={groep} value="termijnen" titel="Betalen in termijnen" uitleg="Je betaalt elke maand een deel, tot alles betaald is." />
      <Keuzekaart name={groep} value="beide" titel="Eerst een pauze, dan termijnen" uitleg="Eerst een paar maanden niets, daarna elke maand een deel." />
    </fieldset>
  )
}

export const Keuzekaarten: Story = { render: () => <KaartenVoorbeeld groep="soort" /> }

export const KeuzekaartUitgeschakeld: Story = { args: { disabled: true } }

export const Keuzeknoppen: Story = {
  render: () => (
    <fieldset className="flex max-w-form flex-col gap-3">
      <legend className="mb-2 font-sans text-sm font-medium text-ink">Hoe lang wil je pauzeren?</legend>
      <div className="flex gap-2">
        <Keuzeknop name="pauze" value="1">1 maand</Keuzeknop>
        <Keuzeknop name="pauze" value="2" defaultChecked>2 maanden</Keuzeknop>
        <Keuzeknop name="pauze" value="3">3 maanden</Keuzeknop>
      </div>
    </fieldset>
  ),
}

export const Keuzerondjes: Story = {
  render: () => (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-2 font-sans text-sm font-medium text-ink">Hoe wil je de brief versturen?</legend>
      <Keuzerondje name="route" value="email" defaultChecked>Per e-mail</Keuzerondje>
      <Keuzerondje name="route" value="post">Per post</Keuzerondje>
    </fieldset>
  ),
}

export const Vinkjes: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Vinkje name="kopie" defaultChecked>Stuur mij een kopie van de brief</Vinkje>
      <Vinkje name="akkoord">Ik heb de gegevens gecontroleerd</Vinkje>
      <Vinkje name="uit" disabled>Uitgeschakeld</Vinkje>
    </div>
  ),
}

export const OpPastelvlak: Story = {
  render: () => <KaartenVoorbeeld groep="soort-pastel" />,
  globals: { backgrounds: { value: "mint" } },
  parameters: { docs: { description: { story: "Keuzes staan op wit. Op een pastelsectie blijft de kaart zelf wit." } } },
}

function TegelsVoorbeeld({ groep }: { groep: string }) {
  return (
    <fieldset className="grid max-w-kop gap-3 md:grid-cols-3">
      <legend className="sr-only">Wat wil je voorstellen?</legend>
      <Keuzetegel name={groep} value="pauze" defaultChecked titel="Een pauze" uitleg="Je betaalt even niets, en daarna alles in één keer." tekening={<TekeningPauze />} />
      <Keuzetegel name={groep} value="termijnen" titel="Termijnen" uitleg="Je betaalt elke maand een deel." tekening={<TekeningTermijnen />} />
      <Keuzetegel name={groep} value="beide" titel="Eerst een pauze, dan termijnen" uitleg="Je betaalt eerst even niets, en daarna elke maand een deel." tekening={<TekeningBeide />} />
    </fieldset>
  )
}

export const Keuzetegels: Story = { render: () => <TegelsVoorbeeld groep="tegel" /> }

export const KeuzetegelsMobiel: Story = {
  render: () => <TegelsVoorbeeld groep="tegel-mobiel" />,
  globals: { viewport: { value: "mobiel", isRotated: false } },
}
