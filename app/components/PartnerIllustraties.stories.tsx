import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  GemisteBetalingIllustration,
  PilotStappenIllustration,
  RegelingBestaatAlIllustration,
  VoorstelBriefIllustration,
  WatJeEraanHebtIllustration,
} from "./PartnerIllustraties"

// Elke illustratie in een kleurvlak op dezelfde maat als in een Beeldsectie.
function Vlak({ kleur, children }: { kleur: string; children: React.ReactNode }) {
  return (
    <div className={`flex aspect-[480/463] w-full max-w-[480px] items-center justify-center overflow-hidden rounded-xl ${kleur}`}>
      {children}
    </div>
  )
}

const meta = {
  title: "Illustratie/PartnerIllustraties",
  component: GemisteBetalingIllustration,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "De illustraties bij de blokken op /partners, in dezelfde stijl als de toggle op pauze. " +
          "Ze zijn getekend voor in het kleurvlak van een Beeldsectie (geef ze mee als beeld). Gebruik ze niet los op de achtergrond.",
      },
    },
  },
} satisfies Meta<typeof GemisteBetalingIllustration>

export default meta
type Story = StoryObj<typeof meta>

export const GemisteBetaling: Story = {
  render: () => <Vlak kleur="bg-geel-soft"><GemisteBetalingIllustration /></Vlak>,
}

export const RegelingBestaatAl: Story = {
  render: () => <Vlak kleur="bg-grijs-soft"><RegelingBestaatAlIllustration /></Vlak>,
}

export const VoorstelBrief: Story = {
  render: () => <Vlak kleur="bg-groen-soft"><VoorstelBriefIllustration /></Vlak>,
}

export const WatJeEraanHebt: Story = {
  render: () => <Vlak kleur="bg-mint-soft"><WatJeEraanHebtIllustration /></Vlak>,
}

export const PilotStappen: Story = {
  render: () => <Vlak kleur="bg-geel-soft"><PilotStappenIllustration /></Vlak>,
}
