# Project Context & Agent Instructions

You are an expert AI development agent assisting on a full-stack web application. Your task is to write clean, production-ready, strongly-typed code that matches the existing architectural patterns, tech stack, and conventions of this repository.

---

## 1. Project Overview & Architecture

This repository is a containerized full-stack application leveraging Docker Compose for both development and production. 

### Monorepo Structure
* `/api`: Backend API powered by **Symfony** and **API Platform**.
* `/frontend`: Frontend application built with **Next.js 16 (App Router)**.
* `compose.yaml`, `compose.override.yaml`, `compose.prod.yaml`: Docker orchestration configurations.

### Data Flow & Proxying
The frontend utilizes **Next.js Server Actions** as a secure intermediate layer (or proxy) between the React client components and the Symfony API Platform backend. 
* **Client Component** ➔ Triggers Server Action natively via HTML `<form action={formAction}>`.
* **Server Action** ➔ Handles session/token management, talks to the `/api` service via backend network, returns structured results.

---

## 2. Frontend Tech Stack (`/frontend`)

* **Framework:** Next.js 16+ (App Router, React 19 features like `useActionState`).
* **Styling:** Tailwind CSS.
* **UI Components:** `shadcn/ui` for layout/card/button structures.
* **Validation:** Zod.

---

## 3. Mandatory Frontend Rules & Design Patterns

When generating code for the frontend, you **must** adhere to the following architectural patterns:

### Form Management & State
1.  **No `react-hook-form`:** Do **not** use `react-hook-form` or Formik. Use native HTML `<form>` submission paired with Next.js Server Actions via the `action` attribute.
2.  **State Handling:** Use the native React `useActionState` hook to manage the server action execution, error payloads, and pending states.
3.  **UI Feedback:** Honor the `isPending` state returned by `useActionState`. Disable input fields and show loading indicators on buttons during submission.
4.  **Error Rendering:** Safely parse the server action's error state to display validation messages dynamically under the respective fields.

### Server Action Architecture
Every Server Action must follow the standardized structure found in existing actions (e.g., `actions/updateComment.ts`):

* **Signature:** Must accept `(prevState: unknown, formData: FormData | { ... })`.
* **Validation:** Use Zod schemas. On validation failure, strictly return:
    ```typescript
    { ok: false, code: "VALIDATION_ERROR", status: 400, errors: z.treeifyError(validated.error) }
    ```
* **API Configuration & Auth:** * Retrieve the base URL using `getApiUrl()`.
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
* **Hidden Form Fields:** When an ID or entity-scoped parameter is required but not visible to the user (e.g., `organizationId`), inject it into the form using a `<input type="hidden" name="organizationId" value={...} />` component.
* **Component Composition:** Prioritize composition using `shadcn/ui` layout elements (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) for standard interactive modules.
* **Locality:** Place corresponding types, Zod schemas, and components according to existing Next.js App Router structural boundaries.

---

## 5. Reference Implementation Blueprint

Use this structural blueprint as your golden standard for creating new forms and server actions:

### Server Action Blueprint (`actions/exampleAction.ts`)
```typescript
"use server";

import { z } from "zod";
import { getApiUrl, getOrRefreshAccessToken, handleApiError } from "@/lib/api"; // Verify exact path paths

const ExampleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(50),
});

export async function executeExampleAction(prevState: unknown, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = ExampleSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      status: 400,
      errors: z.treeifyError(validated.error), // Ensure treeifyError helper availability
    };
  }

  try {
    const nextApiUrl = getApiUrl();
    const token = await getOrRefreshAccessToken(nextApiUrl);

    const response = await fetch(`${nextApiUrl}/your-endpoint/${validated.data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: validated.data.name }),
    });

    const data = await response.json();
    return { ok: true, content: data };
  } catch (error) {
    return handleApiError(error, "Execute example action");
  }
}
