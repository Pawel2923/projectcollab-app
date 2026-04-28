#!/bin/bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <env file>" >&2
  exit 1
fi

ENV_FILE="$1"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: Env file '$ENV_FILE' not found" >&2
  exit 1
fi

COMPOSE_ARGS=(
  -f compose.yml
  -f compose.prod.yml
  --env-file "$ENV_FILE"
)

run_compose() {
  docker compose "${COMPOSE_ARGS[@]}" "$@"
}

if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed." >&2
  exit 1
fi

echo "Pulling production image with from registry..."
run_compose pull

echo "Starting production containers..."
run_compose up --wait --no-build

echo "Generating new lexik JWT keys for production environment..."
run_compose exec api php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction

echo "Production environment setup completed successfully."
