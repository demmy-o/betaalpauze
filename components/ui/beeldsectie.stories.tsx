import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Beeldsectie } from "./beeldsectie"

const meta = {
  title: "Basis/Beeldsectie",
  component: Beeldsectie,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "canvas" },
    docs: {
      description: {
        component:
          "Een blok op een marketingpagina, zoals /partners. De tekst staat op de neutrale achtergrond, met ernaast een " +
          "afgerond kleurvlak waar een illustratie in kan (`beeld`). Op desktop staan tekst en vlak naast elkaar; wissel " +
          "per blok van kant met `beeldKant`, en geef naast elkaar liggende blokken een andere `kleur` uit het palet. " +
          "Op tablet en mobiel staat het vlak boven de tekst. Het vlak is net zo groot als op de homepage: maximaal 480px breed, verhouding 480:463.",
      },
    },
  },
  args: { kleur: "bg-mint", children: null },
  argTypes: {
    kleur: {
      control: "select",
      options: ["bg-mint", "bg-mint-soft", "bg-geel-soft", "bg-grijs-soft", "bg-groen-soft"],
    },
    beeldKant: { control: "inline-radio", options: ["rechts", "links"] },
  },
  render: (args) => (
    <div className="bg-canvas">
      <Beeldsectie {...args}>
        <h2 className="text-h2">Een gemiste betaling begint meestal klein</h2>
        <p className="text-lead">
          Een onverwachte rekening. Een maand waarin het net niet rondkomt. Wie dan een betaling mist, stelt contact
          vaak uit.
        </p>
      </Beeldsectie>
    </div>
  ),
} satisfies Meta<typeof Beeldsectie>

export default meta
type Story = StoryObj<typeof meta>

export const BeeldRechts: Story = {}
export const BeeldLinks: Story = { args: { kleur: "bg-geel-soft", beeldKant: "links" } }
export const MetIllustratie: Story = {
  args: {
    kleur: "bg-grijs-soft",
    beeld: <span className="font-sans text-sm text-ink-soft">Hier komt de illustratie</span>,
  },
}
export const Mobiel: Story = { globals: { viewport: { value: "mobiel", isRotated: false } } }
