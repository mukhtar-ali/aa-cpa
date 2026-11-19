# syntax=docker/dockerfile:1
# Build context MUST be the repository root:
#   docker build -f apps/api/Dockerfile -t starter-api .

FROM node:22-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
ENV COREPACK_HOME="/usr/local/share/corepack"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# ---------------------------------------------------------------------------
# Stage 1: deps — install workspace dependencies with layer caching
# ---------------------------------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .nvmrc turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: build — build @repo/shared, generate Prisma client, and build API
# ---------------------------------------------------------------------------
FROM deps AS build

COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @repo/shared build \
    && pnpm --filter @repo/api build

# ---------------------------------------------------------------------------
# Stage 3: runtime — minimal Debian/glibc image running as non-root user
# ---------------------------------------------------------------------------
FROM base AS runtime

ENV NODE_ENV=production
ENV APP_PORT=3001
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --from=build --chown=node:node /app/package.json /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
# pnpm keeps the workspace links (@repo/shared, @repo/ui) in each package's OWN node_modules, not in the root
# one. Without these the image starts with "Cannot find module '@repo/shared'".
COPY --from=build --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:node /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build --chown=node:node /app/packages/typescript-config ./packages/typescript-config
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=node:node /app/apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/prisma ./apps/api/prisma
# `pnpm seed` (docker compose run --rm api pnpm seed) runs prisma/seed.ts through ts-node, and the seed imports helpers
# from src/ (e.g. the placeholder-password check); without the sources it dies with TS2307 "Cannot find module".
COPY --from=build --chown=node:node /app/apps/api/src ./apps/api/src
COPY --from=build --chown=node:node /app/apps/api/public ./apps/api/public
COPY --from=build --chown=node:node /app/apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

RUN sed -i 's/\r$//' /app/apps/api/docker-entrypoint.sh \
    && chmod +x /app/apps/api/docker-entrypoint.sh

# Local-disk uploads (STORAGE_DRIVER=local, the default without S3 credentials) are written here; mount a volume on it.
RUN mkdir -p /app/apps/api/storage && chown node:node /app/apps/api/storage

WORKDIR /app/apps/api
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:3001/api/health >/dev/null || exit 1

ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
CMD ["node", "dist/main"]
