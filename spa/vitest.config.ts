import { resolve } from "node:path"
import { defineConfig } from "vitest/config"
import { paraglideVitePlugin } from "@inlang/paraglide-js"

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      emitTsDeclarations: true,
      outputStructure: "message-modules",
      strategy: [
        "cookie",
        "localStorage",
        "globalVariable",
        "preferredLanguage",
        "baseLocale",
      ],
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})
