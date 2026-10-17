import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Stap, StapKnoppen } from "./onderdelen"

const meta = {
  title: "Formulier/Stap",
  component: Stap,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Eén stap in de aanvraag, naar het voorbeeld van Lemonade: rust en focus. De vraag " +
          "groot en gecentreerd (tot 880px breed), daaronder de antwoorden in een smalle kolom van 480px. " +
          "Eén vraag of beslissing per stap. De voortgang staat in de Kopbalk, niet hier. " +
          "Zet de hoofdactie onderaan in StapKnoppen: die zet er vanzelf een ronde terugknop (pijltje naar links) naast. " +
          "Met `terug={null}` is er geen terugknop. " +
          "Met `breed` zet je iets over de hele breedte tussen de vraag en de kolom, zoals keuzetegels naast elkaar. " +
          "Met `kolom=\"tekst\"` wordt de kolom 680px, voor de brief. Gebruik Stap binnen `<Pagina kolom=\"stap\">`.",
      },
    },
  },
  args: {
    stap: 1,
    titel: "Bij welk bedrijf moet je betalen?",
    uitleg: "Zoek het bedrijf dat de factuur stuurde.",
    children: null,
  },
  render: (args) => (
    <div className="bg-canvas px-5 py-16 md:px-8">
      <div className="mx-auto max-w-kop">
        <Stap {...args}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bedrijf">Naam van het bedrijf</Label>
            <p className="text-sm text-muted-foreground">Typ minstens 3 letters, bijvoorbeeld de naam bovenaan je factuur.</p>
            <Input id="bedrijf" />
          </div>
          <StapKnoppen>
            <Button type="submit" variant="primair" size="groot">
              Verder naar de factuur
            </Button>
          </StapKnoppen>
        </Stap>
      </div>
    </div>
  ),
} satisfies Meta<typeof Stap>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const ZonderTerug: Story = { args: { terug: null } }
export const Mobiel: Story = { globals: { viewport: { value: "mobiel", isRotated: false } } }
