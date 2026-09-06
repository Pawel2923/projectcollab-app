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

- [Docker](https://www.docker.com/)
- [Node.js (version 22 or newer)](https://nodejs.org/en/download)

**Environment Setup**

Configure the required environment variables in the `.env` file in the main project directory. The variables are documented in the `.env.example` file.

---
### Installation / Running Instructions

#### Development

1. Build and run:

```bash
docker compose up --build --wait
```

2. <a id="dev-step-2"></a>Generate the key for the `lexik` package:

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```
3. Stop the application:

```bash
docker compose stop
```
#### Production

1. Build:

```bash
docker compose -f compose.yaml -f compose.prod.yaml build --no-cache
```

2. Run the application:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --wait --no-build
```

3. Generate `lexik` keys, same as in the development version ([key generation](#dev-step-2)).

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
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
