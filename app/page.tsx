import { fetchCopy } from './lib/fetchCopy'
import { CopyProvider } from './context/CopyContext'
import { PaymentPauseForm } from './components/PaymentPauseForm'

export default async function Home() {
  const copy = await fetchCopy()

  return (
    <CopyProvider copy={copy}>
      <main className="min-h-screen bg-neutral-50 py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-lg mx-auto w-full">
          <PaymentPauseForm />
        </div>
      </main>
    </CopyProvider>
  )
}
