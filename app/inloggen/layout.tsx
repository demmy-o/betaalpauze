import { TestBalk } from "../components/TestBalk"

// Elke pagina hier hoort bij de bètaversie en krijgt bovenaan de testbalk.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TestBalk />
      {children}
    </>
  )
}
