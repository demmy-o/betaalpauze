import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "./label"

const meta = {
  title: "Basis/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Het label van een veld. Staat altijd zichtbaar boven het veld. Nooit alleen een placeholder als label. " +
          "Markeer alleen optionele velden, met \"(optioneel)\" erachter. Verplicht is de norm.",
      },
    },
  },
  args: { children: "E-mailadres" },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}

export const Optioneel: Story = {
  render: () => (
    <Label>
      Factuurnummer<span className="font-normal text-muted-foreground">(optioneel)</span>
    </Label>
  ),
}
