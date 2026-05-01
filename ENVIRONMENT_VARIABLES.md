# Environment variables — where to configure (concise reference)

Summary  
Keep runtime secrets out of the repo. For local work, set defaults in the app-specific `.env.local` files and in a compose override if needed. For production, inject values from your orchestrator or secret manager.

This project splits envs into three layers:
- Compose/deployment values used to start containers.
- Backend runtime values consumed by Symfony/API Platform.
- Frontend runtime values consumed by Next.js.

---

## Start Here
If you just want the minimum to run the project locally, set these first:
- API backend: `APP_ENV`, `APP_DEBUG`, `APP_SECRET`, `DATABASE_URL`, `TRUSTED_PROXIES`, `TRUSTED_HOSTS`, `TRUSTED_HEADERS`, `CORS_ALLOW_ORIGIN`, `MAILER_DSN`, `JWT_SECRET_KEY`, `JWT_PUBLIC_KEY`, `JWT_PASSPHRASE`, `MERCURE_URL`, `MERCURE_PUBLIC_URL`, `MERCURE_JWT_SECRET`.
- Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MERCURE_URL`, `NEXT_PUBLIC_API_ROUTE_PREFIX`, and one of `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, or `NEXT_PUBLIC_FRONTEND_URL`.
- Auth providers: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`.
- Compose: `SERVER_NAME`, `CADDY_MERCURE_JWT_SECRET`, `POSTGRES_*`, `IMAGES_PREFIX`, and the port variables if you are not using the defaults.

## Rules of Thumb
- Do: keep `.env.local`, `.env.local.php`, and any secret files out of VCS. Add them to `.gitignore`.
- Precedence (typical): process env > compose `environment` > compose `env_file` > app `.env.local` > app `.env`.
- Secrets: use Docker secrets, CI/CD injection, or a secret manager. Never commit private keys or JWT secrets.
- Frontend: variables prefixed with `NEXT_PUBLIC_` are exposed to browser code. Do not put secrets there.

---

## Backend: API Platform / Symfony
Local dev uses `api/.env` plus optional `api/.env.local`.

### Core runtime
- `APP_ENV`
- `APP_DEBUG`
- `APP_SECRET`
- `DATABASE_URL`
- `TRUSTED_PROXIES`
- `TRUSTED_HOSTS`
- `TRUSTED_HEADERS`
- `CORS_ALLOW_ORIGIN`
- `MAILER_DSN`
- `MESSENGER_TRANSPORT_DSN`
- `LOCK_DSN`
- `VAR_DUMPER_SERVER`

### Mercure and JWT
- `MERCURE_URL`
- `MERCURE_PUBLIC_URL`
- `MERCURE_JWT_SECRET`
- `JWT_SECRET_KEY`
- `JWT_PUBLIC_KEY`
- `JWT_PASSPHRASE`

### Feature-specific backend vars
- `SERVER_NAME`
- `FRONTEND_URL`
- `BACKEND_URL`
- `GOOGLE_API_KEY`
- `GOOGLE_AUTH_CONFIG`

### Example `api/.env.local`
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
MESSENGER_TRANSPORT_DSN=doctrine://default
LOCK_DSN=semaphore://default
VAR_DUMPER_SERVER=127.0.0.1:9912
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=local-passphrase
MERCURE_URL=http://api/.well-known/mercure
MERCURE_PUBLIC_URL=https://localhost/.well-known/mercure
MERCURE_JWT_SECRET=!ChangeThisMercureHubJWTSecretKey!
SERVER_NAME=localhost
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
GOOGLE_API_KEY=replace-with-public-api-key
GOOGLE_AUTH_CONFIG='{}'
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```
- How Symfony reads them: use `%env(DATABASE_URL)%` or `%env(resolve:DATABASE_URL)%` in config.

---

## Compose / Deployment
Compose reads the root `.env` for variable substitution in `compose.yaml`, but that does not automatically become container environment.

### Compose-only values
- `IMAGES_PREFIX`
- `SERVER_NAME`
- `FRONTEND_UPSTREAM`
- `HTTP_PORT`
- `HTTPS_PORT`
- `HTTP3_PORT`
- `POSTGRES_VERSION`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_CHARSET`
- `CADDY_MERCURE_JWT_SECRET`
- `CADDY_MERCURE_URL`
- `CADDY_MERCURE_PUBLIC_URL`

### Example `compose.override.yaml`
```yaml
services:
  api:
    env_file:
      - ./api/.env.local
    environment:
      APP_ENV: prod
      SERVER_NAME: localhost
      CADDY_MERCURE_JWT_SECRET: "!ChangeThisMercureHubJWTSecretKey!"
  frontend:
    env_file:
      - ./frontend/.env.local
```

### Production
- Prefer process env or secrets injection over committed `.env` files.
- Keep `CADDY_MERCURE_JWT_SECRET`, database credentials, OAuth client secrets, and JWT private material in your secret store.
- Use `ARG` for build-time defaults only. Do not bake secrets into images.

---

## Frontend: Next.js
Local dev uses `frontend/.env.local`.

### Public client vars
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_MERCURE_URL`
- `NEXT_PUBLIC_API_ROUTE_PREFIX`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_FRONTEND_URL`

### Server-side auth vars
- `AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`

### Example `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MERCURE_URL=http://localhost:80/.well-known/mercure
NEXT_PUBLIC_API_ROUTE_PREFIX=/core-api
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```

### Notes
- If the API URL changes, rebuild the frontend because `NEXT_PUBLIC_*` values are baked at build time.
- Use `AUTH_URL` when you want NextAuth-style helpers to resolve redirects from a canonical base URL.

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
- Local dev: create `api/.env.local` and `frontend/.env.local`, then add `compose.override.yaml` if you want local defaults in containers.
- Docker: ensure the override file points to the right env files or sets service `environment` values.
- Production: move secrets to the orchestration layer and keep public `NEXT_PUBLIC_*` values limited to non-sensitive data.
- Rebuild/restart containers and rebuild Next.js after env changes.
