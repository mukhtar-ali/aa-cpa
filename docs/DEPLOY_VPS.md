# Deploying to a VPS (Hostinger or any Ubuntu server)

Two supported ways to run this project in production. They do not interfere with each other; pick per server.

| | **A. Coolify** | **B. Plain Docker + GitHub Actions** |
|---|---|---|
| Uses | the root `docker-compose.yml` (Coolify builds the images itself) | `deploy/vps/docker-compose.prod.yml` (pulls images built by GitHub Actions; one stack per environment) |
| HTTPS / domains | Coolify (Traefik) | Caddy, from `deploy/vps/Caddyfile` |
| Deploy trigger | Coolify's GitHub webhook on push | `.github/workflows/deploy-vps.yml` after CI passes on `main`: **staging** automatically, then **production** after approval |
| Builds on the server | yes | no (built in Actions, pulled from GHCR) |
| Rollback | Coolify UI | automatic if the health gate fails; or run the workflow with `rollback_tag` (see below) |
| Extra RAM on the server | ~0.5–1 GB for Coolify | none |

The workflow is **off by default** (`VPS_DEPLOY_ENABLED` must be `true`), so a Coolify server is unaffected by it.
Both paths use the same images, the same env vars and the same database layout; see [DEPLOY.md](./DEPLOY.md) for the variable reference.

---

## A. Coolify

Unchanged: point Coolify at the repository, use the **Docker Compose** build pack with `docker-compose.yml`, set the
required env vars in its UI (`JWT_SECRET`, `ADMIN_PORTAL_URL`, `FRONTEND_URL`, `VITE_API_URL`, `NEXT_PUBLIC_*`, `BASE_URL`,
`API_PUBLIC_URL`, MySQL passwords), assign domains to `web`, `admin` and `api`, and set `TRUST_PROXY=1`. Do not publish host
ports (the repo's compose file already avoids it). Leave `VPS_DEPLOY_ENABLED` unset in GitHub.

---

## B. Plain Docker + GitHub Actions

### 1. Prepare the server (once)

Easiest on Hostinger: create the VPS with the **Ubuntu + Docker** OS template, so Docker is preinstalled (check the exact
template name in hPanel). Otherwise install Docker Engine and the Compose plugin from Docker's official instructions.

```bash
# as root on the VPS
adduser deploy && usermod -aG docker deploy           # non-root user the workflow logs in as
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
# paste the PUBLIC half of a new deploy key into /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable   # nothing else is exposed
```

Create the key pair on your own machine: `ssh-keygen -t ed25519 -f deploy_key -C "github-actions-deploy" -N ""`.

DNS: create **A records** for the web, admin and API hostnames pointing at the VPS IP. Caddy cannot issue certificates before this.

**aacpa.sa layout.** Two environments, each with its own Compose project, `.env` and GitHub environment: `staging`
(`staging.aacpa.sa`, `admin-staging.aacpa.sa`, `api-staging.aacpa.sa`) and `production` (`aacpa.sa`, `admin.aacpa.sa`,
`api.aacpa.sa`). A separate VPS per environment is recommended (both would otherwise bind ports 80/443; on one VPS they need a
single shared Caddy). Staging is `noindex` everywhere (`APP_ENV=staging`).

### 2. Create the server `.env` (once; secrets stay on the server)

```bash
su - deploy
mkdir -p app && cd app
# copy deploy/vps/env.staging.example (staging server) or env.prod.example (production server) here as .env, then:
chmod 600 .env && nano .env      # fill every CHANGE_ME; openssl rand -hex 32 for secrets
```

### 3. Configure GitHub (once)

Repository → Settings → Environments: create **`staging`** and **`production`** (add *required reviewers* to `production`: that is the
manual approval). Put the secrets and variables below **in each environment**, with that server's values (same names in both).
Only `VPS_DEPLOY_ENABLED` is a repository-level variable.

**Secrets** (per environment)

| Name | Value |
|---|---|
| `VPS_HOST` | server IP or hostname |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | the **private** key (contents of `deploy_key`) |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519 <host>` run on your machine |

**Variables**

| Name | Where | Example | Notes |
|---|---|---|---|
| `VPS_DEPLOY_ENABLED` | repository | `true` | the switch; leave unset on Coolify setups |
| `VPS_WEB_DOMAIN` | each environment | `aacpa.sa` / `staging.aacpa.sa` | baked into the web bundle; used by the health gate |
| `VPS_ADMIN_DOMAIN` | each environment | `admin.aacpa.sa` | used by the health gate |
| `VPS_API_DOMAIN` | each environment | `api.aacpa.sa` | baked into the web and admin bundles |
| `VPS_APP_DIR` | each environment | `app` | optional, folder under the deploy user's home |
| `VPS_FB_PIXEL_ID` | each environment | | optional |

The workflow is `deploy-vps.yml` (triggers and ordering) calling `deploy-vps-env.yml` (build, copy, restart, health gate, rollback)
once per environment. Images are built **per environment** because the public URLs are baked into the bundles, and tagged with the
commit SHA.

### 4. First deploy

Run the **Deploy to VPS** workflow manually (Actions tab → Run workflow, environment `staging`), or push to `main` once CI passes
(staging deploys automatically, production waits for approval). It builds and pushes the images, copies
`docker-compose.prod.yml` (as `docker-compose.yml`), `Caddyfile`, `backup/` and `monitor/` to the server, pulls and restarts, then runs
the **health gate** (`deploy/vps/healthcheck.sh`): API `/api/health`, web `/api/health` reporting the new SHA, and the admin page. If the
gate fails, the previous tag is restored automatically and the run fails. The API applies database migrations on start
(`prisma migrate deploy`).

Seed the first super admin once (it is not automatic):

```bash
ssh deploy@<host>
cd app && docker compose run --rm api pnpm seed
```

If the GHCR packages are private (the default), the workflow logs the server in to GHCR with a short-lived token on each
deploy. To run `docker compose` by hand later, log in once with a personal access token that has `read:packages`.

### Day-to-day

```bash
cd ~/app
docker compose ps                    # status
docker compose logs -f api           # logs
docker compose up -d                 # apply an edited .env
```

**Roll back** (target < 15 min): Actions → *Deploy to VPS* → Run workflow → pick the environment and set `rollback_tag` to a known-good
12-character commit SHA. It skips the build, redeploys that tag and re-runs the health gate. By hand: set `IMAGE_TAG=<older SHA>` in `.env`, then
`docker compose pull && docker compose up -d && WEB_DOMAIN=… ADMIN_DOMAIN=… API_DOMAIN=… ./healthcheck.sh <SHA>`.

### Backups and monitoring

- Nightly encrypted off-site backups (MySQL dump + uploads, restic, 30 daily / 12 monthly): install with `deploy/vps/backup/install.sh`, configure
  `/etc/aacpa/backup.env`. Restore runbook: `deploy/vps/backup/restore.md` (target < 1 h).
- Uptime checks, host checks (disk, failed outbox, container health, backup age) and alert thresholds: `docs/launch/monitoring.md`.
- Hostinger's VPS snapshots are a useful extra layer, not a replacement.

### Things to know

- The web and admin images bake their API/site URLs in at **build** time. Changing a domain means re-running the workflow, not just editing `.env`.
- `deploy/vps/docker-compose.prod.yml` is a separate file from the root one. When you change a service's env vars, healthcheck or volumes in the root file, mirror it there. The older `deploy/vps/docker-compose.yml` is the previous single-stack file, kept for reference; the workflow no longer uses it.
- Production runs the CSP in `report-only` first (`CSP_MODE`); switch to `enforce` after a clean week on staging. Go-live steps: `docs/launch/runbook.md`.
- Only ports 80/443 are published (Caddy). MySQL and the app containers are reachable only inside the compose network.
