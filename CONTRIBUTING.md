# Contributing to ProjectCollab

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.pl.md)

Thank you for your interest in contributing to **ProjectCollab**! We welcome bug reports, feature requests, code contributions, and documentation improvements.

This document provides a set of guidelines and standards for contributing to the repository. Please take a moment to review these guidelines before submitting code.

---

## Code of Conduct

We expect all contributors to maintain a respectful, inclusive, and professional environment in all interactions within the community and repository issues/pull requests.

---

## Running Commands & Docker Workflow

The development environment is orchestrated with Docker Compose to provide consistent dependencies across the stack.

> [!NOTE]
> **Container Execution & Service Restarts**
> 
> - **Routine development commands** (e.g. tests, linters, Doctrine schema validation) are typically executed inside running containers using `docker compose exec`:
>   ```bash
>   # Frontend checks
>   docker compose exec frontend pnpm dev-check
>
>   # Backend checks
>   docker compose exec api php bin/console doctrine:schema:validate
>   docker compose exec api bin/phpunit
>   ```
> - **Dependency & package management:** Because the development services (`pnpm dev`, FrankenPHP server) run continuously, simply executing package installation commands inside a running container is often not enough. If new packages are added or dependencies change (e.g., `pnpm add`, `composer require`), the affected container needs to be restarted or rebuilt to properly reflect changes in the running server:
>   ```bash
>   # Restart service to apply dependency changes
>   docker compose restart frontend
>
>   # Or rebuild if Docker configuration or base dependencies changed
>   docker compose up --build -d
>   ```

---

## Local Development Setup

### Prerequisites

**Tools**

- [Docker](https://www.docker.com/)
- [Node.js (version 22 or newer)](https://nodejs.org/en/download)
- [Git](https://git-scm.com/)

**Environment Setup**

Configure the required environment variables in the `.env` file in the main project directory. The variables are documented in the `.env.example` file.

---

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pawel2923/projectcollab-app.git
   cd projectcollab-app
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Build and run the application:**
   ```bash
   docker compose up --build --wait
   ```

4. **Generate JWT keys:**
   ```bash
   docker compose exec api php bin/console lexik:jwt:generate-keypair
   ```

5. **Stop the application:**
   ```bash
   docker compose stop
   ```

> [!NOTE]
> - App uses ports `80`, `443`, and `5432`. Make sure these ports are not occupied.
> - Data is persisted in a Docker volume used by PostgreSQL service.
> - Make sure to have JWT keys generated for authentication to work.

#### Loading sample data into the application (do not use in production):

```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```

---

### Remote Development Support

ProjectCollab supports developing on a remote server with Docker while writing code, testing, and debugging directly from your local IDE (PhpStorm, Visual Studio Code, or any SSH/Dev Container compatible IDE). See the [README](README.md#remote-development-support) for prerequisites.

---

## Branching & Commit Conventions

### Branch Naming
Branch naming conventions are flexible and not strictly enforced, but we recommend using clear, descriptive names prefixed by topic, for example:
* `feat/` – New feature (e.g., `feat/kanban-filter`)
* `fix/` – Bug fix (e.g., `fix/jwt-refresh-token`)
* `docs/` – Documentation updates (e.g., `docs/contributing-guide`)
* `refactor/` – Code refactoring without changing functionality (e.g., `refactor/server-actions`)
* `test/` – Adding or updating tests (e.g., `test/task-service`)
* `chore/` – Tooling or dependency maintenance (e.g., `chore/bump-next`)

### Commit Messages
The [Conventional Commits](https://www.conventionalcommits.org/) standard is **strictly required**. Structure your commits as follows:
```text
<type>[optional scope]: <description>

[optional body]
```

> [!NOTE]
> The `scope` is optional. Both scoped (e.g., `feat(frontend): add filter drawer to kanban board`) and unscoped (e.g., `feat: add filter drawer to kanban board`) commits are valid.

* **Examples:**
  * `feat: add filter drawer to kanban board`
  * `feat(frontend): add filter drawer to kanban board`
  * `fix: correct user authorization check on sprint creation`
  * `fix(api): correct user authorization check on sprint creation`
  * `docs: update setup instructions in README`

---

## Frontend Architecture & Coding Standards (`/frontend`)

The frontend application is built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **`shadcn/ui`**, **`react-hook-form`**, and **Zod**.

### Architectural Rules

1. **Form Management & Validation:**
   * **Client-First Validation:** Validate form inputs on the client side first using Zod schemas with `react-hook-form` (via `@hookform/resolvers/zod`). This ensures instantaneous user feedback without unnecessary network roundtrips.
   * **Selective Server Action Usage:** Not all form changes or interactions need to call the backend. Handle client-only UI states and local updates directly on the client. Use Server Actions only when mutating data or interacting with the Symfony backend API.
   * **Server Action Integration:** When a form communicates with the backend, invoke the Server Action after client-side validation passes. Server Actions perform secondary server-side validation and securely proxy requests to Symfony API Platform.
   * **UI Feedback & Pending States:** Honor loading and pending states during submission (`isSubmitting` from `react-hook-form` or `isPending` from `useActionState` / transitions). Disable input fields and show loading indicators on buttons during submission.

2. **Server Action Pattern:**
   When a Server Action is required, it must follow the project's standard blueprint:
   * Accept `(_prevState: unknown, formData: FormData | { ... })` and return `Promise<ActionResult<T>>`.
   * Validate parameters with Zod schemas. On validation failure, return:
     ```typescript
     { ok: false, code: "VALIDATION_ERROR", status: 400, errors: z.treeifyError(validated.error) }
     ```
   * Fetch/refresh authentication tokens via `getOrRefreshAccessToken(nextApiUrl)`.
   * When sending `PATCH` requests to API Platform, include header: `Content-Type: application/merge-patch+json`.
   * Wrap calls with `handleApiError(error, "Action Context Description")`.

3. **Type Safety & Component Structure:**
   * Use strict TypeScript. Never use `any`.
   * When an ID or entity-scoped parameter is required (e.g., `organizationId`), include it in the form registration or submission payload.
   * Prefer `shadcn/ui` layout primitives (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`).

### Quality & Testing Commands (Run inside Container)

```bash
# Type check TypeScript
docker compose exec frontend pnpm check-types

# Lint code
docker compose exec frontend pnpm lint

# Fix linting issues automatically
docker compose exec frontend pnpm lint:fix

# Format check with Prettier
docker compose exec frontend pnpm format-check

# Auto-format files
docker compose exec frontend pnpm format

# Run unit / component tests
docker compose exec frontend pnpm test

# Run full development check (type-check, lint, format, and test)
docker compose exec frontend pnpm dev-check
```

---

## Backend Architecture & Coding Standards (`/api`)

The backend API is built with **Symfony 7.3**, **API Platform 4.2**, **PHP 8.4+**, **Doctrine ORM**, and **FrankenPHP**.

### Architectural Rules

1. **REST & API Platform:**
   * Use API Platform annotations/attributes for resource endpoints.
   * Follow JSON-LD / Hydra specifications.

2. **Database & Migrations:**
   * Never modify the database schema directly. Always generate Doctrine migrations:
     ```bash
     docker compose exec api php bin/console make:migration
     docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
     ```

3. **Code Quality Standards:**
   * Follow PSR-12 formatting rules.
   * Maintain clean separation between Controllers, Services, DTOs, and Entities.

### Quality & Testing Commands (Run inside Container)

```bash
# Validate Doctrine schema mapping
docker compose exec api php bin/console doctrine:schema:validate

# Format code with PHP-CS-Fixer
docker compose exec api vendor/bin/php-cs-fixer fix

# Check code formatting with PHP-CS-Fixer
docker compose exec api vendor/bin/php-cs-fixer check

# Run PHPUnit tests
docker compose exec api bin/phpunit
```

---

## Pull Request Checklist

Before submitting a Pull Request, ensure that:

- [ ] All code runs cleanly inside Docker containers (`docker compose up --build`).
- [ ] Frontend code passes all checks: `docker compose exec frontend pnpm dev-check`.
- [ ] Backend Doctrine schema is valid: `docker compose exec api php bin/console doctrine:schema:validate`.
- [ ] Backend tests pass: `docker compose exec api bin/phpunit`.
- [ ] Code adheres to the architectural rules in [`AGENTS.md`](AGENTS.md).
- [ ] Commits follow Conventional Commits formatting.
- [ ] PR title and description clearly explain the problem solved, changes made, and testing steps.

---

## Security Guidelines

If you discover a security vulnerability, please refer to our [Security Policy](SECURITY.md) for disclosure details.
