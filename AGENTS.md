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

## 3. Mandatory SPA Domain-Driven Design

The `/spa` application is organized around **bounded contexts and features**, not around technical folders that mix unrelated business concepts.

### Bounded Contexts and Ubiquitous Language

* Identify bounded contexts by cohesive business capabilities, such as authentication/identity, organizations, projects, and issues.
* Keep the domain language consistent inside one bounded context. Use the application's real terms for entities, commands, queries, statuses, and errors.
* Do not copy backend/API names or JSON-LD structure into domain models if they differ from the SPA's business language.
* Context boundaries are stronger than folder boundaries: a feature must not import another feature's private domain implementation.
* Share only deliberate public contracts across contexts. Cross-context communication should use a public interface, view model, or event rather than an internal repository or entity.
* Do not invent a bounded context for every small screen. Create a feature/context when it represents a distinct lifecycle or language, and merge small unrelated screens under the most coherent existing context until a real boundary emerges.

### Recommended SPA Structure

Use feature-first organization under `spa/src/features/<bounded-context>/`:

```text
spa/src/features/
  authentication/
    domain/
    application/
    infrastructure/
    presentation/
    index.ts
  organizations/
    domain/
    application/
    infrastructure/
    presentation/
    index.ts
```

The TanStack Router files in `spa/src/routes/` remain route composition points. A route should import and render the relevant public feature component or wire feature dependencies; it should not contain domain rules or infrastructure calls.

Each feature layer has a narrow responsibility:

* **Domain:** Entities, aggregate roots, value objects, repository interfaces, domain services, domain events, invariants, and domain errors. It must not import React, TanStack, HTTP clients, browser APIs, or API Platform DTO types.
* **Application:** Use cases, commands, queries, application services, and orchestration ports. It coordinates domain behavior and infrastructure interfaces but does not render UI.
* **Infrastructure:** API/adaptor implementations, HTTP clients, mappers, TanStack Query configuration, and persistence integration. Keep API Platform response types and transport details inside adapters.
* **Presentation:** React components, forms, hooks, context/providers, route-local view state, and view models. Presentation maps user intent into application commands and maps application/domain results into UI state.

Shared code that is not tied to a bounded context belongs under a clearly named shared area, such as `spa/src/shared/ui`, `spa/src/shared/api`, or `spa/src/shared/config`. Do not turn a global `utils`, `types`, or `services` folder into the owner of business behavior.

### Domain and Application Rules

* Model important business states and invariants as types or methods rather than validating them repeatedly in components.
* Put invariant enforcement in entities, aggregate roots, value objects, or domain services where it belongs.
* Use strongly typed identifiers and discriminated unions for meaningful states. Do not expose backend stringly typed status fields directly when the domain has constrained values.
* Application use cases should have explicit command/query types and an explicit result or error contract.
* Use ports/interfaces for replaceable infrastructure such as repositories and API gateways. Inject implementations at the composition or infrastructure boundary.
* Keep TanStack Query cache keys and mutations in application/infrastructure hooks or services. Components should not duplicate transport and cache orchestration.
* React Context and Zustand-like stores may hold presentation/session state, but must not become hidden containers for all domain logic.
* Validation happens in both appropriate boundaries: Zod/RHF handles immediate form feedback, while domain/application code preserves invariants and rejects invalid state even if called outside a form.

### Infrastructure and Data Mapping

* Separate API DTO types from domain types. Map API Platform JSON-LD and partial responses in infrastructure mappers.
* An API response model may change independently of the domain model; presentation code must not depend on raw API Platform shapes.
* HTTP/authentication failures should be translated into application/domain errors at the infrastructure boundary.
* Keep API clients, cookie/token handling, refresh behavior, and base URLs in infrastructure modules, not in routes or domain code.
* Use TanStack Query for server/cache state and React state/context only for appropriate local or UI state.

### Feature Splitting and Migration

* New SPA work must follow this feature/bounded-context structure.
* When modifying legacy SPA code, extract the smallest coherent slice instead of postponing all migration work. Split domain, application, infrastructure, and presentation responsibilities as the feature grows.
* Do not move code mechanically: preserve behavior while assigning each part to the correct layer and public feature boundary.
* If a split would create more indirection than clarity, extract only the responsibility that is genuinely independent and keep the remaining feature small.
* Split files containing route rendering, form state, domain rules, API calls, and cache mutation. Route, form, view, use-case, mapper, API client, and domain model files should remain separate.

### SPA Testing

* **TDD is mandatory for SPA business logic:** write the failing test before the implementation for entities, value objects, domain services, application use cases, mappers, and infrastructure-adapter behavior that changes business behavior.
* Follow Red-Green-Refactor: add the smallest failing test that expresses the required behavior, implement only enough code to make it pass, then refactor for clarity and remove duplication.
* Start with domain/application tests. Add presentation and end-to-end tests only for behavior that must be verified across React, routing, forms, TanStack Query, or browser infrastructure.
* Test one observable behavior per test and use the bounded context's ubiquitous language in test names.
* A test is not complete if it only restates implementation details. Assert outcomes, invariants, emitted domain events, result/error contracts, and user-visible behavior.
* Unit-test domain entities, value objects, domain services, and application use cases without React or HTTP.
* Test infrastructure mappers and API adapters against representative API Platform responses and failures.
* Test presentation components by observable behavior and public interactions.
* Test cross-context integrations at their public boundary, not through private implementation details.
* Do not add production business logic to make an unrepresentative test pass. Improve the test or the domain model when the test exposes an incorrect assumption.
* Run the narrowest relevant Vitest test immediately after each meaningful implementation step. Run Playwright for route or browser workflows only when the changed behavior crosses those boundaries.
* A bug fix follows TDD: first add a focused regression test that reproduces the failure and fails on the current implementation, then fix the root cause.

---

## 4. Mandatory Frontend Rules & Design Patterns

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

## 5. Code Generation Instructions for the Agent

* **Type Safety:** Always write strict, strongly-typed TypeScript. Avoid `any`.
* **Hidden Form Fields / Identifiers:** When an ID or entity-scoped parameter is required (e.g., `organizationId`), include it in the form registration or submission payload.
* **Component Composition:** Prioritize composition using `shadcn/ui` layout elements (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) for standard interactive modules.
* **Locality:** Place corresponding types, Zod schemas, and components according to existing Next.js App Router structural boundaries.

---

## 6. General Software Design and Maintainability

Write code for the next maintainer, not only for the current test or request. Prefer small, explicit units with one clear responsibility over one large file that mixes data access, validation, orchestration, and presentation.

### SOLID Principles

* **Single Responsibility:** A class, hook, component, function, or module should have one reason to change. If a file handles unrelated concerns, split it along domain or responsibility boundaries.
* **Open/Closed:** Prefer extension points and composition over repeatedly editing stable logic. Use polymorphism or small strategy functions only when there is a real or strongly expected variation.
* **Liskov Substitution:** Subtypes, implementations, and mock replacements must preserve the behavioral contract of the interface or base type.
* **Interface Segregation:** Keep interfaces and prop types narrow. Components and services should not depend on methods or fields they do not use.
* **Dependency Inversion:** Depend on abstractions for replaceable infrastructure. Inject services, repositories, API clients, and handlers where appropriate instead of coupling domain behavior to concrete framework details.

### Cohesion and File/Module Splitting

* Each file should describe one coherent concept or responsibility.
* Split files when they contain multiple independent responsibilities, even if they are all used by the same feature.
* Use existing feature/domain boundaries before introducing new ones. Examples:
  * Frontend: route, feature component, reusable UI component, hook, query/mutation service, Zod schema, store/context, and type can live in separate files.
  * Backend: entity, DTO, repository, service, controller/state provider/state processor, event listener, and message handler should remain separate when their responsibilities differ.
* Do not combine entity definitions, API transport logic, UI rendering, form validation, and mutation orchestration in a single component or module.
* Keep related public exports and imports explicit. Avoid barrel files that create circular dependencies or hide ownership.
* Large file size is a smell, not a target: investigate files that grow past roughly 250-300 lines or mix several responsibilities. Extract a smaller unit first rather than accepting a monolithic implementation.
* Splitting should improve meaning and testability. Do not create artificial one-function files, excessive indirection, or deep folder trees that make a feature harder to follow.

### DRY, KISS, and YAGNI

* Remove duplication only when it represents the same concept and is likely to change together. Repeating a few simple lines is preferable to creating a speculative abstraction.
* Prefer the simplest solution that satisfies the requirement. Avoid speculative generic frameworks, feature flags, patterns, and configuration for hypothetical future cases.
* Extract shared logic after a clear repetition exists, not before; prefer a small named function or composable hook/component over copied implementation.
* Do not abstract merely to reduce line count. The shared version must have a clearer contract and ownership than the duplicated versions.

### Function and Component Design

* Use functions and components with clear inputs and outputs. Keep side effects explicit.
* Prefer pure logic and focused orchestration. Separate calculation, validation, I/O, and presentation where practical.
* Keep parameter lists small and use typed options objects or DTOs when a function needs several related values.
* Avoid boolean control flags that hide unrelated behaviors; prefer separate operations or a small enum/discriminated union.
* Keep early returns and guard clauses where they improve clarity. Avoid deeply nested conditionals.
* Do not mutate caller-owned objects or external state unexpectedly.
* Use composition over inheritance for UI and application behavior.
* Avoid "god" components, services, hooks, and utility modules that know too much about the rest of the application.

### Naming and Structure

* Name files, symbols, variables, and folders after their responsibility or domain concept.
* Use precise names. Avoid generic names such as `Utils`, `Manager`, `Helper`, `Common`, `Data`, or `handleStuff` when a narrower name is possible.
* Keep naming consistent with the surrounding application: existing route, entity, action, service, repository, DTO, schema, and test conventions take precedence.
* Colocate code that changes together, while keeping independent concerns in separate files.
* Use stable public APIs and explicit exports. Do not expose implementation details across module boundaries.

### Boundaries and Data Flow

* Validate untrusted input at the application's boundary and maintain that validation in the owning schema or DTO.
* Keep framework classes and transport models out of core domain logic where the existing architecture permits.
* Keep API/auth/session handling in dedicated services or actions rather than embedding it repeatedly in components.
* Frontend components should focus on rendering and interaction. Move reusable data fetching, mutation, and state synchronization into hooks, services, stores, or actions.
* Backend controllers and state handlers should be thin orchestration layers. Put reusable business rules and workflows in domain services or dedicated application classes.
* Do not leak JSON-LD, framework exceptions, database entities, or sensitive implementation details into presentation code unless explicitly required.
* Prefer immutable values and typed contracts over loosely structured objects.

### Error Handling and Observability

* Surface failures at the appropriate boundary and provide actionable, user-safe messages.
* Do not swallow exceptions or use broad fallback success-shaped responses.
* Validate required values and handle nullable or partial data explicitly.
* Preserve error context and use the repository's established logging or error-handler mechanism.
* Keep retries, caching, cancellation, and loading/error states intentional and easy to test.

### Testing and Verification

* Add focused tests for new behavior, edge cases, regressions, and important public contracts.
* Prefer testing observable behavior and boundaries over implementation details or private methods.
* Unit-test pure logic and isolated services; add integration or end-to-end tests for framework interactions and cross-layer workflows.
* Keep tests readable and isolated. Avoid test helpers that hide setup or assertions needed to understand a failure.
* Run the smallest relevant containerized test, lint, type-check, or build command; expand verification when the change affects shared behavior.
* Never consider a task complete until the expected behavior is verified and the worktree is left with only the intended changes.

### Before Making a Change

1. Identify the existing ownership and responsibility boundaries.
2. Search for equivalent behavior and reuse established helpers or patterns.
3. Decide which files should change and whether new files are needed to preserve separation.
4. Make complete but surgical edits that keep public contracts coherent.
5. Add or update directly related tests and documentation.
6. Verify the narrowest relevant suite and inspect the final diff.

---
