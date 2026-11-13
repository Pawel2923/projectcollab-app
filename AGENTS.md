# Project Context & Agent Instructions

You are an expert AI development agent assisting on a full-stack web application. Your task is to write clean, production-ready, strongly-typed code that matches the existing architectural patterns, tech stack, and conventions of this repository.

---

## 1. Project Overview & Architecture

This repository is a containerized full-stack application leveraging Docker Compose for both development and production. Currently a migration from Next.js to SPA using React, Vite, and TanStack Router is underway. The backend is built with Symfony and API Platform.

### Monorepo Structure

* `/api`: Backend API powered by **Symfony** and **API Platform**.
* `/frontend`: Frontend application built with **Next.js 16 (App Router)**.
* `/spa`: Static Single Page Application (SPA) built with **React**, **Vite** and uses **TanStack Router**.
* `compose.yaml`, `compose.override.yaml`, `compose.prod.yaml`: Docker orchestration configurations.

### Data Flow & Proxying between Next.js and Symfony API (the old frontend)

* **Client-First Validation:** Forms validate input data on the client first (using `react-hook-form` and Zod) to provide immediate feedback and avoid unnecessary network requests.
* **Selective Server Action Usage:** Not all form changes or user interactions need to call the backend. Local UI state and client-only actions should be handled directly on the client.
* **Server Actions as Intermediate Proxy:** When communication with the backend is required (e.g., data mutations, secure API Platform calls), Next.js Server Actions act as a secure proxy:
  * **Client Component** ➔ Validates input locally via `react-hook-form`, then invokes the Server Action (or passes validated data).
  * **Server Action** ➔ Performs server-side validation, handles session/token management via `getOrRefreshAccessToken()`, communicates with the `/api` service via backend network, and returns a structured `ActionResult`.

---

## 2. Frontend Tech Stack

1. `/frontend`
    * **Framework:** Next.js 16+ (App Router, React 19).
    * **Styling:** Tailwind CSS.
    * **UI Components:** `shadcn/ui` for layout/card/button structures.
    * **Forms & Validation:** `react-hook-form`, `@hookform/resolvers`, Zod.

2. `/spa`
    * **Framework:** React 19 with Vite.
    * **Routing:** TanStack Router.
    * **Querying & State Management:** TanStack Query, React Context.
    * **Styling:** Tailwind CSS.
    * **UI Components:** shadcn/ui based on Base UI.
    * **Forms & Validation:** `react-hook-form`, `@hookform/resolvers`, Zod.
    * **Testing:** Vitest and Playwright.

---

## 3. Mandatory Frontend Rules & Design Patterns

When generating code for the frontend, you **must** adhere to the following architectural patterns:

### Form Management & Validation

1. **Client Validation:** Always validate form inputs on the client side first using Zod schemas paired with `react-hook-form` (via `@hookform/resolvers/zod`). This provides immediate feedback to users without unnecessary server roundtrips.
2. **Selective Server Action Usage (for `/frontend` only):** Not all forms or state changes need to fetch the backend. Use Server Actions only when mutating data or interacting with the Symfony backend API. Client-side state changes and interactions that do not require backend communication should remain purely on the client.
3. **Server Action Integration (for `/frontend` only):** When a form interacts with the backend, invoke the Server Action after client validation passes. The action can receive either `FormData` or a structured object.
4. **UI Feedback & Loading States:** Honor loading/pending states during submission (`isSubmitting` from `react-hook-form` or `isPending` from `useActionState` / transitions). Disable input fields and show loading indicators on buttons during submission.
5. **Error Rendering:** Display validation error messages dynamically under the respective fields from client form state. Display server-side errors returned by the `ActionResult` payload gracefully when backend calls fail.

### Server Action Architecture (for `/frontend` only)

Every Server Action must follow the standardized structure found in existing actions (e.g., `actions/issue/updateComment.ts`):

* **Signature:** Must accept `(_prevState: unknown, formData: FormData | { ... })` and return `Promise<ActionResult<T>>`.
* **Validation:** Use Zod schemas. On validation failure, strictly return:

    ```typescript
    { ok: false, code: "VALIDATION_ERROR", status: 400, errors: z.treeifyError(validated.error) }
    ```

* **API Configuration & Auth:**
  * Retrieve the base URL using `getApiUrl()`.
  * Fetch/refresh the authorization bearer token using `getOrRefreshAccessToken(nextApiUrl)`.
* **Error Handling:** Catch network or unexpected exceptions using the global handler: `handleApiError(error, "Context/Action Name Description")`.
* **Return Type:** Consistently return an `ActionResult` typed structure (e.g., `{ ok: true, content: data }` or the handled API error payload).

### Content Types for API Platform

* When executing `PATCH` requests to the Symfony/API Platform backend, always use the headers for JSON Merge Patch:

    ```http
    Content-Type: application/merge-patch+json
    ```

* API Platform backend returns JSON+LD format. Ensure proper parsing and handling of this format.

---

## 4. Code Generation Instructions for the Agent

* **Type Safety:** Always write strict, strongly-typed TypeScript. Avoid `any`.
* **Hidden Form Fields / Identifiers:** When an ID or entity-scoped parameter is required (e.g., `organizationId`), include it in the form registration or submission payload.
* **Component Composition:** Prioritize composition using `shadcn/ui` layout elements (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) for standard interactive modules.
* **Locality:** Place corresponding types, Zod schemas, and components according to existing Next.js App Router structural boundaries.

---
