import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next.nosync/**",
    "node_modules.nosync/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Gebouwde Storybook (npm run build-storybook), niet in git.
    "storybook-static/**",
  ]),
]);

export default eslintConfig;
