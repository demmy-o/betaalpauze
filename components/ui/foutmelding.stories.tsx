import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Foutmelding } from "./foutmelding"
import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "Basis/Foutmelding",
  component: Foutmelding,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "De foutmelding onder een veld of bij een actie. Tekst in ink met een rood icoon, want rood is te licht voor tekst. " +
          "Zeg wat er mis is en wat de gebruiker kan doen. Geef de melding een `id` en koppel hem aan het veld met `aria-describedby`.",
      },
    },
  },
  args: { children: "Dit IBAN heeft 14 tekens. Controleer of je er één mist." },
} satisfies Meta<typeof Foutmelding>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}

export const OnderEenVeld: Story = {
  render: () => (
    <div className="flex max-w-form flex-col gap-2">
      <Label htmlFor="iban">IBAN</Label>
      <Input id="iban" aria-invalid aria-describedby="iban-fout" defaultValue="NL91 ABNA 0417" />
      <Foutmelding id="iban-fout">Dit IBAN heeft 14 tekens. Controleer of je er één mist.</Foutmelding>
    </div>
  ),
}
