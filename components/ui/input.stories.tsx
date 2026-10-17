import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "Basis/Invoerveld",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Het invoerveld in Betaalpauze-stijl: 48px hoog, 12px hoeken, `line-strong` rand en een focusring in ink. " +
          "Zet er altijd een **Label** boven. Geen hulptekst onder het label: geef met `voorbeeld` een hinttekst, " +
          "die in het veld staat als \"Bijvoorbeeld: …\". Nooit de hinttekst als vervanging van het label. " +
          "Vul bij bedragen, IBAN en e-mail altijd `inputMode` en `autoComplete` in. " +
          "Bij een fout: `aria-invalid` plus een foutmelding onder het veld, gekoppeld met `aria-describedby`.",
      },
    },
  },
  args: { voorbeeld: "NL91 ABNA 0417 1643 00" },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const Ingevuld: Story = { args: { defaultValue: "NL91 ABNA 0417 1643 00" } }
export const Uitgeschakeld: Story = { args: { disabled: true } }
export const Fout: Story = { args: { "aria-invalid": true, defaultValue: "NL91 ABNA" } }

export const Bedrag: Story = {
  args: { voorbeeld: "248,00", inputMode: "decimal", autoComplete: "off", className: "tabular" },
}

// Zo hoort een veld in een formulier: label, veld, foutmelding.
export const MetLabelEnFout: Story = {
  render: () => (
    <div className="flex max-w-form flex-col gap-2">
      <Label htmlFor="iban">IBAN</Label>
      <Input id="iban" aria-invalid aria-describedby="iban-fout" defaultValue="NL91 ABNA 0417" />
      <p id="iban-fout" className="text-sm text-error">Dit IBAN heeft 14 tekens. Controleer of je er één mist.</p>
    </div>
  ),
}
