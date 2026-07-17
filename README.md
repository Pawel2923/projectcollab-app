# ProjectCollab

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.md) [![pl](https://img.shields.io/badge/lang-pl-blue)](https://github.com/Pawel2923/projectcollab-app/blob/main/README.pl.md)

PROJECT MANAGEMENT PLATFORM WITH AGILE METHODOLOGY INTEGRATION

ProjectCollab is a web application that enables project management
carried out in accordance with Agile methodologies (Scrum, Kanban) and team communication. The application was
developed as an engineering thesis.

## Features

- **Authentication** using Microsoft and Google accounts, as well as using email address and password.
- **RBAC system** allowing control over organization resources.
- **Navigation and search** allow quick access to application elements.
- **Organizations and projects** allow managing team members and organizing work.
- **Text chat** allows for integrated team communication and maintaining work context.
- **Kanban board and task list** allow displaying and managing tasks in a project.
- **Sprints** manage the product backlog and plan sprints according to iterative software development.
- **Synchronize calendars** Google and Microsoft to easily track task deadlines.
- **Reports** allow checking spent time and activity for tasks.

## Running the Application

### Before Running

**Required Tools**

- [Docker](https://www.docker.com/)
- [Node.js (version 22 or newer)](https://nodejs.org/en/download)

**Environment Variables**

Configure the required environment variables in the `.env` file in the main project directory. The variables are documented in the `.env.example` file.

### Installation / Running Instructions

#### Development Version

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
#### Production Version

> Before building the production image and running the application, make sure that environment variables for the production environment have been configured in the `.env` file.

1. Build:

```bash
docker compose -f compose.yaml -f compose.prod.yaml build --no-cache
```

2. Run the application:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --wait --no-build
```

3. Generate the key for the `lexik` package, same as in the development version ([key generation](#dev-step-2)).

```bash
docker compose exec api php bin/console lexik:jwt:generate-keypair
```
Additional Information

- Make sure that ports `80`, `443`, and `5432` are not occupied by other applications.
- Data stored in the database is persisted in a Docker volume.
- Login errors may occur, which is visible in the logs of the `api` service as an exception from LexikJWTAuthenticationBundle. To fix this issue, generate JWT keys.
- Loading sample data into the application:

```bash
docker compose exec api php bin/console doctrine:fixtures:load --no-interaction
```
