# Contributing to ProjectCollab

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/CONTRIBUTING.pl.md)

Thank you for your interest in contributing to **ProjectCollab**! We welcome bug reports, feature requests, code contributions, and documentation improvements.

This document provides a set of guidelines and standards for contributing to the repository. Please take a moment to review these guidelines before submitting code.

---

## Code of Conduct

We expect all contributors to maintain a respectful, inclusive, and professional environment in all interactions within the community and repository issues/pull requests.

---

## Critical Rules of Engagement

> [!IMPORTANT]
> **Containerized Execution Requirement**
> 
> **NEVER** run `pnpm`, `npm`, `composer`, or Symfony console commands directly on your host machine.
> All dependencies and runtime tools are strictly managed within Docker containers. Always run commands through Docker Compose:
>
> ```bash
> # Frontend example
> docker compose exec frontend pnpm install
> docker compose exec frontend pnpm dev-check
>
> # Backend example
> docker compose exec api php bin/console doctrine:schema:validate
> docker compose exec api composer install
> ```

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pawel2923/projectcollab-app.git
   cd projectcollab-app
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in necessary configuration parameters:
   ```bash
   cp .env.example .env
   ```

3. **Start Docker Containers:**
   ```bash
   docker compose up --build --wait
   ```

4. **Generate JWT Keys for Authentication:**
   ```bash
   docker compose exec api php bin/console lexik:jwt:generate-keypair
   ```

5. **(Optional) Load Sample Data:**
   ```bash
   docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
   ```

---

## Branching & Commit Conventions

### Branch Naming
Create descriptive branch names using the following prefixes:
* `feat/` – New feature (e.g., `feat/kanban-filter`)
* `fix/` – Bug fix (e.g., `fix/jwt-refresh-token`)
* `docs/` – Documentation updates (e.g., `docs/contributing-guide`)
* `refactor/` – Code refactoring without changing functionality (e.g., `refactor/server-actions`)
* `test/` – Adding or updating tests (e.g., `test/task-service`)
* `chore/` – Tooling or dependency maintenance (e.g., `chore/bump-next`)

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. Structure your commits as follows:
```text
<type>(<scope>): <short description>

[optional body]
```
* **Examples:**
  * `feat(frontend): add filter drawer to kanban board`
  * `fix(api): correct user authorization check on sprint creation`
  * `docs: update setup instructions in README`

---

## Frontend Architecture & Coding Standards (`/frontend`)

The frontend application is built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **`shadcn/ui`**, and **Zod**.

### Architectural Rules

1. **Form Management & State:**
   * **Do NOT use `react-hook-form` or Formik.**
   * Use native HTML `<form action={formAction}>` elements paired with Next.js Server Actions.
   * Manage server action state, loading states, and errors using React's native `useActionState` hook.
   * Honor the `isPending` state returned by `useActionState`: disable submit buttons and input fields while submission is pending.

2. **Server Action Pattern:**
   Every Server Action must follow the project's standard blueprint:
   * Accept `(prevState: unknown, formData: FormData)`.
   * Validate parameters with Zod schemas. On validation failure, return:
     ```typescript
     { ok: false, code: "VALIDATION_ERROR", status: 400, errors: z.treeifyError(validated.error) }
     ```
   * Fetch/refresh authentication tokens via `getOrRefreshAccessToken(nextApiUrl)`.
   * When sending `PATCH` requests to API Platform, include header: `Content-Type: application/merge-patch+json`.
   * Wrap calls with `handleApiError(error, "Action Context Description")`.

3. **Type Safety & Component Structure:**
   * Use strict TypeScript. Never use `any`.
   * Use `<input type="hidden" name="id" value={...} />` for entity-scoped IDs.
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
- [ ] Code adheres to the architectural rules in [`AGENT.md`](file:///home/pawel/projectcollab-app/AGENT.md).
- [ ] Commits follow Conventional Commits formatting.
- [ ] PR title and description clearly explain the problem solved, changes made, and testing steps.

---

## Security Guidelines

If you discover a security vulnerability, please refer to our [Security Policy](file:///home/pawel/projectcollab-app/SECURITY.md) for disclosure details. Do not create public issues for sensitive security exploits.
