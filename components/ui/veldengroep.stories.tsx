import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Veldengroep } from "./veldengroep"
import { Input } from "./input"
import { Label } from "./label"
import { Button } from "./button"

const meta = {
  title: "Basis/Veldengroep",
  component: Veldengroep,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "De invulvelden van een stap, onder elkaar met 32px lucht ertussen. Geen vlak eromheen: de grijze velden zelf " +
          "laten zien wat je moet invullen. Gebruik het op elk scherm waar je iets invult. Zet label, veld en foutmelding " +
          "samen in één blok (zoals `Veld` doet). Bij het openen komen de blokken één voor één binnen: elk schuift 24px " +
          "omhoog en wordt zichtbaar in 0,4 seconde, 0,2 seconde na het vorige. Met de instelling 'minder beweging' " +
          "staan ze er meteen. Knoppen staan eronder.",
      },
    },
  },
  args: { children: null },
  render: () => (
    <div className="bg-canvas px-5 py-12 md:px-8">
      <div data-kolom="smal" className="group/kolom mx-auto flex max-w-form flex-col gap-8">
        <Veldengroep>
          {[
            ["factuurnummer", "Factuurnummer", "2026-00451"],
            ["bedrag", "Bedrag in euro", "248,50"],
            ["klantnummer", "Klantnummer", "1234567"],
          ].map(([id, label, voorbeeld]) => (
            <div key={id} className="flex flex-col gap-2">
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} voorbeeld={voorbeeld} />
            </div>
          ))}
        </Veldengroep>
        <Button variant="primair" size="groot" className="w-full">
          Verder naar je gegevens
        </Button>
      </div>
    </div>
  ),
} satisfies Meta<typeof Veldengroep>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const Mobiel: Story = { globals: { viewport: { value: "mobiel", isRotated: false } } }
