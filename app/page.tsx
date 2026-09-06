import { Pause } from "lucide-react"
import { WaitlistForm } from "./components/WaitlistForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfafc] px-5 py-10 md:px-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <span className="text-lg font-semibold text-[#1c1b2e]">
          betaalpauze.nl
        </span>

        <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-2 md:items-center md:gap-16">
          <div className="aspect-square w-full rounded-[32px] bg-[#a9e8bc] flex items-center justify-center">
            <div className="flex h-16 w-28 items-center rounded-full bg-[#fbfafc] px-1.5 md:h-20 md:w-36">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1b2e] md:h-16 md:w-16">
                <Pause className="h-6 w-6 fill-white text-white md:h-8 md:w-8" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#1c1b2e] md:text-5xl">
              Even geen ruimte om te betalen. Daar komt rust in.
            </h1>
            <p className="mt-4 text-base text-[#55536b] md:mt-6 md:text-lg">
              Betaalpauze wordt de plek waar je je betalingen tijdelijk stilzet
              en vooraf weet wat dat kost en wanneer het weer begint.
            </p>

            <div className="mt-8 max-w-md">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
