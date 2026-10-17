import type { StorybookConfig } from "@storybook/nextjs-vite"

// Storybook voor het Betaalpauze design system.
// Stories staan naast het component (*.stories.tsx). Uitleg en tokens staan in stories/*.mdx.
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: [
    "../stories/**/*.mdx",
    "../components/**/*.stories.@(ts|tsx)",
    "../app/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-mcp"],
  // Het logo en andere bestanden uit public/ zijn beschikbaar zoals in de app.
  staticDirs: ["../public"],
  // Zonder dit krijgt Claude via MCP geen lijst met componenten.
  features: { componentsManifest: true },
}

export default config
