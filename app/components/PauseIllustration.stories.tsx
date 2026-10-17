import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PauseIllustration } from "./PauseIllustration"

const meta = {
  title: "Illustratie/PauseIllustration",
  component: PauseIllustration,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "De toggle op pauze, op de landingspagina. Een SVG, dus hij schaalt mee zonder dat de verhoudingen veranderen. " +
          "Illustraties staan naast de tekst, nooit erachter. Onder 768px verdwijnt een illustratie die naast tekst stond niet, " +
          "hij komt eronder.",
      },
    },
  },
} satisfies Meta<typeof PauseIllustration>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
