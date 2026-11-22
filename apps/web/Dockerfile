# syntax=docker/dockerfile:1
# Build context MUST be the repository root:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 \
#     --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
#     --build-arg NEXT_PUBLIC_FB_PIXEL_ID="" \
#     --build-arg BASE_URL=http://localhost:3001 \
#     -t starter-web .

FROM node:22-bookworm-slim AS base
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
# Stage 2: build — build @repo/shared, @repo/ui, and Next.js application
# ---------------------------------------------------------------------------
FROM deps AS build

COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web
# apps/web/public is empty (not tracked by git) until brand assets land (MUK-453);
# make sure it exists so the runtime stage's COPY works on a clean clone.
RUN mkdir -p /app/apps/web/public

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_FB_PIXEL_ID=""
ARG BASE_URL=http://localhost:3001

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_FB_PIXEL_ID=${NEXT_PUBLIC_FB_PIXEL_ID}
ENV BASE_URL=${BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @repo/shared build \
    && pnpm --filter @repo/ui build \
    && pnpm --filter @repo/web build

# ---------------------------------------------------------------------------
# Stage 3: runtime — Next.js production server running as non-root user
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --from=build --chown=node:node /app/package.json /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
# pnpm keeps the workspace links (@repo/shared, @repo/ui) in each package's OWN node_modules, not in the root
# one. Without these the image starts with "Cannot find module '@repo/shared'".
COPY --from=build --chown=node:node /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build --chown=node:node /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build --chown=node:node /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/ui/package.json ./packages/ui/package.json
COPY --from=build --chown=node:node /app/packages/ui/dist ./packages/ui/dist
COPY --from=build --chown=node:node /app/apps/web/package.json ./apps/web/package.json
COPY --from=build --chown=node:node /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=build --chown=node:node /app/apps/web/dictionaries ./apps/web/dictionaries
COPY --from=build --chown=node:node /app/apps/web/.next ./apps/web/.next

WORKDIR /app/apps/web
USER node

EXPOSE 3000

CMD ["next", "start", "-p", "3000"]
