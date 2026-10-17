import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Kopbalk } from "./kopbalk"
import { buttonVariants } from "./button"

const meta = {
  title: "Basis/Kopbalk",
  component: Kopbalk,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "De rustige balk bovenaan de aanvraagflow. Logo links, zonder link, zodat je niet per ongeluk uit de flow klikt. " +
          "De lijn onderaan is ook de voortgang: met `voortgang` (0 tot 1) vult hij zich groen. Geef dan ook een `label` " +
          "mee voor schermlezers, zoals \"Stap 2 van 6\". Met `gezicht` staat er een rond portret half over de lijn. " +
          "Zolang er geen foto is, is dat een mint cirkel met een D. Geef een pad naar een foto in `public/` om die te tonen. " +
          "Rechts is plek voor één kleine actie, zoals \"Inloggen\" of \"Mijn plan\" (tertiaire knop, klein). " +
          "Op de marketingpagina's gebruik je het Menu, niet de Kopbalk.",
      },
    },
  },
  decorators: [(Story) => <div className="min-h-48 bg-canvas"><Story /></div>],
} satisfies Meta<typeof Kopbalk>

export default meta
type Story = StoryObj<typeof meta>

export const Standaard: Story = {}
export const MetVoortgang: Story = { args: { voortgang: 2 / 6, label: "Stap 2 van 6" } }
export const MetGezicht: Story = { args: { voortgang: 2 / 6, label: "Stap 2 van 6", gezicht: true } }
export const Mobiel: Story = {
  args: { voortgang: 2 / 6, label: "Stap 2 van 6", gezicht: true },
  globals: { viewport: { value: "mobiel", isRotated: false } },
}

export const MetInloggen: Story = {
  args: {
    voortgang: 2 / 6,
    label: "Stap 2 van 6",
    gezicht: true,
    rechts: (
      <a href="#" className={buttonVariants({ variant: "tertiair", size: "klein" })}>
        Inloggen
      </a>
    ),
  },
}
