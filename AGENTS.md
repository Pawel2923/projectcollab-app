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
* **Client-First Validation:** Forms validate input data on the client first (using `react-hook-form` and Zod) to provide immediate feedback and avoid unnecessary network requests.
* **Selective Server Action Usage:** Not all form changes or user interactions need to call the backend. Local UI state and client-only actions should be handled directly on the client.
* **Server Actions as Intermediate Proxy:** When communication with the backend is required (e.g., data mutations, secure API Platform calls), Next.js Server Actions act as a secure proxy:
  * **Client Component** ➔ Validates input locally via `react-hook-form`, then invokes the Server Action (or passes validated data).
  * **Server Action** ➔ Performs server-side validation, handles session/token management via `getOrRefreshAccessToken()`, communicates with the `/api` service via backend network, and returns a structured `ActionResult`.

---

## 2. Frontend Tech Stack (`/frontend`)

* **Framework:** Next.js 16+ (App Router, React 19).
* **Styling:** Tailwind CSS.
* **UI Components:** `shadcn/ui` for layout/card/button structures.
* **Forms & Validation:** `react-hook-form`, `@hookform/resolvers`, Zod.

---

## 3. Mandatory Frontend Rules & Design Patterns

When generating code for the frontend, you **must** adhere to the following architectural patterns:

### Form Management & Validation
1. **Client-First Validation:** Always validate form inputs on the client side first using Zod schemas paired with `react-hook-form` (via `@hookform/resolvers/zod`). This provides immediate feedback to users without unnecessary server roundtrips.
2. **Selective Server Action Usage:** Not all forms or state changes need to fetch the backend. Use Server Actions only when mutating data or interacting with the Symfony backend API. Client-side state changes and interactions that do not require backend communication should remain purely on the client.
3. **Server Action Integration:** When a form interacts with the backend, invoke the Server Action after client validation passes. The action can receive either `FormData` or a structured object.
4. **UI Feedback & Loading States:** Honor loading/pending states during submission (`isSubmitting` from `react-hook-form` or `isPending` from `useActionState` / transitions). Disable input fields and show loading indicators on buttons during submission.
5. **Error Rendering:** Display validation error messages dynamically under the respective fields from client form state. Display server-side errors returned by the `ActionResult` payload gracefully when backend calls fail.

### Server Action Architecture
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

## 5. Reference Implementation Blueprint

Use this structural blueprint as your golden standard for creating new forms and server actions:

### Client Form Component (`components/ExampleForm.tsx`)
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { executeExampleAction } from "@/actions/exampleAction";

const ExampleSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

type ExampleFormData = z.infer<typeof ExampleSchema>;

export function ExampleForm({ entityId }: { entityId: string }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExampleFormData>({
    resolver: zodResolver(ExampleSchema),
    defaultValues: { id: entityId, name: "" },
  });

  const onSubmit = async (data: ExampleFormData) => {
    setServerError(null);
    const result = await executeExampleAction(null, data);
    if (!result.ok) {
      setServerError(result.message ?? "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id")} />
      <div>
        <input {...register("name")} disabled={isSubmitting} className="border p-2 rounded w-full" />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
        {isSubmitting ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}
```

### Server Action Blueprint (`actions/exampleAction.ts`)
```typescript
"use server";

import { z } from "zod";
import type { ActionResult } from "@/actions/types/ActionResult";
import { getOrRefreshAccessToken } from "@/services/auth/token-service";
import { handleApiError } from "@/services/error/api-error-handler";
import { getApiUrl } from "@/utils/get-api-url";

const ExampleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(50),
});

type ExampleActionData =
  | FormData
  | {
      id: string;
      name: string;
    };

export async function executeExampleAction(
  _prevState: unknown,
  formData: ExampleActionData,
): Promise<ActionResult<unknown>> {
  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;
  const validated = ExampleSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      status: 400,
      errors: z.treeifyError(validated.error),
    };
  }

  try {
    const nextApiUrl = getApiUrl();
    if (!nextApiUrl) {
      return { ok: false, code: "SERVER_CONFIG_ERROR", status: 500 };
    }

    const token = await getOrRefreshAccessToken(nextApiUrl);
    if (!token) {
      return { ok: false, code: "UNAUTHORIZED", status: 401 };
    }

    const response = await fetch(`${nextApiUrl}/your-endpoint/${validated.data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
        Authorization: `Bearer ${token}`,
        accept: "application/ld+json",
      },
      body: JSON.stringify({ name: validated.data.name }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return handleApiError(data, "Execute example action");
    }

    return { ok: true, content: data };
  } catch (error) {
    return handleApiError(error, "Execute example action");
  }
}
