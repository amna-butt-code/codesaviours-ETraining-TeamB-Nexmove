
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,

  globalIgnores([
    // Ignore Next.js generated output at any directory depth.
    ".next/**",
    "**/.next/**",

    // Default generated directories.
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
