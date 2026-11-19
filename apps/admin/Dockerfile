# syntax=docker/dockerfile:1
# Build context MUST be the repository root:
#   docker build -f apps/admin/Dockerfile --build-arg VITE_API_URL=http://localhost:3001 -t starter-admin .

FROM node:22-bookworm-slim AS deps
ENV COREPACK_HOME="/usr/local/share/corepack"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

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
# Stage 2: build — build @repo/shared and Vite SPA with baked VITE_API_URL
# ---------------------------------------------------------------------------
FROM deps AS build

COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/shared ./packages/shared
COPY apps/admin ./apps/admin

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter @repo/shared build \
    && pnpm --filter @repo/admin build

# ---------------------------------------------------------------------------
# Stage 3: runtime — static file serving with nginx:1.27-alpine
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
