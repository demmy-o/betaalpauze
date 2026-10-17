import type { Preview } from "@storybook/nextjs-vite"
import "../app/globals.css"

// Dezelfde regels als de app: Noto Serif voor koppen en tekst, Noto Sans voor de interface.
// De lettertypes staan in preview-head.html (de app gebruikt next/font, dat kan hier niet).
const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Vlakkleuren uit het palet. Kijk zo hoe een component op een sectie staat.
    backgrounds: {
      options: {
        wit: { name: "Wit (surface)", value: "#ffffff" },
        canvas: { name: "Canvas", value: "#f5f4f1" },
        mint: { name: "Mint", value: "#b4dfe3" },
        mintSoft: { name: "Mint zacht", value: "#d7eef0" },
        geelTint: { name: "Geel tint", value: "#f4e3b9" },
        grijsTint: { name: "Grijs tint", value: "#dfe7e7" },
      },
    },
    // Breakpoints uit docs/design.md: sm 640, md 768, lg 1024, xl 1280.
    viewport: {
      options: {
        mobiel: { name: "Mobiel (375)", styles: { width: "375px", height: "800px" }, type: "mobile" },
        tablet: { name: "Tablet (768)", styles: { width: "768px", height: "1024px" }, type: "tablet" },
        desktop: { name: "Desktop (1280)", styles: { width: "1280px", height: "800px" }, type: "desktop" },
      },
    },
    a11y: { test: "todo" },
    docs: { toc: true },
  },
  initialGlobals: { backgrounds: { value: "wit" } },
}

export default preview
