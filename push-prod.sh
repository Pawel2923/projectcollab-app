#!/bin/bash
set -euo pipefail

COMPOSE_ARGS=(
  -f compose.yml
  -f compose.prod.yml
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

echo "Building production image with latest tag..."
run_compose build --no-cache

echo "Pushing production image with latest tag to registry..."
run_compose push

echo "Production image pushed successfully."
