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

## Building

To build the static SPA application from the project root, run:

```bash
make spa-build
```

Or execute directly inside the frontend container:

```bash
docker compose exec frontend sh -c "cd /workspace/spa && pnpm build"
```
