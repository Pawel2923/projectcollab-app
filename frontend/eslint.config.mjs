import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
  ),
  globalIgnores([
    "next-env.d.ts",
    "node_modules/**",
    ".next/**",
    "out/**",
    "dist/**",
    "build/**",
    ".pnpm-store/**",
    "pnpm-lock.yaml",
    "package-lock.json",
  ]),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: {
        version: "19.1",
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      boundaries,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "import/no-unresolved": "off",
      "import/named": "off",
    },
  },
]);

export default eslintConfig;
