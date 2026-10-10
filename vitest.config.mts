import { defineConfig } from "vitest/config"

// Alleen onze eigen tests. node_modules heet hier node_modules.nosync (zodat iCloud
// het overslaat), en dat herkent Vitest niet vanzelf.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
})
