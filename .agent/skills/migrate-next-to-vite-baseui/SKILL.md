Migrate Next.js components to Vite + React + TanStack Router + TanStack Query SPA, and migrate Radix UI to Base UI. Use when the user asks to migrate frontend code, components, or apps from Next.js to Vite/TanStack and Base UI.

## Instructions
Migrate Next.js to Vite/TanStack/Base UI
This skill helps migrate an existing Next.js application (using Radix UI) to a Vite-based Single Page Application (SPA) using React, TanStack Router, TanStack Query, and Base UI.

## When to Use
Migrating a Next.js app/ or pages/ directory to Vite.
Converting Next.js file routing to TanStack Router file-based routing.
Swapping Next.js server actions/data fetching to TanStack Query or TanStack Router loaders.
Migrating UI components from Radix UI to Base UI (e.g., Shadcn updates).

## Steps
1. Routing Migration (Next.js to TanStack Router)
Move Next.js page components to TanStack Router's routes/ directory.
Convert Next.js layouts (layout.tsx) into TanStack Router __root.tsx or _layout.tsx wrapper routes.
Replace Next.js <Link href="..."> with TanStack Router <Link to="...">.
Replace Next.js useRouter with TanStack Router's useNavigate, useRouter, and useSearch.
2. Data Fetching (Next.js to TanStack Query)
If the component uses Next.js server components/actions, refactor it into client-side data fetching.
Setup a query function for useQuery or useMutation from @tanstack/react-query.
For route-level fetching, use TanStack Router's loader function inside createFileRoute.
3. Component Migration (Radix UI to Base UI)
Change package imports from @radix-ui/react-* to @base-ui/react.
Base UI renders popups via portals automatically, but requires isolate on the app wrapper.
asChild to render prop: Replace Radix's asChild pattern and <Slot> with Base UI's render prop (e.g., render={<MyComponent />}).
Layout and Positioning: Radix handles positioning inline. Base UI separates this into a dedicated <Positioner> wrapper. Ensure popups (like Dialog or Popover content) are wrapped accordingly if required by the new Base UI component structure.
Review and update specific component prop names (like open vs defaultOpen) according to Base UI standards.

## Gotchas
Base UI enforces strict accessibility standards; labels in popups may need a Group wrapper.
Ensure Vite plugin @tanstack/router-plugin/vite is considered when explaining the setup.
Since moving from SSR to SPA, make sure any secret keys used in Next.js Server Components are moved to a secure backend API instead of the client app.
