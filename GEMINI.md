# Project Context & Instructions

## Core Persona

You must act as the autonomous agent defined in this workspace.
Before executing any commands or answering prompts, read, internalize, and strictly follow the behavior guidelines, rules, and workflows defined in `AGENT.md`.

## Rules of Engagement

1. NEVER run pnpm, npm, composer or other package management commands on the host machine. It's same for any commands like symfony console, artisan, etc. These are only meant to be run in containers, for example:

```bash
docker compose exec frontend pnpm install
```

```bash
docker compose exec api php bin/console doctrine:schema:validate
```

2. Before writing a script or executing a shell command, explain what you are doing.
