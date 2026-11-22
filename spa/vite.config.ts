import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import tanstackRouter from "@tanstack/router-plugin/vite"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const rawTarget =
    env.VITE_BACKEND_URL || env.BACKEND_URL || "https://localhost"
  const target = rawTarget.replace(/\/core-api\/?$/, "").replace(/\/$/, "")

  return {
    base: "/spa/",
    server: {
      proxy: {
        "/core-api": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
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
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "./src"),
      },
    },
  }
})
