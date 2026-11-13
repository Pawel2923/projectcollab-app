# ProjectCollab

[![Production Build Status](https://img.shields.io/github/actions/workflow/status/Pawel2923/projectcollab-app/prod-docker-build.yml?branch=main&label=Production%20Build)](https://github.com/Pawel2923/projectcollab-app/actions)

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.pl.md)

PROJECT MANAGEMENT PLATFORM WITH AGILE METHODOLOGY INTEGRATION

ProjectCollab is a web application that enables project management
carried out in accordance with Agile methodologies (Scrum, Kanban) and team communication. The application was
developed as an engineering thesis.

## Features

- **Authentication** using Microsoft and Google accounts, as well as using email address and password.
- **ABAC (Attribute-Based Access Control) system** allowing control over organization resources.
- **Navigation and search** allow quick access to application elements.
- **Organizations and projects** allow managing team members and organizing work.
- **Text chat** allows for integrated team communication and maintaining work context.
- **Kanban board and task list** allow displaying and managing tasks in a project.
- **Sprints** manage the product backlog and plan sprints according to iterative software development.
- **Synchronize calendars** Google and Microsoft to easily track task deadlines.
- **Reports** allow checking spent time and activity for tasks.

---
## Running the Application

### Prerequisites

**Tools**

- [Docker](https://www.docker.com/) (and Docker Compose v2)
- [Node.js (version 22 or newer)](https://nodejs.org/en/download)
- [GNU Make](https://www.gnu.org/software/make/) (optional, for convenient shortcut commands)

**Environment Setup**

- **Development:** Configure required environment variables in `.env` (copy from `.env.example`).
- **Production:** Configure production environment variables in `.env.prod.local`.

---
### Installation / Running Instructions

> [!TIP]
> A `Makefile` is provided to simplify Docker Compose commands. Run `make help` to inspect all available targets.

#### Quick Start (Development)

Run the automated initialization (creates `.env` if missing, builds/starts containers, and generates JWT keys):

```bash
make init
```

#### Development Step-by-Step

1. Build and run:

Using Make:
```bash
make up
```

Or using Docker Compose directly:
```bash
docker compose up --build --wait
```

2. <a id="dev-step-2"></a>Generate the key for the `lexik` package:

Using Make:
```bash
make jwt-keys
```

Or using Docker Compose directly:
```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```

3. Stop the application:

Using Make:
```bash
make stop
```

Or using Docker Compose directly:
```bash
docker compose stop
```

#### Production

Production uses `compose.yaml` with `compose.prod.yaml` and requires the `--env-file=.env.prod.local` flag.

1. Build images:

Using Make:
```bash
make prod-build
```

Or using Docker Compose directly:
```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file=.env.prod.local build --no-cache
```

2. Run the application:

Using Make:
```bash
make prod-up
```

Or using Docker Compose directly:
```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file=.env.prod.local up --wait --no-build
```

3. Generate `lexik` keys for production:

Using Make:
```bash
make jwt-keys-prod
```

Or using Docker Compose directly:
```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file=.env.prod.local exec api php bin/console lexik:jwt:generate-keypair
```

> [!NOTE]
> - App uses ports `80`, `443`, and `5432`. Make sure these ports are not occupied.
> - Data is persisted in a Docker volume used by PostgreSQL service.
> - Make sure to have JWT keys generated for authentication to work.

#### Loading sample data into the application (do not use in production):

Using Make:
```bash
make db-fixtures
```

Or using Docker Compose directly:
```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```

---
### Makefile Quick Reference

Run `make help` to inspect all available targets with descriptions directly in the terminal.

| Category | Target | Description |
|---|---|---|
| **Setup & Initialization** | `make help` | Display this help screen with available targets |
| | `make env` | Create `.env` from `.env.example` if it does not exist |
| | `make init` | Complete local setup: create `.env`, build/start dev containers, and generate JWT keys |
| | `make jwt-keys` | Generate Lexik JWT keypair in development `api` container |
| | `make jwt-keys-prod` | Generate Lexik JWT keypair in production `api` container |
| **Development** | `make up` / `make dev-up` | Build and start development containers (`--build --wait`) |
| | `make up-d` / `make dev-up-d` | Start development containers in detached mode without rebuilding |
| | `make build` / `make dev-build` | Build development images |
| | `make stop` / `make dev-stop` | Stop development containers without removing them |
| | `make start` / `make dev-start` | Start stopped development containers |
| | `make down` / `make dev-down` | Stop and remove development containers and networks |
| | `make restart [c=service]` | Restart all or specific service (e.g. `make restart c=frontend`) |
| | `make logs [c=service]` | Follow logs of all or specific service (e.g. `make logs c=api`) |
| | `make ps` / `make dev-ps` | List running development containers |
| **Production**<br>`(--env-file=.env.prod.local)` | `make prod-build` | Build production images without cache using `compose.prod.yaml` |
| | `make prod-up` | Run production containers (`--wait --no-build`) |
| | `make prod-up-d` | Run production containers in detached mode (`-d --wait --no-build`) |
| | `make prod-stop` | Stop production containers |
| | `make prod-down` | Stop and remove production containers and networks |
| | `make prod-restart [c=service]` | Restart production containers (use `c=service`) |
| | `make prod-logs [c=service]` | Follow production container logs (use `c=service`) |
| | `make prod-ps` | List running production containers |
| | `make prod-push` | Push production images to container registry |
| **Database & Migrations** | `make db-migrate` | Run pending Doctrine migrations |
| | `make db-migration` | Generate a new Doctrine migration from entity changes |
| | `make db-fixtures` | Load sample data/fixtures into database (development only) |
| | `make db-validate` | Validate Doctrine mapping and database schema |
| | `make db-reset` | Drop, recreate database, run migrations, and load fixtures |
| **Backend**<br>*(Symfony / API Platform)* | `make api-sh` | Open a shell inside the running `api` container |
| | `make api-console cmd="..."` | Run Symfony console command (e.g. `make api-console cmd="cache:clear"`) |
| | `make api-cache-clear` | Clear Symfony cache |
| | `make api-cs-fix` | Format PHP code using PHP-CS-Fixer |
| | `make api-cs-check` | Check PHP code style using PHP-CS-Fixer |
| | `make api-test` | Run backend PHPUnit tests |
| **Frontend**<br>*(Next.js)* | `make frontend-sh` | Open a shell inside the running `frontend` container |
| | `make frontend-dev-check` | Run all frontend checks (typecheck, lint fix, format, vitest) |
| | `make frontend-check-types` | Check TypeScript types |
| | `make frontend-lint` | Run ESLint checks |
| | `make frontend-lint-fix` | Fix ESLint issues automatically |
| | `make frontend-format` | Format frontend code with Prettier |
| | `make frontend-format-check` | Check frontend code formatting with Prettier |
| | `make frontend-test` | Run frontend tests with Vitest |
| **SPA**<br>*(Single Page Application)* | `make spa-build` | Build static SPA application inside frontend container |
| **Quality & Testing** | `make check` | Run all quality checks across frontend and backend |
| | `make fix` | Auto-format and fix code styles across frontend and backend |
| | `make test` | Run tests for both frontend and backend |
| **Maintenance & Cleanup** | `make clean` | Stop and remove development containers and orphan networks |
| | `make clean-volumes` | Stop and remove development containers, orphan networks, and persistent volumes |

---
## Contributing

Contributions are welcome! Please read our [Contribution Guidelines](CONTRIBUTING.md) before submitting pull requests or opening issues.

For security concerns, please refer to our [Security Policy](SECURITY.md).
