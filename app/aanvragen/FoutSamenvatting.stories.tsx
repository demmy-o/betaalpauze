import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { FoutSamenvatting } from "./onderdelen"

const meta = {
  title: "Formulier/FoutSamenvatting",
  component: FoutSamenvatting,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Komt bovenaan het formulier als iemand verstuurt en er nog iets niet klopt. Elke melding is een link naar het veld. " +
          "De focus springt naar dit blok (`id=\"fout-samenvatting\"`). Een foutmelding zegt wat er mis is en wat de gebruiker kan doen, " +
          "en legt de schuld nooit bij de gebruiker.",
      },
    },
  },
  decorators: [(Story) => <div className="max-w-form"><Story /></div>],
} satisfies Meta<typeof FoutSamenvatting>

export default meta
type Story = StoryObj<typeof meta>

export const EenFout: Story = { args: { fouten: { bedrag: "Vul het bedrag in zoals op de factuur staat." } } }

export const MeerdereFouten: Story = {
  args: {
    fouten: {
      voornaam: "Vul je voornaam in.",
      email: "Dit e-mailadres klopt niet helemaal. Check of je geen typefout hebt gemaakt.",
      telefoon: "Een telefoonnummer heeft 10 cijfers.",
    },
  },
}

export const GeenFouten: Story = { args: { fouten: {} } }
