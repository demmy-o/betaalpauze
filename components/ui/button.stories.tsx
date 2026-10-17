import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ArrowRightIcon, ChevronLeftIcon, DownloadIcon } from "lucide-react"
import { Button, buttonVariants } from "./button"

const meta = {
  title: "Basis/Knop",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Pauze aanvragen", variant: "primair", size: "groot" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primair", "secundair", "tertiair"] },
    size: { control: "inline-radio", options: ["groot", "middel", "klein"] },
    alleenIcoon: { control: "boolean" },
    icoonLinks: { control: false },
    icoonRechts: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "De knop. Drie niveaus en drie maten, zoals in de meeste design systems.\n\n" +
          "**Niveau**\n" +
          "- **Primair**: gevuld in ink. De hoofdactie. Maximaal één per scherm. Geen hoverkleur: lichter worden leest als uitgeschakeld.\n" +
          "- **Secundair**: rand in ink. Een tweede keuze naast de hoofdactie.\n" +
          "- **Tertiair**: alleen tekst, onderstreept. Een kleine actie, zoals \"Ander adres gebruiken\".\n\n" +
          "**Maat**\n" +
          "- **Groot** (48px): de hoofdactie van een stap of pagina.\n" +
          "- **Middel** (44px, standaard): knoppen in een kaart of in het menu.\n" +
          "- **Klein** (36px): kleine acties. Het klikvlak is toch 44px.\n\n" +
          "**Iconen**: `icoonLinks` of `icoonRechts`, bijvoorbeeld een pijl. Met `alleenIcoon` is de knop rond; geef dan " +
          "altijd een `aria-label` mee.\n\n" +
          "Knoplabels benoemen de uitkomst: \"Pauze aanvragen\", niet \"Versturen\". Op mobiel is de hoofdactie volle breedte. " +
          "Moet een link eruitzien als knop? Gebruik `buttonVariants`: `<Link className={buttonVariants({ variant: \"primair\", size: \"groot\" })}>`.",
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primair: Story = {}
export const Secundair: Story = { args: { variant: "secundair", children: "Ik heb geen factuur" } }
export const Tertiair: Story = { args: { variant: "tertiair", size: "klein", children: "Ander adres gebruiken" } }

// Alle niveaus in alle maten naast elkaar.
export const Overzicht: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["primair", "secundair", "tertiair"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          <span className="w-24 text-sm text-muted-foreground">{variant}</span>
          <Button variant={variant} size="groot">Groot</Button>
          <Button variant={variant} size="middel">Middel</Button>
          <Button variant={variant} size="klein">Klein</Button>
        </div>
      ))}
    </div>
  ),
}

export const MetIcoon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="secundair" size="groot" icoonLinks={<ChevronLeftIcon aria-hidden />}>Terug</Button>
      <Button variant="primair" size="groot" icoonRechts={<ArrowRightIcon aria-hidden />}>Verder</Button>
      <Button variant="tertiair" size="klein" icoonLinks={<DownloadIcon aria-hidden />}>Download als PDF</Button>
    </div>
  ),
}

export const AlleenIcoon: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="secundair" size="groot" alleenIcoon aria-label="Terug"><ChevronLeftIcon aria-hidden /></Button>
      <Button variant="secundair" size="middel" alleenIcoon aria-label="Terug"><ChevronLeftIcon aria-hidden /></Button>
      <Button variant="secundair" size="klein" alleenIcoon aria-label="Terug"><ChevronLeftIcon aria-hidden /></Button>
    </div>
  ),
  parameters: { docs: { description: { story: "Rond, met alleen een icoon. Zoals de terugknop naast \"Verder\". Altijd met `aria-label`." } } },
}

export const TerugEnVerder: Story = {
  render: () => (
    <div className="flex max-w-form gap-3">
      <Button variant="secundair" size="groot" alleenIcoon aria-label="Terug"><ChevronLeftIcon aria-hidden /></Button>
      <Button variant="primair" size="groot" className="flex-1">Verder naar de factuur</Button>
    </div>
  ),
  parameters: { docs: { description: { story: "Onderaan een stap: terug zo klein mogelijk, de hoofdactie vult de rest. In de app regelt StapKnoppen dit vanzelf." } } },
}

export const VolleBreedteOpMobiel: Story = {
  args: { className: "w-full md:w-auto" },
  globals: { viewport: { value: "mobiel", isRotated: false } },
}

export const Uitgeschakeld: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primair" size="groot" disabled>Even geduld</Button>
      <Button variant="secundair" size="groot" disabled>Even geduld</Button>
      <Button variant="tertiair" size="groot" disabled>Even geduld</Button>
    </div>
  ),
}

export const OpMint: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primair" size="groot">Pauze aanvragen</Button>
      <Button variant="secundair" size="groot">Meer weten</Button>
      <Button variant="tertiair" size="groot">Overslaan</Button>
    </div>
  ),
  globals: { backgrounds: { value: "mint" } },
}

export const LinkAlsKnop: Story = {
  render: () => (
    <a href="#" className={buttonVariants({ variant: "primair", size: "groot" })}>
      Voorstel maken
    </a>
  ),
  parameters: { docs: { description: { story: "Een link naar een andere pagina, in de vorm van een knop." } } },
}
