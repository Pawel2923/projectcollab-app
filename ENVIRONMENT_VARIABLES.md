# Environment variables — where to configure (concise reference)

Summary  
Keep runtime secrets out of the repo. Configure developer defaults with local `.env*` files, and inject production values via your container/orchestration or a secret manager. Follow Symfony/ApiPlatform and Next.js rules (see sections below).

---

## Principles (quick)
- Do: keep `.env.local`, `.env.local.php`, and any secret files out of VCS. Add them to .gitignore.  
- Precedence (typical): container/process env > docker-compose `env_file` / `environment` > `.env.local` > `.env`. Symfony’s Dotenv only loads `.env*` when `APP_ENV` is not set in the environment.  
- Secrets: use Docker secrets, environment injection from your CI/CD, or a secret manager (Vault, AWS Secrets Manager). Never commit private keys / JWT secrets.  
- Frontend: Next.js exposes only variables prefixed with `NEXT_PUBLIC_` to client code — those become public and are baked at build-time unless you configure runtime env.

---

## Symfony / API Platform (where & how)
- Local dev:
  - Use repository `env` template (e.g. `.env`) for non-sensitive defaults.
  - Put machine-specific/secrets in `.env.local` (gitignored).
- Production:
  - Do NOT rely on `.env` in production. Provide environment variables to PHP-FPM/CLI (e.g., via docker container `environment`, systemd, or Kubernetes secrets).
  - Symfony Dotenv will skip loading `.env` when `APP_ENV` or `APP_SECRET` is already present in the environment.
- Common vars you will likely need:
  - `APP_ENV=dev|prod`
  - `APP_DEBUG=0|1`
  - `APP_SECRET=...`
  - `DATABASE_URL=mysql://user:pass@db:3306/dbname`
  - `REDIS_URL=redis://redis:6379`
  - `MAILER_DSN=smtp://user:pass@smtp:587`
  - `MESSENGER_TRANSPORT_DSN=doctrine://default`
  - `JWT_PASSPHRASE`, `JWT_PRIVATE_KEY_PATH`, `JWT_PUBLIC_KEY_PATH` or `JWT_SECRET`
  - `MERCURE_PUBLISH_URL`, `MERCURE_JWT_TOKEN`
  - `TRUSTED_PROXIES`, `CORS_ALLOW_ORIGIN` / `CORS_ALLOW_ORIGIN_REGEX`
- Example `.env.local` (dev, gitignored)
```env
APP_ENV=dev
APP_DEBUG=1
APP_SECRET=replace-with-local-secret
DATABASE_URL=mysql://root:password@mysql:3306/projectcollab
REDIS_URL=redis://redis:6379
MAILER_DSN=smtp://user:pass@smtp:1025
JWT_PASSPHRASE=local-passphrase
```
- How Symfony reads them: use `%env(DATABASE_URL)%` or `%env(resolve:DATABASE_URL)%` in config.

---

## Docker / docker-compose (where & how)
- Compose root `.env` (optional): docker-compose reads an `.env` next to `docker-compose.yml` to substitute `${VAR}` in compose files. This is not automatically passed into services unless referenced under `environment` or `env_file`.
- Preferred patterns:
  - Development: keep `docker-compose.override.yml` referencing a local `env_file: .env.local` (this file is gitignored).
  - Production: inject env vars via your deployment (CI/CD), `docker stack deploy` with `--env-file`, Kubernetes Secrets, or Docker secrets.
- Example `docker-compose` service fragment:
```yaml
services:
  api:
    image: projectcollab-api:latest
    env_file:
      - ./compose.env   # local, gitignored
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
NEXT_PUBLIC_API_BASE=https://api.localhost
NEXT_PUBLIC_WS_URL=wss://api.localhost/.well-known/mercure
NEXT_PUBLIC_MAP_KEY=some-public-key
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
