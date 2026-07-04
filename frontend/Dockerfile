#syntax=docker/dockerfile:1


# Versions
FROM node:lts-alpine AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

WORKDIR /app

# Install dependencies as root
USER root

RUN npm install -g corepack@latest && \
    corepack enable && \
	corepack prepare --activate pnpm@10.25.0 && \
	pnpm config -g set store-dir /.pnpm-store

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Delete the following line in case you want to enable telemetry during dev and build.
ENV NEXT_TELEMETRY_DISABLED 1
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT 0

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_ROUTE_PREFIX
ARG NEXT_PUBLIC_MERCURE_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_ROUTE_PREFIX=${NEXT_PUBLIC_API_ROUTE_PREFIX}
ENV NEXT_PUBLIC_MERCURE_URL=${NEXT_PUBLIC_MERCURE_URL}

# Set up a non-root user
RUN deluser node && \
	addgroup -g 1000 -S next && \
	adduser -u 1000 -S next -G next

# Development image
FROM base as dev

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME localhost

# Install dev tools
RUN apk add --no-cache zsh vim git curl wget bash shadow && \
		sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended && \
		chsh -s /bin/zsh next

# Install Oh My Zsh for the next user
USER next
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
USER root

# Set the correct permission for prerender cache
RUN mkdir -p .next && \
	chown -R next:next .next

COPY --link --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint
ENTRYPOINT ["docker-entrypoint"]

CMD ["su", "next", "-c", "pnpm install && pnpm dev"]


FROM base AS builder

COPY --link pnpm-lock.yaml ./
RUN pnpm fetch

COPY --link . .

RUN	pnpm install --frozen-lockfile --offline && \
	pnpm run build


# Production image, copy all the files and run next
FROM node_upstream AS prod

WORKDIR /app

ENV NODE_ENV production
# Delete the following line in case you want to enable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder --link /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next; \
	chown next:next .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --link --chown=1234:1234 /app/.next/standalone ./
COPY --from=builder --link --chown=1234:1234 /app/.next/static ./.next/static

USER next

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
