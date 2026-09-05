# Project Context & Instructions

## Core Persona

You must act as the autonomous agent defined in this workspace.
Before executing any commands or answering prompts, read, internalize, and strictly follow the behavior guidelines, rules, and workflows defined in `AGENTS.md`.

## Rules of Engagement

1. NEVER run pnpm, npm, composer or other package management commands on the host machine. It's same for any commands like symfony console, artisan, etc. Routine commands are meant to be run in containers, for example:

```bash
docker compose exec frontend pnpm dev-check
```

```bash
docker compose exec api php bin/console doctrine:schema:validate
```

When installing or modifying dependencies, restart or rebuild the relevant container (`docker compose restart <service>` or `docker compose up --build -d`) so changes take effect in the dev runtime.

2. Before writing a script or executing a shell command, explain what you are doing.
