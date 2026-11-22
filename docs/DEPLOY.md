# Deployment Guide (`_nest_next_starter`)

This guide covers containerizing and deploying the three monorepo applications (`@repo/api`, `@repo/admin`, `@repo/web`) locally via **Docker Compose** and in production via **Coolify**.

> Deploying to a plain VPS (Hostinger or similar) with Docker and GitHub Actions instead of Coolify? See [DEPLOY_VPS.md](./DEPLOY_VPS.md), which covers both routes.

---

## 1. Architecture & Container Overview

All three Dockerfiles use the **repository root (`.`)** as their build context because they share the root `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, and internal packages (`@repo/shared`, `@repo/ui`, `@repo/typescript-config`, `@repo/eslint-config`).

> **Why Debian (`node:22-bookworm-slim`) for Node stages?**  
> Root `.npmrc` and `package.json` configure `supportedArchitectures.libc = ["glibc"]` only (for native binaries like `@rollup/rollup-linux-x64-gnu`, `sharp`, `bcrypt`, and Prisma engines). All Node build/runtime stages therefore use `node:22-bookworm-slim` (glibc), never Alpine/musl. Only the final static file stage of `@repo/admin` uses `nginx:1.27-alpine`.

| Service | Workspace | Dockerfile | Runtime Base | Container Port | Host Port (Compose) |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **`api`** | `@repo/api` (`apps/api`) | `apps/api/Dockerfile` | `node:22-bookworm-slim` + `openssl` | `3001` | `3001` |
| **`admin`** | `@repo/admin` (`apps/admin`) | `apps/admin/Dockerfile` | `nginx:1.27-alpine` | `80` | `3002` |
| **`web`** | `@repo/web` (`apps/web`) | `apps/web/Dockerfile` | `node:22-bookworm-slim` | `3000` | `3000` |
| **`mysql`** | MySQL 8.0 | — (`mysql:8.0`) | `mysql:8.0` | `3306` | `3306` |

---

## 2. Local Deployment with Docker Compose

### Step 1: Copy Root Deployment Files

The deployment templates live under `docs/deploy/`. Copy them to the repository root before building:

```bash
cp docs/deploy/dockerignore .dockerignore
cp docs/deploy/docker-compose.yml docker-compose.yml
cp docs/deploy/docker-compose.override.yml docker-compose.override.yml
cp docs/deploy/env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item docs/deploy/dockerignore .dockerignore
Copy-Item docs/deploy/docker-compose.yml docker-compose.yml
Copy-Item docs/deploy/docker-compose.override.yml docker-compose.override.yml
Copy-Item docs/deploy/env.example .env
```

### Step 2: Configure `.env`

Edit `.env` in the repository root and replace all `CHANGE_ME_*` placeholders:

- `MYSQL_ROOT_PASSWORD` / `MYSQL_PASSWORD` — MySQL credentials
- `DATABASE_URL` — with compose it is built automatically from `MYSQL_USER`, `MYSQL_PASSWORD` and `MYSQL_DATABASE` (host `mysql`), so the API runs as the unprivileged app user, not root. Keep `MYSQL_PASSWORD` URL-safe (letters, digits, `- _ . ~`) or percent-encode it, because it is embedded in the URL. `MYSQL_ROOT_PASSWORD` is only used to initialise and health-check MySQL.
- `JWT_SECRET` / `CSRF_SECRET` — long random strings (e.g. `openssl rand -hex 32`)
- `SUPER_ADMIN_PASSWORD` — strong password for one-off seeding (must have >=8 chars, uppercase, lowercase, digit, and special character from `!@#$%^&*`)

### Step 3: Build & Start Services

```bash
docker compose build
docker compose up -d
```

When `api` starts, `apps/api/docker-entrypoint.sh` automatically runs:

1. `prisma migrate deploy` (applies all committed migrations in `apps/api/prisma/migrations`)
2. `exec node dist/main`

Verify service health and logs:

```bash
docker compose ps
docker compose logs -f api
```

Once running:
- **Public Web (`@repo/web`)**: `http://localhost:3000`
- **API (`@repo/api`)**: `http://localhost:3001` (liveness: `http://localhost:3001/api/health`; Swagger UI at `/api/swagger` only outside production, or when `SWAGGER_ENABLED=true`)
- **Admin Portal (`@repo/admin`)**: `http://localhost:3002`

### Standalone `docker build` Commands (Without Compose)

Always run from the **repository root** (`.`):

```bash
# 1. API
docker build -f apps/api/Dockerfile -t starter-api .

# 2. Admin (Vite SPA — bakes VITE_API_URL at build time)
docker build -f apps/admin/Dockerfile \
  --build-arg VITE_API_URL=http://localhost:3001 \
  -t starter-admin .

# 3. Web (Next.js — bakes NEXT_PUBLIC_* and BASE_URL at build time)
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_FB_PIXEL_ID="" \
  --build-arg BASE_URL=http://localhost:3001 \
  -t starter-web .
```

---

## 3. Seeding the Initial Super Admin

The API container does **not** run the database seed automatically on startup. Seeding is performed as an explicit one-off command using `apps/api/prisma/seed.ts`.

### What `apps/api/prisma/seed.ts` Does
1. Reads `SUPER_ADMIN_EMAIL` (default `admin@example.com`), `SUPER_ADMIN_USERNAME` (default `super_admin`), `SUPER_ADMIN_FULL_NAME` (default `Super Admin`), and **`SUPER_ADMIN_PASSWORD` (required — throws if unset)**.
2. Validates `SUPER_ADMIN_PASSWORD` against `passwordValidation` from `@repo/shared` (minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character `!@#$%^&*`).
3. Creates the super-admin user with `ALL_PERMISSIONS` if it does not exist, or tops up any missing permissions on an existing super-admin account.
4. Upserts default CMS sections (`website-info`, `home-hero`, `home-about`, `fonts`, `home-why`).

### Run the One-Off Seed Command

With `.env` configured (or passing `SUPER_ADMIN_*` inline), run:

```bash
docker compose run --rm api pnpm seed
```

Or pass credentials explicitly for a single run:

```bash
docker compose run --rm \
  -e SUPER_ADMIN_EMAIL="admin@example.com" \
  -e SUPER_ADMIN_USERNAME="super_admin" \
  -e SUPER_ADMIN_FULL_NAME="Super Admin" \
  -e SUPER_ADMIN_PASSWORD="<choose-a-strong-password>" \
  api pnpm seed
```

*(Because the command is safe and idempotent, re-running it after adding new `PermissionEnum` values in future releases will top up the super admin's permission set without overwriting existing CMS section data.)*

---

## 4. Build-Time (`ARG`) vs Runtime (`ENV`) Variables

Understanding which variables are baked into frontend bundles at `docker build` time vs read at container startup is critical for both Docker Compose and Coolify:

| Variable | App | Build-Time (`ARG`) | Runtime (`ENV`) | Notes |
| :--- | :--- | :---: | :---: | :--- |
| `DATABASE_URL` | `api` | No | **Yes (Required)** | Read by `prisma migrate deploy` and `PrismaService` at startup |
| `APP_PORT` | `api` | No | Yes (Default `3001`) | Port NestJS listens on (`0.0.0.0`) |
| `NODE_ENV` | `api`, `web` | No | Yes (`production`) | Enables secure cookies, disables `pino-pretty`, locks `AUTH_THROTTLE_LIMIT` |
| `LOG_LEVEL` | `api` | No | Yes (Default `info`) | Pino log level (`apps/api/src/app.module.ts`) |
| `JWT_SECRET` | `api` | No | **Yes (Required)** | Signs JWT access tokens. Also the root secret from which the key that encrypts the **SMTP password stored in the admin settings** is derived (AES-256-GCM, HKDF). **If you rotate it, the stored SMTP password can no longer be decrypted**: the API logs an error and falls back to the `EMAIL_PASSWORD` env value until an admin re-enters the password in Settings → Email. |
| `CSRF_SECRET` | `api` | No | Optional | Secret for `csrf-csrf`; falls back to `JWT_SECRET` if omitted |
| `ADMIN_PORTAL_URL` | `api` | No | **Yes (Required)** | Allowed CORS origin for the Admin SPA |
| `FRONTEND_URL` | `api` | No | **Yes (Required)** | Allowed CORS origin for the Web storefront |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `SUPPORT_EMAIL` | `api` | No | Optional | Fallback SMTP config when DB `email-settings` section is empty |
| `S3_BUCKET_NAME`, `S3_BUCKET_ACCESS_KEY_ID`, `S3_BUCKET_SECRET_ACCESS_KEY`, `S3_BUCKET_REGION` | `api` | No | Optional | S3 credentials for media & PDF resume uploads. Leave empty to store files on the server's disk instead (see *Persistent Storage*). |
| `STORAGE_DRIVER` | `api` | No | Optional | `local` or `s3`. Unset = `s3` when `S3_BUCKET_NAME` is set, otherwise `local`. An unknown value stops the API from starting in production. |
| `UPLOADS_DIR` | `api` | No | Optional | Local storage folder (default `<api folder>/storage`; `/app/apps/api/storage` in the Docker image). Mount a persistent volume on it. |
| `API_PUBLIC_URL` | `api` | No | **Yes with local storage** | Public `http(s)` URL of the API, e.g. `https://api.example.com`. Local-storage file links stored in the database are built from it, so changing the API domain later means rewriting them. |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_USERNAME`, `SUPER_ADMIN_FULL_NAME`, `SUPER_ADMIN_PASSWORD` | `api` | No | One-off (`seed` only) | Used only when running `pnpm seed` |
| `AUTH_THROTTLE_LIMIT` | `api` | No | **Ignored in prod** | Ignored when `NODE_ENV=production` (hardcoded to 10 req / 15 min) |
| `S3_OBJECT_ACL` | `api` | No | Optional | `public-read` (default), `private` or `none`. Use `none` for AWS buckets with *Bucket owner enforced* ownership (the default for new buckets) and for R2/MinIO, which reject ACLs with `AccessControlListNotSupported`; grant public read through the bucket policy. With `private` the URL returned for an upload is **not readable** (signed URLs are not implemented yet). An invalid value stops the API from starting in production. |
| `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE`, `S3_PUBLIC_BASE_URL` | `api` | No | Optional | For S3-compatible stores (R2, MinIO): the endpoint URL, `true` for path-style addressing (MinIO), and the public URL prefix used for the returned object links (an R2 public domain or CDN; unset = the AWS S3 URL). Endpoint and base URL must be `http(s)` URLs, or the API will not start in production. |
| `SWAGGER_ENABLED` | `api` | No | Optional | `true` turns the Swagger UI on at `/api/swagger` in production (it is always on outside production). It documents every endpoint to anyone who can reach the API, so enable it only while you need it. |
| `TRUST_PROXY` | `api` | No | **Yes, behind a reverse proxy** | Number of proxy hops (integer 1-10, e.g. `1` for Coolify/Traefik or one nginx) to trust for `X-Forwarded-For`. Without it every request appears to come from the proxy's IP, so the per-IP limits (auth 10 / 15 min, and the public monitoring ingestion at 100 / min) apply to **all users together**. `true`, `*` and address lists are refused (they let clients spoof their IP); an invalid value stops the API from starting in production. Leave unset when the API is exposed directly. |
| `VITE_API_URL` | `admin` | **Yes (Required)** | No | Baked into static JS bundle during `vite build`; changing requires rebuild |
| `BASE_URL` | `web` | **Yes (Required)** | Yes | Inlined by `apps/web/next.config.ts` (`env.BASE_URL`) at `next build` time for both SSR fetches and client-side `useMutation` forms |
| `NEXT_PUBLIC_API_URL` | `web` | **Yes** | No | Public API URL passed at `next build` time |
| `NEXT_PUBLIC_SITE_URL` | `web` | **Yes (Required)** | Yes | Used in `app/sitemap.ts` and `app/robots.ts` |
| `NEXT_PUBLIC_FB_PIXEL_ID` | `web` | **Yes (Optional)** | No | Meta Pixel ID baked into `<FBPixel />`; leave empty to disable |

---

## 5. Coolify Deployment Guide

In Coolify, deploy this monorepo as **one MySQL database resource** plus **three Dockerfile application resources** pointing to the same Git repository.

> **Deploying the repo's `docker-compose.yml` as a single Coolify "Docker Compose" resource instead?** That works too (MySQL, api, admin and web in one resource, with the `mysql_data` and `api_uploads` volumes). Add the variables on the application's **Environment Variables** tab (left sidebar). The compose file lists the ones the API cannot start without as required, so Coolify shows them as fields: `JWT_SECRET` (32+ random characters, not a placeholder), `ADMIN_PORTAL_URL` and `FRONTEND_URL` (real `https://` origins, no trailing slash). Also set `TRUST_PROXY=1` (Traefik is in front), the four build-time URLs `VITE_API_URL`, `NEXT_PUBLIC_API_URL`, `BASE_URL`, `NEXT_PUBLIC_SITE_URL` (your public addresses), `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` (letters and digits only, because the password is embedded in `DATABASE_URL`), and `API_PUBLIC_URL` when you use local-disk uploads (no S3). Give each service a domain on the General tab (for the API include its port, e.g. `https://api.example.com:3001`). `docker-compose.override.yml` (which publishes host ports 3000/3001/3002/3306 for local runs) is deliberately not used by Coolify, which runs only `docker-compose.yml` and routes by domain, so an occupied host port such as 3000 can no longer fail the deploy. The web and admin builds also refuse to build when `BASE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` or `VITE_API_URL` is set but **empty** (Coolify passes an empty value for a variable that was never filled in; the web app then renders nothing but hangs on every page, and the admin cannot log in). Fill them in the **Production** variables, not only under *Preview deployments*, which is a separate list. A missing required value now stops the deploy with a message naming the variable, instead of the api container crashing at boot and showing as `unhealthy`.

### 5.1 Database Resource (MySQL 8.0)

1. In your Coolify project/environment, click **+ New** → **Database** → **MySQL** (`mysql:8.0`).
2. Enable **Persistent Storage** (Coolify creates a persistent volume for `/var/lib/mysql` automatically).
3. Copy the **Internal Database URL** (reachable by applications on the same Coolify network, e.g. `mysql://mysql:<password>@<container-id>:3306/<database>`).

### 5.2 Three Applications from the Same Git Repository

Create three **Application** resources connected to the same Git repository and branch (`main`), using **Build Pack = `Dockerfile`**:

| Setting | App 1: `api` | App 2: `admin` | App 3: `web` |
| :--- | :--- | :--- | :--- |
| **Base Directory (Build Context)** | `/` | `/` | `/` |
| **Dockerfile Location** | `/apps/api/Dockerfile` | `/apps/admin/Dockerfile` | `/apps/web/Dockerfile` |
| **Ports Exposes** | `3001` | `80` | `3000` |
| **Domain (Example)** | `https://api.example.com` | `https://admin.example.com` | `https://example.com` |

> **Important (Coolify Monorepo Setting):** Keep **Base Directory** set to `/` (the repository root) for all three applications so Docker can access `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, and `packages/*`. Set **Dockerfile Location** to the app-specific path (`/apps/api/Dockerfile`, `/apps/admin/Dockerfile`, `/apps/web/Dockerfile`). Also ensure `.dockerignore` has been committed at the repo root (copied from `docs/deploy/dockerignore`).

### 5.3 Environment Variables in Coolify (Per Application)

#### App 1: `api` (Runtime Environment Variables — NOT Build Variables)
- `NODE_ENV=production`
- `APP_PORT=3001`
- `DATABASE_URL=<Coolify Internal MySQL URL>`
- `JWT_SECRET=<strong-random-secret>`
- `CSRF_SECRET=<strong-random-secret>`
- `ADMIN_PORTAL_URL=https://admin.example.com` *(no trailing slash)*
- `FRONTEND_URL=https://example.com` *(no trailing slash)*
- `TRUST_PROXY=1` *(Coolify puts Traefik in front of the API; without this the login rate limit is shared by every user)*
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `SUPPORT_EMAIL`
- `S3_BUCKET_NAME`, `S3_BUCKET_ACCESS_KEY_ID`, `S3_BUCKET_SECRET_ACCESS_KEY`, `S3_BUCKET_REGION`

#### App 2: `admin` (Check **"Build Variable?"** in Coolify UI)
- `VITE_API_URL=https://api.example.com` *(MUST have **Build Variable** enabled so Coolify passes `--build-arg VITE_API_URL=...` to `docker build`)*

#### App 3: `web` (Check **"Build Variable?"** in Coolify UI + Runtime)
- `BASE_URL=https://api.example.com` *(enable **Build Variable** AND available at runtime)*
- `NEXT_PUBLIC_API_URL=https://api.example.com` *(enable **Build Variable**)*
- `NEXT_PUBLIC_SITE_URL=https://example.com` *(enable **Build Variable** AND available at runtime)*
- `NEXT_PUBLIC_FB_PIXEL_ID=` *(enable **Build Variable**, optional)*

### 5.4 Health Checks in Coolify
- **`api`**: `apps/api/Dockerfile` includes a built-in `HEALTHCHECK` against `http://localhost:3001/api/health` (and installs `curl` in the runtime image). In Coolify's Health Check tab:
  - Path: `/api/health`
  - Port: `3001`
  - Return Code: `200`
- **`admin`**: Nginx serves `/` on port `80` with `200 OK`.
- **`web`**: Next.js serves `/en` (or `/` which redirects `307` to `/en`) on port `3000`. If configuring a strict `200` check in Coolify for `web`, set the health check path to `/en`.

### 5.5 Persistent Storage
- **Database**: MySQL data is stored on the persistent volume attached to the MySQL service (`/var/lib/mysql`).
- **Uploaded Media & Resumes**: handled by `ResourceService` (`apps/api/src/resource/`) through one of two storage drivers, chosen by `STORAGE_DRIVER` (unset: S3 when `S3_BUCKET_NAME` is set, otherwise local disk). Applicants' résumés are always kept apart from public media and are never public.
  - **S3 (or R2/MinIO)**: stateless, no volume needed. Public media is stored under `nest-next-starter/uploads/`, résumés under `nest-next-starter/private/` (no public ACL) and opened by admins through short-lived (15 min) signed links. Make public (bucket policy / CDN) **only** `nest-next-starter/uploads/*`, never `nest-next-starter/*` or the whole bucket, and give the `S3_BUCKET_*` credentials `s3:GetObject`, `PutObject` and `DeleteObject`. Résumés uploaded before this change are under `uploads/` and stay public until you move them: run `pnpm --filter @repo/api resumes:make-private` (a dry run that lists what would move), then again with `-- --apply`; it copies each object to the private prefix, checks the copy, repoints the database row and only then deletes the original, and is safe to re-run.
  - **Local disk** (no S3 credentials needed): files are written under `UPLOADS_DIR`. **Mount a persistent volume on that folder and back it up** (Coolify: add *Persistent Storage* to the `api` application with destination path `/app/apps/api/storage`; the compose file already declares `api_uploads`). Public files are served by the API at `<API_PUBLIC_URL>/uploads/...` (with `nosniff` and a script-blocking CSP; the private folder is never served). Résumés are opened through signed, 15-minute download links (`/api/files/download`, HMAC-signed with a key derived from `JWT_SECRET`, so rotating `JWT_SECRET` invalidates links in flight). Set `API_PUBLIC_URL`. Limits: one API instance (or a shared volume), no CDN, and switching to S3 later means copying the files and rewriting the stored URLs.
- **Seeding on Coolify**: After the first `api` deployment succeeds, open the **Terminal** tab for the `api` container in Coolify (or run once via SSH) with `SUPER_ADMIN_*` set and execute:
  ```bash
  pnpm seed
  ```

---

## 6. CORS, Cookie & URL Gotchas

### 6.1 Exact CORS Origin Matching (`apps/api/src/main.ts`)
In `apps/api/src/main.ts`, CORS is configured with `credentials: true` and an explicit two-origin allow-list:

```ts
app.enableCors({
    origin: [customEnv.ADMIN_PORTAL_URL, customEnv.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-csrf-token'],
});
```

- **Why wildcards (`*`) cannot be used**: The Admin portal uses an `httpOnly` refresh token cookie (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`) and a double-submit CSRF cookie (`x-csrf-token`), bound to a random `csrf_sid` session cookie, with `withCredentials: true`. Browsers reject `Access-Control-Allow-Origin: *` whenever `Access-Control-Allow-Credentials: true` is set.
- **No trailing slashes**: Browser `Origin` headers never include a trailing slash. Set `ADMIN_PORTAL_URL=https://admin.example.com` and `FRONTEND_URL=https://example.com` **without** a trailing `/`. A trailing slash (`https://admin.example.com/`) will cause every cross-origin request from the Admin portal to fail CORS checks.
- **Scheme & port must match**: `http://` vs `https://` and non-standard ports (`:3002`) must match the exact URL typed into the browser.

### 6.2 Secure Cookies & HTTPS Termination (`NODE_ENV=production`)
When `NODE_ENV=production`:
- `apps/api/src/auth/auth.controller.ts` sets `secure: true` on the `refreshToken` cookie.
- `apps/api/src/common/csrf.middleware.ts` sets `secure: true` on the CSRF cookies, which are named `__Host-x-csrf-token` and `__Host-csrf_sid` in production (the `__Host-` prefix stops a sibling subdomain from planting them; it needs HTTPS, so locally they are the unprefixed `x-csrf-token` / `csrf_sid`). The CSRF token is bound to the `csrf_sid` cookie (httpOnly, `SameSite=Lax`, 30 days), not to the `Authorization` header or the client IP, so it stays valid when the access token is refreshed or the client's IP changes. The admin app and the API must therefore be **same-site** (for example `admin.example.com` and `api.example.com`) so browsers send both cookies on credentialed requests.
- In production (Coolify), always serve `api` and `admin` over `https://` (or `http://localhost` during local testing) so browsers accept and send the `Secure` cookies.

### 6.3 `BASE_URL` in `@repo/web` (Build-Time Inlining + Dual SSR/Client Usage)
- `apps/web/next.config.ts` declares `env: { BASE_URL: process.env.BASE_URL }`. Next.js inlines `process.env.BASE_URL` into **both** Server Components (`app/[lang]/**/page.tsx`, `layout.tsx`, `sitemap.ts`) and Client Components (`src/hooks/useMutation.ts`, used by `ContactForm` and `JobApplyForm`) during `next build`.
- Therefore, `BASE_URL` **must** be passed as a `--build-arg` when building `apps/web/Dockerfile`, and in production it must be set to the **publicly reachable API URL** (e.g. `https://api.example.com`) so both the user's browser and the Next.js server container can reach it.
- In local Docker Compose on a single machine:
  - Setting `BASE_URL=http://localhost:3001` allows browser-side forms (`ContactForm`, `JobApplyForm`) to submit to the host-mapped API port `localhost:3001`.
  - If you need Server Components inside the `web` container in local Docker Compose to resolve `localhost:3001` to the `api` container, either run `web` with `network_mode: host` (Linux) or set `BASE_URL=http://api:3001` and add `127.0.0.1 api` to your host's `/etc/hosts` (`C:\Windows\System32\drivers\etc\hosts` on Windows). In Coolify with public domains (`https://api.example.com`), no workaround is needed because both browser and container resolve the public domain.

### 6.4 Next.js `<Image>` Remote Patterns (`apps/web/next.config.ts`)
`apps/web/next.config.ts` currently allows `**.amazonaws.com` and `example.com` in `images.remotePatterns`. If you use a custom S3-compatible CDN domain (e.g. Cloudflare R2, MinIO, DigitalOcean Spaces, or CloudFront) for project/news images, add its hostname to `images.remotePatterns` in `apps/web/next.config.ts`.

---

## 7. Verification Checklist (Verified vs Unverified)

Because Docker is not available in the authoring environment, none of the images or containers have been built or executed yet. The Windows-side agent / operator should run through the unverified items below.

### Verified (Static Inspection Against Codebase)
- [x] Monorepo package manager (`pnpm@9.0.0`) and Node version (`22` per `.nvmrc`) matched in all Node Docker stages.
- [x] Debian/glibc base (`node:22-bookworm-slim`) used for all Node install/build/runtime stages to satisfy `.npmrc` `supportedArchitectures.libc[]=glibc`.
- [x] All `COPY` paths in `apps/api/Dockerfile`, `apps/admin/Dockerfile`, and `apps/web/Dockerfile` verified against the repository tree.
- [x] Workspace filter names (`@repo/shared`, `@repo/ui`, `@repo/api`, `@repo/admin`, `@repo/web`) verified against each `package.json`.
- [x] Build order verified (`@repo/shared` before `@repo/api` and `@repo/admin`; `@repo/shared` and `@repo/ui` before `@repo/web`).
- [x] Runtime assets for `@repo/api` included (`apps/api/prisma` for migrations/seed, `apps/api/public` for Handlebars email templates and static assets, `packages/typescript-config` + `apps/api/tsconfig.json` for `pnpm seed`).
- [x] `apps/api/docker-entrypoint.sh` strips `\r` (CRLF-safe on Windows checkouts), sets `set -e`, runs `prisma migrate deploy`, and executes `exec node dist/main` (without auto-seeding).
- [x] Every `process.env` and `import.meta.env` usage across `apps/` and `packages/` audited and documented in `docs/deploy/env.example` and `apps/*/.env.example`.

### Unverified (To Be Executed by Windows Build Agent)
- [ ] Copy `docs/deploy/dockerignore` → `.dockerignore`, `docs/deploy/docker-compose.yml` → `docker-compose.yml`, `docs/deploy/docker-compose.override.yml` → `docker-compose.override.yml`, and `docs/deploy/env.example` → `.env`.
- [ ] Build `apps/api/Dockerfile`, `apps/admin/Dockerfile`, and `apps/web/Dockerfile` via `docker compose build`.
- [ ] Boot stack via `docker compose up -d` and confirm `mysql` healthcheck passes, `api` runs `prisma migrate deploy` and passes the `/api/health` healthcheck, `admin` serves on `http://localhost:3002`, and `web` serves on `http://localhost:3000`.
- [ ] Run one-off seed (`docker compose run --rm api pnpm seed`) and verify super-admin login at `http://localhost:3002`.
