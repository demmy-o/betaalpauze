import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Alleen onze eigen tests. node_modules heet hier node_modules.nosync (zodat iCloud
// het overslaat), en dat herkent Vitest niet vanzelf.
// "server-only" wijst naar een leeg bestand, zodat we servercode (zoals lib/verstuur.ts) kunnen testen.
export default defineConfig({
  resolve: {
    alias: { "server-only": fileURLToPath(new URL("./scripts/hulp/server-only.ts", import.meta.url)) },
  },
  // JSX vertalen (Next laat dat in tsconfig aan zichzelf over). Nodig voor de PDF-test (lib/briefPdf.tsx).
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
})
