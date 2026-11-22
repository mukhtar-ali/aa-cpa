# Implementation Plan — `_nest_next_starter`

**Audience:** an AI coding agent (or developer) implementing this repo from scratch.
**Goal:** a Turborepo + pnpm monorepo with a **NestJS + Prisma** API, a **Vite + shadcn/ui**
admin, and a **Next.js** public web app, sharing a `@repo/shared` Zod/types package.

This plan is derived from two reference repos (do not modify them):

- `../ramy-morshedy` — the source of the **monorepo layout, NestJS API architecture, shared
  package, and Next.js web app**. Its API uses **TypeORM**, which we replace with Prisma.
- `../_express_nextjs_starter` — the source of the **Vite + shadcn/ui admin** (`admin/`) and
  the **Prisma** patterns (`backend/prisma`).

When this plan says "port from X", read the corresponding files in that repo and adapt them.

---

## 0. Guiding principles & decisions

1. **NestJS stays.** Only the persistence layer changes: `@nestjs/typeorm` + `typeorm` →
   `@nestjs/...` (none) + `prisma` + `@prisma/client` via a hand-written `PrismaModule`.
2. **Single source of truth for contracts** = `@repo/shared` (Zod schemas + inferred types +
   `endpoint` map + enums). Consumed by API, admin, and web. **Do not duplicate types.**
3. **Admin is a Vite SPA**, not Next.js. It is `apps/admin` and uses TanStack Router (file
   based), TanStack Query, axios, zustand, shadcn/ui (new-york style), Tailwind v4.
4. **Web is Next.js 16 App Router** with `[lang]` i18n segment (port ramy's web).
5. **Database = MySQL** (matches both reference repos). Prisma `provider = "mysql"`.
6. **Package manager = pnpm 9**, **Node 22** (`.nvmrc` = `22.20.0`), **Turborepo 2**.
7. **Internal package names** use the `@repo/*` scope (ramy convention).
8. Keep IDs and the base-entity shape consistent: every model gets `id`, `createdAt`,
   `updatedAt`, `deletedAt`, `isDeleted` (soft delete). Ramy used `uuid` PKs via
   `CustomBaseEntity`; **use `String @id @default(uuid())`** in Prisma to preserve that.

---

## 1. Repository root scaffolding

Create these files at `_nest_next_starter/`.

### 1.1 `package.json`
```json
{
  "name": "nest-next-starter",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --concurrency=25",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "prettier": "^3.7.4",
    "turbo": "^2.8.3",
    "typescript": "^5"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=22" }
}
```

### 1.2 `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 1.3 `turbo.json` (port ramy's, add `db:generate` so Prisma client builds first)
```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "stream",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": { "dependsOn": ["^lint"], "env": ["BASE_URL"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "db:generate": { "cache": false },
    "dev": { "dependsOn": ["^build"], "cache": false, "persistent": true }
  }
}
```

### 1.4 `.npmrc` (copy ramy's — required for NestJS + Prisma binaries to resolve)
```
node-linker=hoisted
shamefully-hoist=true
package-import-method=copy
```

### 1.5 `.nvmrc`
```
22.20.0
```

### 1.6 Other root files
- `.gitignore` — port ramy's, add: `**/generated/prisma`, `**/.next`, `**/dist`, `**/.turbo`,
  `node_modules`, `.env`, `.env.*` (keep `.env.example`).
- `.prettierrc.mjs` and `.eslintrc.mjs` / flat config — port from ramy root.
- `README.md` — already written (see sibling file).

---

## 2. `packages/typescript-config`

Port verbatim from `ramy-morshedy/packages/typescript-config`. Files:

- `package.json` → `{ "name": "@repo/typescript-config", "version": "0.0.0", "private": true }`
- `base.json` — strict base config.
- `nestjs.json` — extends base; `module: commonjs`, `moduleResolution: Node10`,
  `experimentalDecorators`, `emitDecoratorMetadata`, `strictNullChecks: false`.
- `nextjs.json` — for the web app.
- `react-library.json` — for `@repo/ui`.

> The admin app uses its **own** `tsconfig.app.json` (Vite/bundler mode) rather than this
> package; that's fine — keep parity with `_express_nextjs_starter/admin/tsconfig.app.json`.

---

## 3. `packages/eslint-config`

Port from `ramy-morshedy/packages/eslint-config`. Files: `base.js`, `library.js`, `nest.js`,
`next.js`, `react-internal.js`, `prettier-base.js`, `package.json`
(`name: @repo/eslint-config`). Add a `react-vite.js` (clone `react-internal.js` and include
`eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`) for the admin, OR keep the
admin's standalone `eslint.config.js` from the express starter. Simpler: **keep the admin's
own eslint config** (it is self-contained) and only wire the API/web/packages to
`@repo/eslint-config`.

---

## 4. `packages/shared` — `@repo/shared` (the contract layer)

This is the backbone. Port the **entire** `ramy-morshedy/packages/shared` package. It builds
to `dist/` via `tsc -b` and is consumed by all apps.

### 4.1 `package.json`
Copy ramy's `packages/shared/package.json` exactly (name `@repo/shared`, `main`/`types`
point at `dist`, `build: "tsc -b"`, `dev: "pnpm build --watch"`). Keep peer deps: `dayjs`,
`js-cookie`, `uuid`, `zod`, `lodash`.

### 4.2 Source layout (port all of these)
```
src/
├── index.ts                  # re-exports enums, models, utils, validations
├── enums/
│   ├── index.ts
│   ├── common.enum.ts
│   ├── language.enum.ts      # LanguageEnum { En, Ar } — drives translations
│   └── premissions.enum.ts   # PermissionEnum (keep spelling to match ramy)
├── models/                   # TS types/interfaces (inferred or hand-written)
│   ├── index.ts  about.model.ts  admin.model.ts  auth.model.ts  common.model.ts
│   ├── contact.model.ts  file.model.ts  home.model.ts  inquiry.model.ts
│   ├── lookup.model.ts  media.model.ts  pagination.model.ts  project.model.ts
│   ├── rank.model.ts  seo.model.ts  units.model.ts  user.model.ts ...
├── utils/
│   ├── index.ts  boolean.ts  date.ts  string.ts  language.ts  localized.type.ts
│   ├── endpoint.ts           # THE API route map — single source for all apps
│   └── seo_page_key_utils.ts  tagManager.ts
└── validations/              # Zod v4 schemas (z from 'zod/v4')
    ├── index.ts  base.schema.ts  common.schema.ts  pagination.schema.ts
    ├── auth.schema.ts  admin.schema.ts  project.schema.ts  units.schema.ts
    ├── file.schema.ts  home.schema.ts  seo.schema.ts  contact.schema.ts
    ├── inquiry.schema.ts  location.schema.ts  media.schema.ts ...
```

### 4.3 Key shared concepts to preserve
- **`endpoint`** object in `utils/endpoint.ts`: nested map of every API path
  (`endpoint.auth.login`, `endpoint.project.list`, ...). NestJS controllers use these strings
  in `@Get(endpoint.project.list)`; admin/web use them in fetch/axios calls. **Both ends import
  the same constant.**
- **Multi-language fields**: `MultiLanguageFieldSchema` = `{ en: string, ar: string }`;
  helpers `getLangValue(field, lang)` and `getDefaultMultiLanguageField()`. The translation
  pattern (one base row + N translation rows keyed by `LanguageEnum`) is central — see §6.4.
- **Zod ↔ DTO bridge**: schemas drive both runtime validation (NestJS pipe) and form
  validation (admin react-hook-form `zodResolver`). `*FormSchema`, `*QuerySchema`, inferred
  `*FormModel`, `*QueryModel`.
- **`PermissionEnum`** powers route guards (API) and menu/route gating (admin).

> **Action:** copy the files; only change is that nothing here references TypeORM (it never
> did — shared is ORM-agnostic). Verify `pnpm --filter @repo/shared build` produces `dist/`.

---

## 5. `packages/ui` — `@repo/ui` (optional, keep minimal)

Port `ramy-morshedy/packages/ui` (a thin React component library consumed by the **web** app).
The admin does **not** use `@repo/ui` (it has its own shadcn `components/ui`). Keep `@repo/ui`
small or stub it (`src/index.tsx` exporting a couple of primitives) — it must at least build so
turbo's `^build` graph is satisfied for the web app.

---

## 6. `apps/api` — NestJS 11 + **Prisma** (the core change)

Port the architecture of `ramy-morshedy/apps/api` **wholesale**, then swap the persistence
layer from TypeORM to Prisma. Below, "PORT" = copy/adapt unchanged; "CHANGE" = the Prisma swap.

### 6.1 `package.json` (CHANGE deps)
Start from ramy's `apps/api/package.json` and apply:

**Remove:** `typeorm`, `@nestjs/typeorm`, the `typeorm`/`add-migration`/`migration`/
`revert-migration` scripts, `mysql2` (Prisma bundles its driver; keep only if a raw script
needs it).

**Add deps:** `@prisma/client@^6`, and the mariadb/mysql driver adapter if you mirror the
express starter (`@prisma/adapter-mariadb@^6`) — otherwise plain `mysql` provider needs no
adapter.

**Add devDeps:** `prisma@^6`.

**Scripts (replace the typeorm block):**
```json
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:deploy": "prisma migrate deploy",
"db:studio": "prisma studio",
"db:push": "prisma db push",
"prisma:seed": "ts-node -P tsconfig.json -r tsconfig-paths/register prisma/seed.ts",
"seed": "pnpm prisma:seed"
```
Keep: `build: "nest build"`, `dev: "nest start --watch"`, `start:prod: "node dist/main"`,
`lint`, `test*`. Keep deps: `@nestjs/*`, `@nestjs/jwt`, `@nestjs/swagger`,
`@nestjs/throttler`, `nestjs-i18n`, `nestjs-zod`, `bcrypt`, `handlebars`, `nodemailer`,
`sharp`, `@aws-sdk/client-s3`, `zod`, `@repo/shared`, `reflect-metadata`, `rxjs`.

> Add `"prisma": { "seed": "ts-node ... prisma/seed.ts" }` OR a `prisma.config.ts` (see 6.3).

### 6.2 `nest-cli.json`, `tsconfig.json` (PORT, minor change)
- `tsconfig.json`: port ramy's (`extends @repo/typescript-config/nestjs.json`, `paths: {"@/*":
  ["./src/*"]}`, `outDir: ./dist`).
- `nest-cli.json`: port ramy's. Keep the i18n asset copy:
  `"assets": [{ "include": "i18n/**/*", "watchAssets": true }]`. Prisma's generated client
  lives in `prisma/generated` or `node_modules/@prisma/client` and does **not** need to be a
  Nest asset.

### 6.3 Prisma setup (NEW — replaces `src/database/data-source.ts` + TypeORM entities)

Create `apps/api/prisma/`:

**`apps/api/prisma/schema.prisma`** — model the same domain ramy modeled with entities. Use
`_express_nextjs_starter/backend/prisma/schema.prisma` as the **style reference** (generator
block, enums, `@@map`, `@db.VarChar`, indexes). Skeleton:

```prisma
generator client {
  provider = "prisma-client-js"
  // To mirror the express starter you may use the new generator + custom output:
  // provider = "prisma-client"
  // output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ---- enums (mirror @repo/shared enums where they map to columns) ----
enum Language { EN AR }

// ---- base fields are repeated per model (Prisma has no inheritance) ----
// id String @id @default(uuid()); createdAt; updatedAt; deletedAt; isDeleted

model User {
  id          String    @id @default(uuid())
  email       String    @unique
  name        String?
  password    String
  // permissions stored as Json or a join table — mirror ramy's users module
  permissions Json?
  isDeleted   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  @@map("users")
}

model Project {
  id           String               @id @default(uuid())
  slug         String?              @unique
  heroMedia    Json?
  thumbnail    String?
  isPublished  Boolean              @default(false)
  isFeatured   Boolean              @default(false)
  rank         Int                  @default(0)
  location     String?
  units        Unit[]
  translations ProjectTranslation[]
  isDeleted    Boolean              @default(false)
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
  deletedAt    DateTime?
  @@map("projects")
}

model ProjectTranslation {
  id          String   @id @default(uuid())
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String
  language    Language
  title       String
  subtitle    String
  location    String
  description String   @db.Text
  amenities   Json?    // [{ icon, title, description }]
  tags        Json?    // string[]
  @@unique([projectId, language])
  @@map("project_translations")
}

model Unit {
  id        String   @id @default(uuid())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId String
  // ...mirror ramy unites/entities/unit.entity.ts columns...
  @@map("units")
}

// Repeat for: Section, Seo, Inquiry, plus translation tables, mirroring
// ramy's src/{section,seo,inquiry,unites}/entities/*.entity.ts
```

> **Mapping rule (TypeORM → Prisma):** for every `*.entity.ts` in ramy's API, create a Prisma
> `model`. `@PrimaryGeneratedColumn('uuid')` → `String @id @default(uuid())`.
> `@Column({type:'json'})` → `Json`. `@Column({type:'enum'})` → a Prisma `enum`.
> `@CreateDateColumn` → `DateTime @default(now())`. `@UpdateDateColumn` → `DateTime @updatedAt`.
> `@DeleteDateColumn` + `isDeleted` → `deletedAt DateTime?` + `isDeleted Boolean @default(false)`.
> `@ManyToOne/@OneToMany` → Prisma relations with `@relation`. `@@map` to keep snake_case table
> names from ramy.

**`apps/api/prisma.config.ts`** (mirror express starter) — optional but recommended:
```ts
import { defineConfig } from 'prisma/config';
import 'dotenv/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'ts-node prisma/seed.ts' },
});
```

**`apps/api/prisma/seed.ts`** — port the logic of ramy's `src/database/seed.ts` but use the
Prisma client (`prisma.user.create(...)`, hash passwords with bcrypt, create default
permissions/admin user, default sections/SEO rows).

### 6.4 `src/prisma/prisma.module.ts` + `prisma.service.ts` (NEW — replaces TypeOrmModule)

```ts
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // or '../generated/prisma' if custom output

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```
```ts
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```
Mark it `@Global()` so feature modules don't each import it (TypeORM used
`TypeOrmModule.forFeature(...)` per module — Prisma needs none of that).

### 6.5 `src/app.module.ts` (CHANGE)
Port ramy's, but:
- **Remove** the `TypeOrmModule.forRoot({...})` import/registration.
- **Add** `PrismaModule` to `imports`.
- Keep `I18nModule.forRoot(...)`, `ThrottlerModule.forRoot(...)`, all feature modules
  (`AuthModule, EmailModule, ResourceModule, UsersModule, SectionModule, ProjectModule,
  UnitesModule, InquiryModule, SeoModule`), the global `HttpExceptionFilter`, and the
  `LangMiddleware` wiring.

### 6.6 `src/main.ts` (CHANGE)
Port ramy's bootstrap (static assets, CORS, Swagger via `@nestjs/swagger` + `nestjs-zod`'s
`cleanupOpenApiDoc`, `app.listen(port,'0.0.0.0')`). **Remove** the TypeORM
`AppDataSource.initialize()/runMigrations()` block — Prisma migrations run via CLI
(`prisma migrate deploy`) at deploy time, not in `main.ts`. (If you want auto-migrate on boot,
call `execSync('prisma migrate deploy')` guarded by env, but prefer the CLI step.)

### 6.7 Feature modules — port + convert each (CHANGE the data access only)
For every module under `ramy-morshedy/apps/api/src/` (`auth`, `users`, `project`, `unites`,
`section`, `seo`, `inquiry`, `email`, `resource`, `common`, `config`, `i18n`):

- **PORT unchanged:** controllers, decorators (`@Public`, `@ProtectedWithPermissions`),
  guards (`auth.guard.ts`, `permissions.guard.ts`), pipes (`CustomZodValidationPipe`),
  interceptors (`LocaleInterceptor`), the i18n helper/middleware, the Zod-DTO swagger bridge
  (`getZodDto`), exception filter, `config/custom-env.ts`, `email` (handlebars + nodemailer),
  `resource` (S3 upload + sharp). These have **no ORM coupling**.
- **CHANGE the service layer:** ramy uses the *one-service-per-action* pattern
  (`CreateProjectService`, `UpdateProjectService`, `GetAllProjectsService`, ...). Keep that
  pattern, but replace `@InjectRepository(Entity) repo: Repository<Entity>` with
  `constructor(private prisma: PrismaService)` and rewrite the body:

  | TypeORM (ramy)                                   | Prisma (new)                                              |
  | ------------------------------------------------ | --------------------------------------------------------- |
  | `this.repo.count()`                              | `this.prisma.project.count()`                             |
  | `this.repo.findOne({ where: { slug } })`         | `this.prisma.project.findUnique({ where: { slug } })`     |
  | `this.repo.find({ where, relations, skip, take })`| `this.prisma.project.findMany({ where, include, skip, take })` |
  | `new Entity(); entity.x = ...; this.repo.save()` | `this.prisma.project.create({ data: { ..., translations: { create: [...] } } })` |
  | `this.repo.save(existing)` (update)              | `this.prisma.project.update({ where:{id}, data:{ ... } })`|
  | `this.repo.softDelete(id)`                       | `this.prisma.project.update({ where:{id}, data:{ isDeleted:true, deletedAt:new Date() } })` |
  | cascade `translations` via entity `cascade:true` | nested writes `translations: { deleteMany:{}, create:[...] }` |
  | query builder for pagination                     | `findMany` + `count` (or `$transaction([...])`)           |

  The **module file** (`*.module.ts`) loses `TypeOrmModule.forFeature([...])` from `imports`
  (PrismaModule is global). Providers/controllers/exports arrays stay the same.

- **Mappers/helpers** (`helpers/*.mapper.ts`): port; adjust types so they map from the Prisma
  model shape (which now includes `translations` as a related array via `include`) to the
  `@repo/shared` `*Model`. Use the shared `getLangValue` for picking the active translation.

### 6.8 `src/config/custom-env.ts` (CHANGE env names)
Port ramy's env loader. Replace the discrete DB vars (`DB_HOST/PORT/USER/PASSWORD/DATABASE`)
with a single **`DATABASE_URL`** (Prisma's convention:
`mysql://user:pass@host:3306/dbname`). Keep `JWT_SECRET`, `APP_PORT`, mail vars, S3 vars.

### 6.9 `apps/api/.env.example`
```
APP_PORT=3001
DATABASE_URL="mysql://root:password@localhost:3306/nest_next_starter"
JWT_SECRET="change-me"
# mail
SMTP_HOST=  SMTP_PORT=  SMTP_USER=  SMTP_PASS=  MAIL_FROM=
# s3 (resource module)
AWS_REGION=  AWS_ACCESS_KEY_ID=  AWS_SECRET_ACCESS_KEY=  S3_BUCKET=
```

### 6.10 API acceptance checks
- `pnpm --filter @repo/api db:generate` generates the client.
- `pnpm --filter @repo/api db:migrate` creates tables.
- `pnpm --filter @repo/api seed` inserts the default admin + lookups.
- `pnpm --filter @repo/api dev` boots on `:3001`; `GET /api/swagger` renders; a public route
  (e.g. `endpoint.project.listWeb`) returns `[]`; login works and a protected route enforces
  permissions.

---

## 7. `apps/admin` — Vite + shadcn/ui + TanStack (port from express starter)

Port `_express_nextjs_starter/admin` into `apps/admin`, then integrate it into the monorepo.

### 7.1 Copy the app
Copy the whole `admin/` tree: `src/`, `index.html`, `vite.config.ts`, `components.json`
(shadcn new-york, baseColor slate, `@/` aliases), `tsconfig*.json`, `eslint.config.js`,
`public/`, `vitest.setup.ts`. **Do not** copy `dist/`, `node_modules/`, `build_errors*.txt`,
`*.log`, `.pnpm-store/`, the stray `fix_editor.js`/`test-*.mjs` debug files.

### 7.2 `apps/admin/package.json` (CHANGE name + add shared)
- `"name": "@repo/admin"` (was `admin`).
- Add `"@repo/shared": "workspace:*"` to dependencies.
- Keep all existing deps (TanStack Router/Query/Table, shadcn/radix set, axios, zustand,
  react-hook-form, zod, tailwind v4, ckeditor, sonner, recharts, lucide).
- Keep scripts (`dev: "vite"`, `build: "tsc -b && vite build"`, `lint`, `preview`, `test`).
  Turbo will call `dev`/`build`/`lint`.
- **Port number:** keep `3002` (set in `vite.config.ts` `server.port`). The Next web is `3000`,
  API `3001`, admin `3002`.

### 7.3 Wire to `@repo/shared`
- In `tsconfig.app.json`, the `@/*` alias already maps to `./src/*`. Add nothing for
  `@repo/shared` — it resolves via node_modules workspace symlink. Ensure Vite can resolve it:
  it's an ESM build (`dist/index.js`), which Vite handles. If you hit CJS interop issues, add
  `@repo/shared` to `optimizeDeps.include` in `vite.config.ts`.
- Replace the admin's local type/endpoint duplicates with shared imports where they overlap:
  `src/lib/*-api.ts` should import `endpoint` and `*FormSchema`/`*Model` from `@repo/shared`
  instead of redefining them. This is the main integration task — align the admin's API client
  modules (`auth-api.ts`, `projects-api.ts`, `users-api.ts`, `site-settings-api.ts`, etc.) to
  the NestJS routes exposed via `endpoint`.

### 7.4 API base URL & auth
- The admin uses axios with retry/refresh/CSRF logic in `src/lib/api.ts` and a zustand
  `auth-store`. Point it at the Nest API via `VITE_API_URL` (`apps/admin/.env.example`:
  `VITE_API_URL=http://localhost:3001`).
- **CSRF note:** the express backend issued CSRF tokens (`/api/csrf-token`). NestJS (ramy)
  uses **JWT bearer**, not CSRF cookies. **Decision:** strip the CSRF code path from
  `src/lib/api.ts` (the `getCsrfToken`/`invalidateCsrfToken`/`X-CSRF-Token` logic) and keep
  pure bearer-token auth to match the Nest API. Keep the token-refresh + exponential-backoff
  logic. (Alternatively add a CSRF guard to Nest — but bearer-only is simpler; prefer it.)
- Align auth endpoints to `endpoint.auth.*` (`login`, `me`, `changePassword`,
  `forgetPassword`, `resetPassword`). The Nest `AuthController` returns a JWT; store it in the
  zustand store + cookie exactly as the express admin did.

### 7.5 Vite dev proxy
The express admin proxied `/uploads`. For Nest, the resource module serves static files from
`/public` (see ramy `main.ts useStaticAssets`). Update the `vite.config.ts` proxy target to
`VITE_API_URL` and proxy whatever static path the Nest resource module uses (e.g. `/uploads`
or `/public`). Keep `changeOrigin: true`.

### 7.6 Features to keep / trim
The express admin ships many demo features (`tasks`, `chats`, `apps`, `users`, `errors`,
`monitoring`, plus domain ones `projects`, `news`, `about`, `contact`, `home`,
`site-settings`, `settings`). For a **starter**, keep: `auth`, `dashboard`, `users`,
`projects` (as the canonical CRUD example), `settings`/`site-settings`, `errors`. Remove the
pure-demo `chats`/`apps`/`tasks` unless you want them as examples. Update
`src/routes/` (TanStack file-based routes) and the sidebar nav data
(`src/components/layout/data`) accordingly. Gate routes/menu items by `PermissionEnum` from
`@repo/shared`.

### 7.7 Admin acceptance checks
- `pnpm --filter @repo/admin dev` serves `:3002`; routeTree regenerates.
- Login against the running Nest API succeeds; token stored; protected routes load.
- The Projects feature performs full CRUD against the Nest API using shared schemas.
- `pnpm --filter @repo/admin build` (tsc + vite) passes with no type errors.

---

## 8. `apps/web` — Next.js 16 App Router (port from ramy)

Port `ramy-morshedy/apps/web` into `apps/web` mostly verbatim (it has no ORM coupling — it
talks to the API over HTTP using `@repo/shared` `endpoint`s).

### 8.1 Copy & rename
Copy `apps/web` (`app/[lang]/...` App Router with i18n, `src/` components/hooks/store/
animations/utilities, `next.config.ts`, `postcss.config.mjs`, `proxy.ts`, `dictionaries/`,
`public/`, `tsconfig.json`, `eslint.config.mjs`). Keep `"name": "@repo/web"`, deps
`@repo/shared` + `@repo/ui`, scripts (`dev: "next dev -p 3000"`, `build`, `start`, `lint`).

### 8.2 Integration
- It already consumes `@repo/shared` (`endpoint`, models, schemas) and `@repo/ui`. No changes
  needed beyond ensuring those packages build first (turbo `^build` handles it).
- Set the API base URL env the web app expects (port ramy's `.env` keys, e.g. `BASE_URL` /
  `NEXT_PUBLIC_API_URL`) in `apps/web/.env.example` → `http://localhost:3001`.
- The web fetches only **public** endpoints (`*Web` routes) — confirm those exist on the Nest
  side (they do in ramy: `getWebProjects`, `getProjectBySlug`, etc.).

### 8.3 Web acceptance checks
- `pnpm --filter @repo/web dev` serves `:3000`; `[lang]` routing works (en/ar).
- Home + a project detail page render data fetched from the Nest API.
- `pnpm --filter @repo/web build` passes.

---

## 9. Cross-cutting integration

1. **Port map (no collisions):** web `3000`, api `3001`, admin `3002`.
2. **i18n consistency:** `LanguageEnum`/`Language` (En/Ar) must match across shared enum,
   Prisma enum, API translation tables, admin language toggle, and web `[lang]` segment.
3. **Build order:** `@repo/shared` and `@repo/ui` build before apps; the API must run
   `db:generate` before `build`. Either make `build` depend on `db:generate` in the API's
   package.json (`"build": "prisma generate && nest build"`) or add a turbo `^db:generate`
   dependency. Simplest: **`"build": "prisma generate && nest build"`** and
   **`"dev": "prisma generate && nest start --watch"`**.
4. **Env files:** each app has its own `.env`/`.env.example`. Document them in the root README.
5. **Docker (optional, port later):** the express starter has a full `docker-compose.yml`
   (MySQL + admin + backend + web). A follow-up task can adapt it: one `mysql` service, an
   `api` service (Nest), `admin` (Vite static build via nginx), `web` (Next). Not required for
   the first milestone.

---

## 10. Phased task list (recommended execution order)

> Do these in order; each phase should end green (`pnpm --filter <pkg> build` passes).

**Phase 0 — Scaffolding**
- [ ] Create root files (§1): `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`,
  `.nvmrc`, `.gitignore`, prettier/eslint root config.
- [ ] `pnpm install` at root (empty workspace ok).

**Phase 1 — Shared tooling packages**
- [ ] `packages/typescript-config` (§2).
- [ ] `packages/eslint-config` (§3).
- [ ] `packages/shared` — port all sources, `pnpm --filter @repo/shared build` green (§4).
- [ ] `packages/ui` — minimal build green (§5).

**Phase 2 — API (NestJS + Prisma)** ← the hard part
- [ ] `apps/api/package.json` with Prisma deps/scripts (§6.1).
- [ ] `prisma/schema.prisma` modeling all ramy entities (§6.3); `db:generate` green.
- [ ] `PrismaModule`/`PrismaService` (§6.4); `app.module.ts`/`main.ts` de-TypeORM'd (§6.5–6.6).
- [ ] Port `common`, `config`, `auth`, `users` modules; convert services to Prisma (§6.7).
- [ ] Port `project` (canonical), `unites`, `section`, `seo`, `inquiry`, `email`, `resource`.
- [ ] `prisma/seed.ts`; run migrate + seed; boot on `:3001`, Swagger OK (§6.10).

**Phase 3 — Admin (Vite + shadcn)**
- [ ] Copy admin tree as `apps/admin`, rename to `@repo/admin`, add `@repo/shared` (§7.1–7.2).
- [ ] Strip CSRF, align api-client modules + auth to `endpoint`/JWT (§7.3–7.5).
- [ ] Trim demo features; wire Projects CRUD end-to-end; gate by `PermissionEnum` (§7.6).
- [ ] `build` + `dev` green; CRUD against live API works (§7.7).

**Phase 4 — Web (Next.js)**
- [ ] Copy `apps/web` as `@repo/web`; set API base URL env (§8).
- [ ] `dev` + `build` green; public pages render from API (§8.3).

**Phase 5 — Wire-up & polish**
- [ ] Root `pnpm dev` runs all three concurrently with no port clashes (§9).
- [ ] Root `pnpm build`, `pnpm lint`, `pnpm check-types` all green.
- [ ] Update root README env table; (optional) Docker compose.

---

## 11. Definition of done

- `pnpm install && pnpm build` succeeds from a clean checkout (after `.env` + DB are set up).
- `pnpm dev` brings up web `:3000`, api `:3001` (+ Swagger), admin `:3002`.
- A user can: log into the admin → create/edit/delete a Project (with EN/AR translations and
  media) → see it published on the Next.js web site. All three apps share **one** set of Zod
  schemas/types/endpoints from `@repo/shared`.
- No TypeORM anywhere; persistence is 100% Prisma with `prisma/schema.prisma` + migrations.

---

## 12. Pitfalls & notes for the implementer

- **Prisma has no entity inheritance** — repeat base columns (`id/createdAt/updatedAt/
  deletedAt/isDeleted`) in every model, or generate them with a small codegen/snippet. Don't
  try to recreate `CustomBaseEntity` as a Prisma abstraction (there isn't one).
- **Soft delete:** ramy relied on TypeORM `@DeleteDateColumn` + `softDelete`. Prisma has no
  built-in soft delete — implement it explicitly (`where: { isDeleted: false }` on reads;
  set `isDeleted/deletedAt` on "delete"). Consider a Prisma client extension to centralize it.
- **Enums:** keep the API/Prisma enum values aligned with `@repo/shared` enums (string values
  must match what the admin/web send).
- **Zod version:** shared uses `zod` v4 imported as `zod/v4` in places — keep the same import
  style; ensure all three apps resolve the same zod version (pnpm hoisting via `.npmrc` helps).
- **`nestjs-zod` + Swagger:** the Zod-DTO bridge (`getZodDto`, `cleanupOpenApiDoc`) is ORM-
  agnostic — port as-is.
- **Admin ↔ Nest auth shape:** verify the login response field names (token/expires/user/
  permissions) match what the admin's `auth-store` expects; adjust one side to fit the other
  (prefer adjusting the admin, keep the API canonical).
- **Generated Prisma client location:** if you use a custom `output` (express-starter style),
  import `PrismaClient` from that path and add it to `.gitignore`. The simpler default
  (`@prisma/client`) avoids path juggling — recommended for a starter.
- **Do not** leave the express admin's CSRF/cookie auth half-wired with the Nest bearer auth —
  pick bearer and remove CSRF fully (§7.4).
```
