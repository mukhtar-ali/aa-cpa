# `_nest_next_starter`

A production-ready **TypeScript monorepo starter** that combines the best parts of two
existing in-house projects:

| Concern        | Source project              | Stack chosen for this starter                          |
| -------------- | --------------------------- | ------------------------------------------------------ |
| Monorepo       | `ramy-morshedy`             | **Turborepo + pnpm workspaces**                        |
| Backend (API)  | `ramy-morshedy`             | **NestJS 11** (kept) — **Prisma** instead of TypeORM   |
| Admin panel    | `_express_nextjs_starter`   | **Vite + React 19 + shadcn/ui + TanStack Router/Query**|
| Public website | `ramy-morshedy`             | **Next.js 16 (App Router)**                            |
| Shared code    | `ramy-morshedy`             | **`@repo/shared`** (Zod schemas, models, enums, utils) |

> **Note on naming:** the request said "prismic instead of typeorm". In context this means
> **Prisma** (the ORM) — `_express_nextjs_starter` already uses Prisma (`PRISMA_SETUP.md`,
> `@prisma/client`). This is **not** the Prismic headless CMS. The whole point of this
> starter is: keep NestJS, drop TypeORM, adopt Prisma.

## What you are building

```
_nest_next_starter/
├── apps/
│   ├── api/      # NestJS 11 + Prisma (MySQL). Replaces ramy's TypeORM API.
│   ├── admin/    # Vite + shadcn/ui + TanStack. Ported from _express_nextjs_starter/admin.
│   └── web/      # Next.js 16 App Router public site. Ported from ramy apps/web.
├── packages/
│   ├── shared/            # @repo/shared — Zod schemas, models, enums, endpoints, utils
│   ├── ui/               # @repo/ui — (optional) shared React primitives
│   ├── eslint-config/    # @repo/eslint-config
│   └── typescript-config/# @repo/typescript-config
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .npmrc
└── .nvmrc
```

## Quick start (after implementation)

```bash
pnpm install
# configure apps/api/.env (DATABASE_URL etc.)
pnpm --filter @repo/api prisma:migrate
pnpm --filter @repo/api prisma:seed
pnpm dev        # turbo runs api (3001) + admin (3002) + web (3000)
```

## The plan

The full, step-by-step implementation plan an agent should follow lives in
**[`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)**. Read it top to bottom; it is
written so another model can implement the whole repo without seeing the source projects.
