import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Textarea } from "./textarea"

const meta = {
  title: "Basis/Tekstvak",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Voor een langer antwoord in eigen woorden, zoals een bericht. Zelfde stijl als het invoerveld. " +
          "Het vak groeit mee met de tekst. Voor één regel gebruik je het invoerveld.",
      },
    },
  },
  args: { voorbeeld: "Ik heb deze maand een onverwachte rekening gehad.", rows: 4 },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const Ingevuld: Story = {
  args: { defaultValue: "Ik heb deze maand een onverwachte rekening gehad. Vanaf december kan ik weer betalen." },
}
export const Uitgeschakeld: Story = { args: { disabled: true } }
export const Fout: Story = { args: { "aria-invalid": true } }
