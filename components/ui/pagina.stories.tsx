import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Pagina } from "./pagina"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "Basis/Pagina",
  component: Pagina,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "De basis van elke pagina. Regelt de warme achtergrond, de marges per formaat (20, 32 en 48px) en de breedte: " +
          "een container van maximaal 1200px met de inhoud in een gecentreerde kolom. " +
          "Kies `stap` (880px) voor een stap in de aanvraag: die krijgt ook extra lucht bovenaan. " +
          "Kies `breed` (880px) voor overzichten en bevestigingen, zoals Mijn plan. " +
          "Kies de kolom met `kolom`: `stap` (880px), `formulier` (480px, standaard), `tekst` (680px) of `vol` (1200px). " +
          "Kijk met de werkbalk hoe het op mobiel, tablet en desktop staat. Zie ook Fundamenten/Breakpoints.",
      },
    },
  },
  args: { kolom: "formulier", className: "min-h-0" },
  argTypes: { kolom: { control: "inline-radio", options: ["stap", "breed", "formulier", "tekst", "vol"] } },
  render: (args) => (
    <Pagina {...args}>
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">Bij welk bedrijf moet je betalen?</h1>
        <p className="text-lead">Zoek het bedrijf dat de factuur stuurde.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bedrijf">Naam van het bedrijf</Label>
        <Input id="bedrijf" />
      </div>
      <Button variant="primair" size="groot" className="w-full md:w-auto md:self-start">
        Verder naar de factuur
      </Button>
    </Pagina>
  ),
} satisfies Meta<typeof Pagina>

export default meta
type Story = StoryObj<typeof meta>

export const Formulier: Story = {}
export const Tekst: Story = { args: { kolom: "tekst" } }
export const Breed: Story = { args: { kolom: "breed" } }
export const Mobiel: Story = { globals: { viewport: { value: "mobiel", isRotated: false } } }
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } }
