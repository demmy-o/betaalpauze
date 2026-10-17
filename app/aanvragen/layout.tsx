import { Suspense } from "react"
import { TestBalk } from "../components/TestBalk"
import { Kopbalk } from "@/components/ui/kopbalk"
import { createClient } from "@/lib/supabase/server"
import { FlowKop } from "./FlowKop"

// Elke pagina hier hoort bij de bètaversie en krijgt bovenaan de testbalk.
// Daaronder de kopbalk met de voortgang van de aanvraag, en rechts "Inloggen" of "Mijn plan".
export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <TestBalk />
      <Suspense fallback={<Kopbalk gezicht voortgang={0} />}>
        <FlowKop ingelogd={Boolean(user)} />
      </Suspense>
      {children}
    </>
  )
}
