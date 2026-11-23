# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Building & Testing

To build or test the static SPA application, execute inside the frontend container:

```bash
# Build static SPA application
docker compose exec frontend pnpm spa:build

# Run SPA unit & domain tests
docker compose exec frontend pnpm spa:test

# Run full checks (i18n check, typecheck, lint, format, and tests)
docker compose exec frontend pnpm spa:dev-check
```
