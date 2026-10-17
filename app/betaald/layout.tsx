import { TestBalk } from "../components/TestBalk"
import { Kopbalk } from "@/components/ui/kopbalk"

// Elke pagina hier hoort bij de bètaversie en krijgt bovenaan de testbalk en de kopbalk.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TestBalk />
      <Kopbalk />
      {children}
    </>
  )
}
