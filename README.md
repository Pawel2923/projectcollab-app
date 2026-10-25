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

| Target | Description |
|---|---|
| `make help` | Display all available targets with descriptions |
| `make init` | Automated first-time local setup (`.env`, build, start, JWT) |
| `make up` / `make down` | Start development stack (`--build --wait`) / Stop and remove containers |
| `make stop` / `make start` | Stop / Start containers without recreating |
| `make restart [c=service]` | Restart all or a specific service (e.g. `make restart c=frontend`) |
| `make logs [c=service]` | Follow logs (e.g. `make logs c=api`) |
| `make ps` | List running development containers |
| `make prod-build` | Build production images (`--no-cache`) with `.env.prod.local` |
| `make prod-up` / `prod-down` | Start / Stop production stack with `.env.prod.local` |
| `make db-migrate` | Run pending Doctrine migrations |
| `make db-fixtures` | Load sample fixtures into database |
| `make db-validate` | Validate Doctrine schema and mapping |
| `make check` | Run all quality checks across frontend and backend |
| `make fix` | Auto-format and fix code styles across frontend and backend |
| `make test` | Run frontend and backend test suites |

---
## Remote Development Support

ProjectCollab supports developing on a remote server with Docker while writing code, testing, and debugging directly from your local IDE (PhpStorm, Visual Studio Code, or any SSH/Dev Container compatible IDE).

### Prerequisites

- A remote server with SSH access.
- Docker and Docker Compose installed on the remote server.
- The ProjectCollab repository cloned on the remote server.

---
## Contributing

Contributions are welcome! Please read our [Contribution Guidelines](CONTRIBUTING.md) before submitting pull requests or opening issues.

For security concerns, please refer to our [Security Policy](SECURITY.md).
