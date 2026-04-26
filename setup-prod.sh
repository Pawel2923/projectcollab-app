#!/bin/bash
set -euo pipefail

COMPOSE_ARGS=(
  -f compose.yml
  -f compose.prod.yml
  --env-file .env
  --env-file .env.prod.local
)

run_compose() {
  docker compose "${COMPOSE_ARGS[@]}" "$@"
}

if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed." >&2
  exit 1
fi

if [[ ! -f ".env" || ! -f ".env.prod.local" ]]; then
  echo "Error: Missing required env files (.env and/or .env.prod.local)" >&2
  exit 1
fi

echo "Pulling production image with latest tag from registry..."
run_compose pull

echo "Starting production containers..."
run_compose up --wait --no-build

echo "Generating new lexik JWT keys for production environment..."
run_compose exec api php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction

echo "Production environment setup completed successfully."
