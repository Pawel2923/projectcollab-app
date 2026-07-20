# ProjectCollab

[![Production Build Status](https://img.shields.io/github/actions/workflow/status/Pawel2923/projectcollab-app/prod-docker-build.yml?branch=main&label=Production%20Build)](https://github.com/Pawel2923/projectcollab-app/actions)

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

## Remote Development Setup

ProjectCollab supports developing on a remote server with Docker while writing code, testing, and debugging directly from your local IDE (PhpStorm, Visual Studio Code, or any SSH/Dev Container compatible IDE).

### Prerequisites

- A remote server with SSH access.
- Docker and Docker Compose installed on the remote server.
- The ProjectCollab repository cloned on the remote server.

### 1. Connecting via IDE

#### Option A: Visual Studio Code

- **Using Dev Containers (Recommended)**:
  1. Install the **Dev Containers** extension in VS Code.
  2. Open VS Code and select **Dev Containers: Open Folder in Container...** from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
  3. Choose the project root (`.devcontainer/devcontainer.json`), or subfolders (`.devcontainer/api` / `.devcontainer/frontend`).
  4. VS Code automatically forwards necessary ports (`80`, `443`, `3000`, `9003`, `5432`, `1025`, `44949`) to your local machine.

- **Using Direct Remote - SSH**:
  1. Install the **Remote - SSH** extension in VS Code.
  2. Connect to your SSH host (`ssh user@remote-host`).
  3. Open the project folder (`/path/to/projectcollab-app`).
  4. Ensure Docker services are running: `docker compose up -d`.

#### Option B: PhpStorm / JetBrains IDEs

- **Using Dev Containers**:
  1. In JetBrains Gateway / PhpStorm, select **Dev Containers**.
  2. Choose your remote SSH connection and select the repository directory.
  3. PhpStorm will build and attach to the project's `.devcontainer/devcontainer.json`.
  > **Note / Troubleshooting (`Failed to receive final build state`)**:
  > If JetBrains Gateway fails with `Failed to receive final build state` during uploading/building:
  > - Ensure `"overrideCommand": false` is present in `devcontainer.json` (already configured).
  > - Alternatively, open PhpStorm via **Remote Development (SSH)** and use **Direct SSH & Docker Compose PHP Interpreter** (Option B below), which bypasses JetBrains Gateway `@devcontainers/cli` backend bugs over SSH.
  > - In PhpStorm settings, try toggling Registry setting `open.devcontainer.projects.natively` (`Ctrl+Shift+A` -> `Registry`).

- **Using Direct SSH & Docker Compose PHP Interpreter**:
  1. Open PhpStorm and connect to the remote host using **Remote Development** (JetBrains Gateway) or open project over SSH.
  2. Go to **Settings/Preferences** > **Languages & Frameworks** > **PHP**.
  3. Add a new CLI Interpreter from **Docker Compose**:
     - Configuration files: `compose.yaml`, `compose.override.yaml`
     - Service: `api`
  4. Under **Settings** > **PHP** > **Servers**, add a server configuration named `projectcollab-api`:
     - Host: `localhost`
     - Path mappings: Map local project root `/api` directory to remote container path `/app`.

---

### 2. Testing from Local Browser

You can access the application running on the remote server directly from your local client browser.

#### Method 1: SSH Port Forwarding (Recommended for Localhost Access)

Forward ports `80` and `443` from the remote server to your local machine:

```bash
ssh -L 80:localhost:80 -L 443:localhost:443 developer@remote-server-ip
```

*(Or rely on VS Code / Dev Container automatic port forwarding)*.

Then open your browser and navigate to:
- Frontend / Application: `http://localhost` (or `https://localhost`)
- Mailcatcher UI: `http://localhost:44949`

#### Method 2: Direct Remote IP / Domain Access

If you prefer to access the remote server directly via its IP address or domain name without SSH port forwarding:

1. On the remote server, edit `.env` and set:
   ```env
   SERVER_NAME=http://<REMOTE_SERVER_IP_OR_DOMAIN>
   ```
2. Restart the containers:
   ```bash
   docker compose down && docker compose up -d
   ```
3. Open `http://<REMOTE_SERVER_IP_OR_DOMAIN>` in your browser.

---

### 3. Hot Reloading (HMR)

Code changes saved on your local IDE (synced to the remote server via SSH or Dev Containers) automatically trigger instant hot reloading:

- **Frontend (Next.js)**: Hot Module Replacement (HMR) is enabled. `WATCHPACK_POLLING: "true"` ensures instant file change detection across remote volume mounts.
- **Backend (Symfony / FrankenPHP)**: FrankenPHP runs in `--watch` mode in development, automatically reloading PHP code on change.

---

### 4. Running & Debugging from IDE

#### PHP Debugging (Xdebug)

1. Enable Xdebug in `.env` by setting:
   ```env
   XDEBUG_MODE=debug
   ```
   Or set it when running Docker Compose:
   ```bash
   XDEBUG_MODE=debug docker compose up -d
   ```

2. **In VS Code**:
   - Go to the **Run and Debug** view (`Ctrl+Shift+D`).
   - Select **Listen for Xdebug (PHP)** and click **Start Debugging** (`F5`).

3. **In PhpStorm**:
   - Click the **Start Listening for PHP Debug Connections** icon in the top right toolbar.

4. Trigger a debug session by initiating a request in your browser with the Xdebug browser extension active or by appending `?XDEBUG_SESSION_START=PHPSTORM` to your request URL.

#### Frontend / Node Debugging

- Connect your IDE's Node.js debugger to port `9229` (pre-configured in `.vscode/launch.json` as `Next.js: Attach to Node Debugger`).

---

## Contributing

Contributions are welcome! Please read our [Contribution Guidelines](CONTRIBUTING.md) before submitting pull requests or opening issues.

For security concerns, please refer to our [Security Policy](SECURITY.md).


