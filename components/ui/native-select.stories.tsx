import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { NativeSelect } from "./native-select"

const meta = {
  title: "Basis/Keuzelijst",
  component: NativeSelect,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Een keuzelijst met de echte keuzelijst van de browser. Op een telefoon krijg je dan de lijst van het toestel, " +
          "die mensen al kennen. Gebruik dit bij meer dan 4 opties. Bij 2 tot 4 korte opties zijn **Keuzeknoppen** " +
          "sneller, bij opties met uitleg **Keuzekaarten**.",
      },
    },
  },
  args: { "aria-label": "Aantal termijnen", defaultValue: "6" },
  render: (args) => (
    <NativeSelect {...args}>
      {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
        <option key={n} value={n}>
          {n} termijnen
        </option>
      ))}
    </NativeSelect>
  ),
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const Uitgeschakeld: Story = { args: { disabled: true } }
export const Fout: Story = { args: { "aria-invalid": true } }
