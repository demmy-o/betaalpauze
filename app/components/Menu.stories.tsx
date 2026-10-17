import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, userEvent, within } from "storybook/test"
import { Menu } from "./Menu"

const meta = {
  title: "Navigatie/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hoofdmenu voor de marketingpagina's (`/` en `/partners`). Niet in de aanvraagflow. " +
          "Desktop (vanaf 1024px): tekstlinks op een witte balk, eventueel één pill-knop rechts. " +
          "Mobiel: de knop \"Menu\" opent een menu over het hele scherm in mint. Esc sluit het menu en Tab blijft binnen het menu.",
      },
    },
  },
  globals: { viewport: { value: "desktop", isRotated: false } },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = { args: { actief: "klanten" } }
export const DesktopMetKnop: Story = { args: { actief: "schuldeisers", knop: { tekst: "Een pilot bespreken", href: "#pilot" } } }
export const Mobiel: Story = {
  args: { actief: "klanten" },
  globals: { viewport: { value: "mobiel", isRotated: false } },
}

export const MobielGeopend: Story = {
  args: { actief: "klanten", knop: { tekst: "Een pilot bespreken", href: "#pilot" } },
  globals: { viewport: { value: "mobiel", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /menu/i }))
    await expect(await canvas.findByRole("dialog", { name: "Menu" })).toBeVisible()
  },
}
