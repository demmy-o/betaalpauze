import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        /* --- Primary --- */
        primary: {
          50:  "#EEF4FF",
          100: "#D9E7FF",
          200: "#B3CFFF",
          300: "#7AAAFF",
          400: "#4080F5",
          500: "#2563EB",
          600: "#1A4FCC",
          700: "#153EA3",
          800: "#0F2D78",
          900: "#091C50",
          DEFAULT: "#2563EB",
        },
        /* --- Neutral --- */
        neutral: {
          0:   "#FFFFFF",
          50:  "#F8F9FB",
          100: "#EEF0F4",
          200: "#D8DCE5",
          300: "#B4BBCA",
          400: "#8A93A8",
          500: "#636D84",
          600: "#47506A",
          700: "#333C55",
          800: "#1F2740",
          900: "#111827",
        },
        /* --- Status --- */
        success: {
          100: "#D1FAE5",
          500: "#10B981",
          700: "#065F46",
          DEFAULT: "#10B981",
        },
        warning: {
          100: "#FEF3C7",
          500: "#F59E0B",
          700: "#92400E",
          DEFAULT: "#F59E0B",
        },
        error: {
          100: "#FEE2E2",
          500: "#EF4444",
          700: "#991B1B",
          DEFAULT: "#EF4444",
        },
      },

      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        xs:   ["0.75rem",  { lineHeight: "1.25" }],
        sm:   ["0.875rem", { lineHeight: "1.375" }],
        base: ["1rem",     { lineHeight: "1.5" }],
        lg:   ["1.125rem", { lineHeight: "1.5" }],
        xl:   ["1.25rem",  { lineHeight: "1.375" }],
        "2xl":["1.5rem",   { lineHeight: "1.25" }],
        "3xl":["1.875rem", { lineHeight: "1.25" }],
        "4xl":["2.25rem",  { lineHeight: "1.25" }],
        "5xl":["3rem",     { lineHeight: "1.25" }],
      },

      fontWeight: {
        regular:  "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
      },

      spacing: {
        0:  "0px",
        1:  "4px",
        2:  "8px",
        3:  "12px",
        4:  "16px",
        5:  "20px",
        6:  "24px",
        8:  "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        32: "128px",
      },

      borderRadius: {
        none: "0px",
        sm:   "4px",
        DEFAULT: "8px",
        md:   "12px",
        lg:   "16px",
        xl:   "24px",
        full: "9999px",
      },

      boxShadow: {
        none:  "none",
        xs:    "0 1px 2px 0 rgba(17,24,39,0.05)",
        sm:    "0 1px 3px 0 rgba(17,24,39,0.10), 0 1px 2px -1px rgba(17,24,39,0.06)",
        base:  "0 4px 6px -1px rgba(17,24,39,0.10), 0 2px 4px -2px rgba(17,24,39,0.06)",
        md:    "0 10px 15px -3px rgba(17,24,39,0.10), 0 4px 6px -4px rgba(17,24,39,0.06)",
        lg:    "0 20px 25px -5px rgba(17,24,39,0.10), 0 8px 10px -6px rgba(17,24,39,0.06)",
        focus: "0 0 0 3px rgba(37,99,235,0.30)",
      },

      screens: {
        sm:  "640px",
        md:  "768px",
        lg:  "1024px",
        xl:  "1280px",
        "2xl": "1536px",
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        fast: "100ms",
        base: "150ms",
        slow: "300ms",
      },

      zIndex: {
        base:     "0",
        raised:   "10",
        dropdown: "20",
        sticky:   "30",
        overlay:  "40",
        modal:    "50",
        toast:    "60",
      },
    },
  },
  plugins: [],
};

export default config;
