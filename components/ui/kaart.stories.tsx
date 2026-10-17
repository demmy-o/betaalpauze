import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Kaart } from "./kaart"
import { Button } from "./button"

const meta = {
  title: "Basis/Kaart",
  component: Kaart,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Een witte kaart voor uitleg, een bevestiging of een samenvatting, op de warme achtergrond. Geen schaduw. " +
          "In de smalle kolom van 480px wordt de kaart op tablet en desktop 200px breder (680px), zodat er rust in de tekst komt. " +
          "Op mobiel is hij even breed als de kolom. In een brede kolom (Pagina `breed`) steekt hij niet uit. " +
          "Met `rand` krijgt hij een dunne rand, voor een kaart met een eigen keuze of actie erin.",
      },
    },
  },
  args: { children: null },
  render: (args) => (
    <div className="bg-canvas px-5 py-12 md:px-8">
      <div data-kolom="smal" className="group/kolom mx-auto flex max-w-form flex-col gap-6">
        <p className="text-sm text-muted-foreground">De kolom is 480px. De kaart steekt op tablet en desktop aan beide kanten 100px uit.</p>
        <Kaart {...args}>
          <h2 className="text-h3">Dan is een betaalvoorstel niet de juiste stap</h2>
          <p>
            Met een betaalvoorstel laat je weten dat je de rekening wilt betalen. Klopt de factuur niet, dan is het beter
            om dat eerst met het bedrijf uit te zoeken.
          </p>
        </Kaart>
      </div>
    </div>
  ),
} satisfies Meta<typeof Kaart>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const MetRand: Story = {
  args: { rand: true },
  render: (args) => (
    <div className="bg-canvas px-5 py-12 md:px-8">
      <div data-kolom="smal" className="group/kolom mx-auto flex max-w-form flex-col gap-6">
        <Kaart {...args}>
          <h2 className="text-h3">Wij sturen je brief per post</h2>
          <p>We doen hem binnen 2 werkdagen op de post.</p>
          <Button variant="secundair" size="klein" className="self-start">Ander adres gebruiken</Button>
        </Kaart>
      </div>
    </div>
  ),
}
export const ZonderUitsteken: Story = { args: { breed: false } }
export const Mobiel: Story = { globals: { viewport: { value: "mobiel", isRotated: false } } }

export const InBredeKolom: Story = {
  render: (args) => (
    <div className="bg-canvas px-5 py-12 md:px-8">
      <div className="mx-auto flex max-w-kop flex-col gap-6">
        <p className="text-sm text-muted-foreground">In een brede kolom van 880px, zoals op Mijn plan. De kaart is even breed als de kolom.</p>
        <Kaart {...args}>
          <h2 className="text-h3">Je voorstel is verstuurd</h2>
          <p>Het bedrijf heeft 14 dagen om te reageren.</p>
        </Kaart>
      </div>
    </div>
  ),
}
