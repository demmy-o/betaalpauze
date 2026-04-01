'use client'

import { createContext, useContext, type ReactNode } from "react"
import { defaultCopy } from "../lib/defaultCopy"

type CopyContextType = {
  copy: Record<string, string>
  t: (key: string) => string
}

const CopyContext = createContext<CopyContextType>({
  copy: defaultCopy,
  t: (key: string) => defaultCopy[key] ?? key,
})

export function CopyProvider({
  children,
  copy,
}: {
  children: ReactNode
  copy: Record<string, string>
}) {
  const t = (key: string) => copy[key] ?? defaultCopy[key] ?? key

  return (
    <CopyContext.Provider value={{ copy, t }}>
      {children}
    </CopyContext.Provider>
  )
}

export function useCopy(key: string): string {
  const { t } = useContext(CopyContext)
  return t(key)
}

export function useT() {
  const { t } = useContext(CopyContext)
  return t
}

export { CopyContext }
