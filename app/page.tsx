import Image from "next/image"
import { PauseIllustration } from "./components/PauseIllustration"
import { WaitlistForm } from "./components/WaitlistForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-[1104px] flex-col gap-6">
        <header className="flex h-10 items-center">
          <Image
            src="/logo-betaalpauze.svg"
            alt="betaalpauze.nl"
            width={152}
            height={40}
            priority
          />
        </header>

        <div className="flex flex-col items-center gap-10 py-8 md:flex-row md:items-start md:gap-16 md:py-12">
          <PauseIllustration />

          <div className="flex w-full max-w-[560px] flex-col gap-[15px] md:flex-[1_1_560px]">
            {/* text-box knipt de regelruimte boven de eerste regel weg,
                zodat de letters exact op de bovenkant van het blauwe vlak lijnen */}
            <h1 className="font-serif text-[32px] leading-[1.12] font-medium tracking-[-0.01em] text-ink [text-box:trim-start_cap_alphabetic] md:text-[48px]">
              Even geen ruimte om te betalen. Daar komt rust in.
            </h1>
            <p className="font-serif text-[18px] leading-[1.65] text-ink-soft md:text-[21.8px]">
              Betaalpauze wordt de plek waar je je betalingen tijdelijk stilzet
              en vooraf weet wat dat kost en wanneer het weer begint.
            </p>

            <div className="max-w-[480px] pt-[13px]">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
