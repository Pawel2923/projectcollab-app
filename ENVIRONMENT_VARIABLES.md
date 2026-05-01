# Environment variables — where to configure (concise reference)

Summary  
Keep runtime secrets out of the repo. Configure developer defaults with local `.env*` files, and inject production values via your container/orchestration or a secret manager. Follow the project-specific Symfony/API Platform and Next.js variables listed below.

---

## Principles (quick)
- Do: keep `.env.local`, `.env.local.php`, and any secret files out of VCS. Add them to .gitignore.  
- Precedence (typical): container/process env > docker-compose `environment` / `env_file` > `.env.local` > `.env`. Symfony’s Dotenv loads `.env` and overlays later files, but real process environment still wins.  
- Secrets: use Docker secrets, environment injection from your CI/CD, or a secret manager (Vault, AWS Secrets Manager). Never commit private keys / JWT secrets.  
- Frontend: Next.js exposes only variables prefixed with `NEXT_PUBLIC_` to client code — those become public and are baked at build-time unless you configure runtime env.

---

## Symfony / API Platform (where & how)
- Local dev:
  - Use repository `env` template (e.g. `.env`) for non-sensitive defaults.
  - Put machine-specific/secrets in `.env.local` (gitignored).
- Production:
  - Do NOT rely on `.env` in production. Provide environment variables to PHP-FPM/CLI (e.g., via docker container `environment`, systemd, or Kubernetes secrets).
  - Symfony will still read the committed `.env` files during bootstrap unless you precompute `.env.local.php`; process env values override file values.
- Common vars used by this project:
  - `APP_ENV=dev|prod`
  - `APP_DEBUG=0|1`
  - `APP_SECRET=...`
  - `DATABASE_URL=postgresql://user:pass@db:5432/dbname?serverVersion=16&charset=utf8`
  - `TRUSTED_PROXIES`
  - `TRUSTED_HOSTS`
  - `TRUSTED_HEADERS`
  - `CORS_ALLOW_ORIGIN`
  - `MAILER_DSN`
  - `MESSENGER_TRANSPORT_DSN`
  - `JWT_SECRET_KEY`
  - `JWT_PUBLIC_KEY`
  - `JWT_PASSPHRASE`
  - `MERCURE_URL`
  - `MERCURE_PUBLIC_URL`
  - `MERCURE_JWT_SECRET`
- Example `.env.local` (dev, gitignored)
```env
APP_ENV=dev
APP_DEBUG=1
APP_SECRET=replace-with-local-secret
DATABASE_URL=postgresql://app:!ChangeMe!@database:5432/app?serverVersion=16&charset=utf8
TRUSTED_PROXIES=127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
TRUSTED_HOSTS=^(localhost|api)$
TRUSTED_HEADERS=x-forwarded-for,x-forwarded-proto
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
MAILER_DSN=null://null
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=local-passphrase
MERCURE_URL=http://api/.well-known/mercure
MERCURE_PUBLIC_URL=https://localhost/.well-known/mercure
MERCURE_JWT_SECRET=!ChangeThisMercureHubJWTSecretKey!
```
- How Symfony reads them: use `%env(DATABASE_URL)%` or `%env(resolve:DATABASE_URL)%` in config.

---

## Docker / docker-compose (where & how)
- Compose root `.env` (optional): docker-compose reads an `.env` next to `docker-compose.yml` to substitute `${VAR}` in compose files. This is not automatically passed into services unless referenced under `environment` or `env_file`.
- Preferred patterns:
  - Development: keep `docker-compose.override.yml` or `compose.override.yaml` referencing a local `env_file` (this file is gitignored).
  - Production: inject env vars via your deployment (CI/CD), `docker stack deploy` with `--env-file`, Kubernetes Secrets, or Docker secrets.
- Example `docker-compose` service fragment:
```yaml
services:
  api:
    image: projectcollab-api:latest
    env_file:
      - ./.env.local   # local, gitignored
    environment:
      - APP_ENV=prod   # explicit overrides
    secrets:
      - jwt_private_key
```
- Dockerfile: use `ARG` for build-time values and `ENV` for default runtime env. Do not bake secrets into images.
```dockerfile
ARG APP_ENV=prod
ENV APP_ENV=${APP_ENV}
```
- Docker secrets: mount secrets as files and reference them, or set entrypoint to export them as env vars at container start.

---

## Next.js frontend (where & how)
- Files: `.env`, `.env.local`, `.env.development`, `.env.production`. `.env.local` is for local dev and should be gitignored.
- Public vs server-only:
  - Public (client): prefix with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_API_URL`) — these are embedded into client bundle at build time.
  - Server-only variables can be used in Next.js API routes or server runtime but are not exposed to the browser.
- Build-time vs runtime:
  - If your API URL may change at runtime, either:
    - Build per environment with the right `.env.*`, or
    - Use runtime configuration (e.g., read from process env in a server entrypoint or use a tiny runtime config endpoint).
- Example `.env.local` for frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MERCURE_URL=http://localhost:80/.well-known/mercure
NEXT_PUBLIC_API_ROUTE_PREFIX=/core-api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Production & secrets (recommended)
- DO: inject secrets from CI/CD or orchestration (Kubernetes Secrets, Docker secrets, cloud secret manager). Rotate keys frequently.
- DO: limit file permissions on env files (600).
- DO: avoid `NEXT_PUBLIC_` for any secret — those values are public.
- Consider storing private key files (JWT keys) as Docker secrets and mounting them into `/run/secrets/` or a secure path inside container.

---

## Quick checks & troubleshooting
- Inspect resolved compose: `docker compose config`
- Show environment inside a running container:
```bash
docker compose exec api bash -lc 'printenv | grep -E "(APP_|DATABASE|JWT|REDIS|MAILER)"'
# or php-level
docker compose exec api php -r 'echo getenv("DATABASE_URL")."\n";'
```
- Symfony: if behavior differs between CLI and FPM, remember CLI may load `.env` via Dotenv while FPM may rely on process env (check how you start PHP-FPM in Docker image).
- Next.js: ensure you rebuild the app after changing build-time envs.

---

## Small checklist to fix broken config
- Local dev: create `.env.local` (gitignored) for Symfony and `.env.local` for Next.js with proper values.
- Docker: ensure `docker-compose.override.yml` or compose.yml points to those env files or sets `environment` for services.
- Production: move secrets to the orchestration layer (CI/CD secrets, Docker secrets, Kubernetes secrets).
- Rebuild/restart containers and rebuild Next.js after env changes.
