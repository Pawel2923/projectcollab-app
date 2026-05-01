# Production Deployment Guide

This guide deploys the project with Docker Compose in a way that is consistent with API Platform official documentation:
https://api-platform.com/docs/v4.2/deployment/docker-compose/

It is tailored to this repository structure and production files.

## 1) Prerequisites

- Linux server with Docker Engine and Docker Compose plugin installed.
- A DNS A record pointing your production domain to the server IP.
- Ability to open ports 80/tcp and 443/tcp (and optionally 443/udp for HTTP/3).
- Access to required secrets (do not commit secrets to git).
- Optional: container registry access if you push/pull prebuilt images.

## 2) Required Files and Compose Layers

- Base stack: `compose.yaml`
- Production overrides: `compose.prod.yaml`
- Local development overrides (do not use in production): `compose.override.yaml`

API Platform docs use the same merge pattern:

```bash
docker compose -f compose.yaml -f compose.prod.yaml ...
```

## 3) Create a Production Environment File

Create a local secrets file on the deployment host, for example `.env.prod`:

```env
# Domain and ports
SERVER_NAME=api.example.com
HTTP_PORT=80
HTTPS_PORT=443
HTTP3_PORT=443

# Compose image naming (optional)
IMAGES_PREFIX=registry.example.com/projectcollab-

# Application secrets
APP_SECRET=REPLACE_WITH_LONG_RANDOM_VALUE
CADDY_MERCURE_JWT_SECRET=REPLACE_WITH_LONG_RANDOM_VALUE

# Database
POSTGRES_DB=app
POSTGRES_USER=app
POSTGRES_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
POSTGRES_VERSION=16
POSTGRES_CHARSET=utf8

# Reverse proxy trust (adjust to your infra)
TRUSTED_PROXIES=127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
TRUSTED_HOSTS=^api\.example\.com|api$

# Frontend/public URLs
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_MERCURE_URL=https://api.example.com/.well-known/mercure
AUTH_URL=https://app.example.com
```

Notes:
- Keep this file outside version control.
- Prefer a secrets manager or Docker secrets for production.
- `NEXT_PUBLIC_*` variables are public and baked into frontend build artifacts.

## 4) Validate Resolved Compose Config

Before first deployment:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod config
```

Check that:
- all required variables are resolved,
- correct ports are exposed,
- production build targets are selected.

## 5) Build and Publish Images (If Using a Registry)

Build with production config:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod build --no-cache
```

Push images:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod push
```

Important project caveat:
- Current helper scripts `push-prod.sh` and `setup-prod.sh` use `compose.yml`/`compose.prod.yml` names.
- Repository files are `compose.yaml`/`compose.prod.yaml`.
- Fix the scripts before relying on them in CI/CD.

## 6) Deploy on Server (API Platform-Compatible Flow)

On the target server, from repository root:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod up -d --wait
```

Or, if images are already in registry and should not be rebuilt:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod pull
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod up -d --wait --no-build
```

This matches the official API Platform Docker Compose deployment pattern.

## 7) Database and App Initialization

Current repository behavior:
- `api/frankenphp/docker-entrypoint.sh` waits for DB,
- runs migrations,
- seeds roles,
- generates JWT keypair.

Recommended production practice:
- run migrations as an explicit deployment step,
- manage JWT keypair as external secret material,
- avoid key regeneration during each startup.

Manual migration command:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod exec api php bin/console doctrine:migrations:migrate --no-interaction --all-or-nothing
```

## 8) Post-Deployment Verification

Basic checks:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod ps
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod logs --tail=200 api
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod logs --tail=200 frontend
curl -I https://api.example.com
curl -I https://api.example.com/.well-known/mercure
```

If behind CDN/load balancer, verify forwarded headers and trusted proxy settings.

## 9) Operations Cheatsheet

Restart services:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod restart api frontend
```

Open API shell:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod exec api sh
```

View effective runtime env subset:

```bash
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod exec api sh -lc 'printenv | grep -E "APP_|DATABASE|MERCURE|JWT|TRUSTED"'
```

## 10) Rollback

Use immutable image tags and deploy by tag. Rollback means redeploying previous known-good tags.

Example workflow:

```bash
# 1) Set previous image tags in env/compose variables
# 2) Pull previous tags
# 3) Recreate containers without build

docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod pull
docker compose -f compose.yaml -f compose.prod.yaml --env-file .env.prod up -d --wait --no-build
```

Always validate DB migration compatibility before rollback.

## 11) API Platform Consistency Check

Project mismatches and best-practice deviations were evaluated against official API Platform docs and saved in:

- `API_PLATFORM_PROJECT_INCOSISTENCIES.md`

Address HIGH items first, then MEDIUM items.

## 12) Troubleshooting

- Certificate not issued:
  - verify DNS points to server,
  - ensure ports 80/443 are reachable,
  - ensure `SERVER_NAME` is a real domain (not bare IP) when using automatic TLS.
- Frontend points to wrong API:
  - verify `NEXT_PUBLIC_*` values,
  - rebuild frontend image and redeploy.
- Migration/startup failures:
  - inspect API logs,
  - run migration command manually,
  - verify DB credentials and network reachability.
