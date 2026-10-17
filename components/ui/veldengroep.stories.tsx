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
          "Een rustig vlak om een groep invulvelden, zodat je ziet dat ze bij elkaar horen. De kleur is `canvas-donker`, " +
          "iets donkerder dan de achtergrond. De velden zelf blijven wit. Gebruik het op elk scherm waar je iets invult. " +
          "In de smalle kolom van 480px is het vlak op tablet en desktop 680px breed, net als een Kaart. De velden blijven " +
          "480px en staan in het midden, met ruim lucht eromheen. Knoppen staan eronder, buiten het vlak.",
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
