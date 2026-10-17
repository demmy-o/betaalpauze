import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Veld } from "./onderdelen"

function VeldMetState(args: React.ComponentProps<typeof Veld>) {
  const [waarde, setWaarde] = useState(args.waarde)
  return (
    <div className="max-w-form">
      <Veld {...args} waarde={waarde} onWaarde={setWaarde} />
    </div>
  )
}

const meta = {
  title: "Formulier/Veld",
  component: Veld,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Een invoerveld met label, een voorbeeld als hinttekst en foutmelding. Dit is het veld voor alle formulieren. " +
          "Volgorde: label, veld, foutmelding. Geen hulptekst onder het label: geef met `voorbeeld` een voorbeeld, " +
          "dat in het veld staat als \"Bijvoorbeeld: …\". Controleer bij het verlaten van het veld (`onVerlaten`), " +
          "niet tijdens het typen. Optionele velden krijgen \"(optioneel)\", verplicht is de norm. " +
          "Vul bij bedragen en IBAN altijd `inputMode` en `autoComplete` in.",
      },
    },
  },
  args: {
    id: "voorbeeld",
    label: "E-mailadres",
    waarde: "",
    onWaarde: () => {},
    onVerlaten: () => {},
  },
  // Een echt veld om in te typen, ook in de docs.
  render: (args) => <VeldMetState {...args} />,
} satisfies Meta<typeof Veld>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = { args: { type: "email", voorbeeld: "naam@voorbeeld.nl", autoComplete: "email" } }

export const MetVoorbeeld: Story = { args: { id: "bedrijf", label: "Naam van het bedrijf", voorbeeld: "Zilveren Kruis" } }

export const Optioneel: Story = { args: { label: "Telefoonnummer", optioneel: true, type: "tel", autoComplete: "tel" } }

export const MetFout: Story = {
  args: {
    label: "IBAN",
    waarde: "NL91 ABNA 0417 1643",
    fout: "Dit IBAN heeft 18 tekens. Controleer of je er één mist.",
  },
}

export const Uitgeschakeld: Story = { args: { disabled: true, waarde: "demmy@voorbeeld.nl" } }
