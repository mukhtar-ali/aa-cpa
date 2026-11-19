# `_nest_next_starter`

A full-stack **TypeScript monorepo** (Turborepo + pnpm workspaces) for a bilingual (`en` / `ar`) real estate and enterprise CMS platform.

## Tech Stack & Architecture

| Workspace | Path | Port | Stack |
| :--- | :--- | :---: | :--- |
| **`@repo/web`** | `apps/web` | `3000` | Next.js 16 (App Router), React 19, Tailwind CSS v4, GSAP, `en`/`ar` i18n |
| **`@repo/api`** | `apps/api` | `3001` | NestJS 11, Prisma 6 (MySQL), JWT + httpOnly refresh cookies, Swagger, Pino |
| **`@repo/admin`** | `apps/admin` | `3002` | Vite 7, React 19, shadcn/ui, TanStack Router & Query, Zustand, CKEditor 5 |
| **`@repo/shared`** | `packages/shared` | — | Shared Zod schemas, TypeScript models, `PermissionEnum`, and API `endpoint` map |
| **`@repo/ui`** | `packages/ui` | — | Shared React hooks, API client wrapper, and cookie utilities for `apps/web` |
| **`@repo/eslint-config`** | `packages/eslint-config` | — | Shared ESLint 9 flat configurations |
| **`@repo/typescript-config`** | `packages/typescript-config` | — | Shared `tsconfig.json` bases |

## Repository Layout

```text
_nest_next_starter/
├── apps/
│   ├── api/                 # NestJS 11 REST API + Prisma ORM (MySQL)
│   ├── admin/               # Vite + React 19 + shadcn/ui Admin Portal
│   └── web/                 # Next.js 16 App Router Public Storefront
├── packages/
│   ├── shared/              # @repo/shared — Zod schemas, models, enums, endpoints
│   ├── ui/                  # @repo/ui — shared web hooks & utilities
│   ├── eslint-config/       # @repo/eslint-config
│   └── typescript-config/   # @repo/typescript-config
├── docs/
│   ├── STATUS.md            # Current implementation status, open items, and decisions
│   ├── redis-bullmq-plan.md # Planned Redis + BullMQ queue & caching architecture
│   └── archive/             # Historical implementation plans and QA audit reports
├── e2e/                     # Playwright end-to-end test suite
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- **Node.js**: `>= 22` (see `.nvmrc` — `22.20.0`)
- **Package Manager**: `pnpm@9`
- **Database**: MySQL 8+

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` in each application and update values for your environment:
   - `apps/api/.env.example` → `apps/api/.env` (`DATABASE_URL`, `JWT_SECRET`, `SUPER_ADMIN_PASSWORD`, SMTP & S3 settings)
   - `apps/admin/.env.example` → `apps/admin/.env` (`VITE_API_URL=http://localhost:3001`)
   - `apps/web/.env.example` → `apps/web/.env` (`BASE_URL=http://localhost:3001`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`)

3. **Run database migrations and seed initial data:**
   ```bash
   pnpm --filter @repo/api db:migrate
   pnpm --filter @repo/api seed
   ```

4. **Start all applications in development mode:**
   ```bash
   pnpm dev
   ```
   - **Public Web**: `http://localhost:3000`
   - **API**: `http://localhost:3001` (Swagger docs at `http://localhost:3001/api/swagger` in development; disabled in production unless `SWAGGER_ENABLED=true`)
   - **Admin Portal**: `http://localhost:3002`

## Scripts

### Root (`package.json`)
| Command | Description |
| :--- | :--- |
| `pnpm dev` | Run all packages and apps in development mode via Turborepo |
| `pnpm start` | Build, then run the production builds of the API (3001), web (3000) and admin (3002) together |
| `pnpm build` | Build all packages and apps (`@repo/shared` and `@repo/ui` build first) |
| `pnpm lint` | Run ESLint across all workspaces |
| `pnpm check-types` | Run TypeScript typechecking across workspaces |
| `pnpm format` | Format `*.{ts,tsx,md}` files with Prettier |

### API (`@repo/api`)
| Command | Description |
| :--- | :--- |
| `pnpm --filter @repo/api db:generate` | Generate the Prisma client |
| `pnpm --filter @repo/api db:migrate` | Run Prisma migrations in development (`prisma migrate dev`) |
| `pnpm --filter @repo/api db:deploy` | Apply pending Prisma migrations in production (`prisma migrate deploy`) |
| `pnpm --filter @repo/api db:push` | Push Prisma schema state directly to the database |
| `pnpm --filter @repo/api db:studio` | Open Prisma Studio |
| `pnpm --filter @repo/api seed` | Seed the initial super-admin user and default CMS sections |
| `pnpm --filter @repo/api seed -- --content` | Seed super-admin, default sections, and full CPA content (services, sectors, articles, jobs, reference, pages, estimator) |
| `pnpm --filter @repo/api test` | Run API unit tests with Jest |
| `pnpm --filter @repo/api test:e2e` | Run API e2e tests with Jest |

## Documentation

- **[Project Status (`docs/STATUS.md`)](./docs/STATUS.md)** — Current implementation status, verified feature inventory, open items, and architectural decisions.
- **[Redis & BullMQ Plan (`docs/redis-bullmq-plan.md`)](./docs/redis-bullmq-plan.md)** — Design plan for background job queues, email retries, and Redis caching.
- **[Archived Reports (`docs/archive/`)](./docs/archive/)** — Historical implementation plans, gap audits, and QA test reports.
