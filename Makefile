# ==============================================================================
# ProjectCollab - Makefile
# ==============================================================================
# Convenience automation wrapper for Docker Compose full-stack setup:
# - API Platform (FrankenPHP / Symfony 7.3 / PHP 8.4)
# - Next.js 16 (App Router / React 19)
# - PostgreSQL 16 & Redis 7
#
# Usage:
#   make <target> [c=service] [cmd="..."]
#
# Examples:
#   make help                     # Show available targets
#   make init                     # First-time local setup (.env, build, start, JWT)
#   make up                       # Build and start development stack
#   make logs c=api               # Follow logs for the api service
#   make restart c=frontend       # Restart frontend service
#   make api-console cmd="c:c"    # Run Symfony console command in container
#   make prod-build               # Build production images (--no-cache)
#   make prod-up                  # Run production stack (--env-file=.env.prod.local)
#   make check                    # Run all quality checks (frontend + backend)
#
# Environment Configuration:
#   Development: Uses .env (defaults to compose.yaml + compose.override.yaml)
#   Production:  Uses .env.prod.local (compose.yaml + compose.prod.yaml)
# ==============================================================================

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# Environment files
ENV_FILE ?= .env
PROD_ENV_FILE ?= .env.prod.local

# Docker compose commands
# Development uses default compose.yaml and compose.override.yaml (with optional .env)
COMPOSE ?= docker compose $(if $(wildcard $(ENV_FILE)),--env-file=$(ENV_FILE),)
# Production uses compose.yaml and compose.prod.yaml with --env-file=.env.prod.local
COMPOSE_PROD ?= docker compose -f compose.yaml -f compose.prod.yaml --env-file=$(PROD_ENV_FILE)

# Service names
API_SERVICE ?= api
FRONTEND_SERVICE ?= frontend
DB_SERVICE ?= database

# Colors for terminal output
COLOR_RESET   := \033[0m
COLOR_CYAN    := \033[36m
COLOR_GREEN   := \033[32m
COLOR_YELLOW  := \033[33m
COLOR_BOLD    := \033[1m

.PHONY: help
help: ## Display this help screen
	@awk 'BEGIN {FS = ":.*##"; printf "\n$(COLOR_BOLD)ProjectCollab - Docker Compose Management$(COLOR_RESET)\n\nUsage:\n  make $(COLOR_CYAN)<target>$(COLOR_RESET) [c=service] [cmd=\"...\"]\n"} \
		/^[a-zA-Z0-9_-]+:.*?##/ { printf "  $(COLOR_CYAN)%-24s$(COLOR_RESET) %s\n", $$1, $$2 } \
		/^##@/ { printf "\n$(COLOR_BOLD)%s$(COLOR_RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup & Initialization

.PHONY: env
env: ## Create .env from .env.example if it does not exist
	@if [ ! -f $(ENV_FILE) ]; then \
		echo -e "$(COLOR_YELLOW)Creating $(ENV_FILE) from .env.example...$(COLOR_RESET)"; \
		cp .env.example $(ENV_FILE); \
		echo -e "$(COLOR_GREEN)$(ENV_FILE) created successfully.$(COLOR_RESET)"; \
	else \
		echo "$(ENV_FILE) already exists."; \
	fi

.PHONY: init
init: env ## Complete local setup: create .env, build/start dev containers, and generate JWT keys
	@echo -e "$(COLOR_YELLOW)Starting development environment...$(COLOR_RESET)"
	$(COMPOSE) up --build --wait
	@echo -e "$(COLOR_YELLOW)Generating JWT keypair...$(COLOR_RESET)"
	$(COMPOSE) exec $(API_SERVICE) php bin/console lexik:jwt:generate-keypair
	@echo -e "$(COLOR_GREEN)Initialization completed! Application is ready.$(COLOR_RESET)"

.PHONY: jwt-keys
jwt-keys: ## Generate Lexik JWT keypair in development api container
	$(COMPOSE) exec $(API_SERVICE) php bin/console lexik:jwt:generate-keypair

.PHONY: jwt-keys-prod
jwt-keys-prod: ## Generate Lexik JWT keypair in production api container
	$(COMPOSE_PROD) exec $(API_SERVICE) php bin/console lexik:jwt:generate-keypair

##@ Development

.PHONY: up dev-up
up: dev-up ## Build and start development containers (--build --wait)
dev-up:
	$(COMPOSE) up --build --wait

.PHONY: up-d dev-up-d
up-d: dev-up-d ## Start development containers in detached mode without rebuilding
dev-up-d:
	$(COMPOSE) up -d

.PHONY: build dev-build
build: dev-build ## Build development images
dev-build:
	$(COMPOSE) build

.PHONY: stop dev-stop
stop: dev-stop ## Stop development containers
dev-stop:
	$(COMPOSE) stop

.PHONY: start dev-start
start: dev-start ## Start stopped development containers
dev-start:
	$(COMPOSE) start

.PHONY: down dev-down
down: dev-down ## Stop and remove development containers and networks
dev-down:
	$(COMPOSE) down

.PHONY: restart dev-restart
restart: dev-restart ## Restart all or specific service (use c=service, e.g. make restart c=frontend)
dev-restart:
	$(COMPOSE) restart $(c)

.PHONY: logs dev-logs
logs: dev-logs ## Follow logs of all or specific service (use c=service, e.g. make logs c=api)
dev-logs:
	$(COMPOSE) logs -f $(c)

.PHONY: ps dev-ps
ps: dev-ps ## List running development containers
dev-ps:
	$(COMPOSE) ps

##@ Production (--env-file=.env.prod.local)

.PHONY: prod-build
prod-build: ## Build production images without cache using compose.prod.yaml
	$(COMPOSE_PROD) build --no-cache

.PHONY: prod-up
prod-up: ## Run production containers (--wait --no-build)
	$(COMPOSE_PROD) up --wait --no-build

.PHONY: prod-up-d
prod-up-d: ## Run production containers in detached mode (-d --wait --no-build)
	$(COMPOSE_PROD) up -d --wait --no-build

.PHONY: prod-stop
prod-stop: ## Stop production containers
	$(COMPOSE_PROD) stop

.PHONY: prod-down
prod-down: ## Stop and remove production containers and networks
	$(COMPOSE_PROD) down

.PHONY: prod-restart
prod-restart: ## Restart production containers (use c=service)
	$(COMPOSE_PROD) restart $(c)

.PHONY: prod-logs
prod-logs: ## Follow production container logs (use c=service)
	$(COMPOSE_PROD) logs -f $(c)

.PHONY: prod-ps
prod-ps: ## List running production containers
	$(COMPOSE_PROD) ps

.PHONY: prod-push
prod-push: ## Push production images to container registry
	$(COMPOSE_PROD) push

##@ Database & Migrations

.PHONY: db-migrate
db-migrate: ## Run pending Doctrine migrations
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:migrations:migrate --no-interaction

.PHONY: db-migration
db-migration: ## Generate a new Doctrine migration from entity changes
	$(COMPOSE) exec $(API_SERVICE) php bin/console make:migration

.PHONY: db-fixtures
db-fixtures: ## Load sample data/fixtures into database (development only)
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:fixtures:load --no-interaction

.PHONY: db-validate
db-validate: ## Validate Doctrine mapping and database schema
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:schema:validate

.PHONY: db-reset
db-reset: ## Drop, recreate database, run migrations, and load fixtures
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:database:drop --if-exists --force
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:database:create --if-not-exists
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:migrations:migrate --no-interaction
	$(COMPOSE) exec $(API_SERVICE) php bin/console doctrine:fixtures:load --no-interaction

##@ Backend (Symfony / API Platform)

.PHONY: api-sh
api-sh: ## Open a shell inside the running api container
	$(COMPOSE) exec $(API_SERVICE) bash

.PHONY: api-console
api-console: ## Run Symfony console command (use cmd="...", e.g. make api-console cmd="cache:clear")
	$(COMPOSE) exec $(API_SERVICE) php bin/console $(cmd)

.PHONY: api-cache-clear
api-cache-clear: ## Clear Symfony cache
	$(COMPOSE) exec $(API_SERVICE) php bin/console cache:clear

.PHONY: api-cs-fix
api-cs-fix: ## Format PHP code using PHP-CS-Fixer
	$(COMPOSE) exec $(API_SERVICE) vendor/bin/php-cs-fixer fix

.PHONY: api-cs-check
api-cs-check: ## Check PHP code style using PHP-CS-Fixer
	$(COMPOSE) exec $(API_SERVICE) vendor/bin/php-cs-fixer check

.PHONY: api-test
api-test: ## Run backend PHPUnit tests
	$(COMPOSE) exec $(API_SERVICE) bin/phpunit

##@ Frontend (Next.js)

.PHONY: frontend-sh
frontend-sh: ## Open a shell inside the running frontend container
	$(COMPOSE) exec $(FRONTEND_SERVICE) sh

.PHONY: frontend-dev-check
frontend-dev-check: ## Run all frontend checks (typecheck, lint fix, format, vitest)
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm dev-check

.PHONY: frontend-check-types
frontend-check-types: ## Check TypeScript types
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm check-types

.PHONY: frontend-lint
frontend-lint: ## Run ESLint checks
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm lint

.PHONY: frontend-lint-fix
frontend-lint-fix: ## Fix ESLint issues automatically
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm lint:fix

.PHONY: frontend-format
frontend-format: ## Format frontend code with Prettier
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm format

.PHONY: frontend-format-check
frontend-format-check: ## Check frontend code formatting with Prettier
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm format-check

.PHONY: frontend-test
frontend-test: ## Run frontend tests with Vitest
	$(COMPOSE) exec $(FRONTEND_SERVICE) pnpm test

##@ Quality & Testing

.PHONY: check
check: frontend-dev-check api-cs-check db-validate api-test ## Run all quality checks across frontend and backend

.PHONY: fix
fix: frontend-format frontend-lint-fix api-cs-fix ## Auto-format and fix code styles across frontend and backend

.PHONY: test
test: frontend-test api-test ## Run tests for both frontend and backend

##@ Maintenance & Cleanup

.PHONY: clean
clean: ## Stop and remove development containers and orphan networks
	$(COMPOSE) down --remove-orphans

.PHONY: clean-volumes
clean-volumes: ## Stop and remove development containers, orphan networks, and persistent volumes
	$(COMPOSE) down -v --remove-orphans
