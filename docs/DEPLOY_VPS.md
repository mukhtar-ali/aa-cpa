# Deploying to a VPS (Hostinger or any Ubuntu server)

Two supported ways to run this project in production. They do not interfere with each other; pick per server.

| | **A. Coolify** | **B. Plain Docker + GitHub Actions** |
|---|---|---|
| Uses | the root `docker-compose.yml` (Coolify builds the images itself) | `deploy/vps/docker-compose.yml` (pulls images built by GitHub Actions) |
| HTTPS / domains | Coolify (Traefik) | Caddy, from `deploy/vps/Caddyfile` |
| Deploy trigger | Coolify's GitHub webhook on push | `.github/workflows/deploy-vps.yml` after CI passes on `main` |
| Builds on the server | yes | no (built in Actions, pulled from GHCR) |
| Rollback | Coolify UI | set `IMAGE_TAG` to an older commit SHA |
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

### 2. Create the server `.env` (once; secrets stay on the server)

```bash
su - deploy
mkdir -p app && cd app
# copy deploy/vps/env.example here as .env (scp, or paste), then:
chmod 600 .env && nano .env      # fill every CHANGE_ME; openssl rand -hex 32 for secrets
```

### 3. Configure GitHub (once)

Repository → Settings → Secrets and variables → Actions.

**Secrets**

| Name | Value |
|---|---|
| `VPS_HOST` | server IP or hostname |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | the **private** key (contents of `deploy_key`) |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519 <host>` run on your machine |

**Variables**

| Name | Example | Notes |
|---|---|---|
| `VPS_DEPLOY_ENABLED` | `true` | the switch; leave unset on Coolify setups |
| `VPS_WEB_DOMAIN` | `www.example.com` | baked into the web bundle |
| `VPS_API_DOMAIN` | `api.example.com` | baked into the web and admin bundles |
| `VPS_APP_DIR` | `app` | optional, folder under the deploy user's home |
| `VPS_FB_PIXEL_ID` | | optional |

The workflow uses a `production` GitHub Environment; create it (Settings → Environments) and add required reviewers if you
want a manual approval before each deploy.

### 4. First deploy

Run the **Deploy to VPS** workflow manually (Actions tab → Run workflow), or push to `main` once CI passes. It builds and
pushes the images, copies `docker-compose.yml` and `Caddyfile` to the server, pulls and restarts, then waits for
`https://<api-domain>/api/health`. The API applies database migrations on start (`prisma migrate deploy`).

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
# roll back: set IMAGE_TAG=<older 12-char commit SHA> in .env, then
docker compose pull && docker compose up -d
```

### Backups

- Database: `docker compose exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction "$MYSQL_DATABASE"' | gzip > backup-$(date +%F).sql.gz`, run from cron and copied off the server.
- Uploads (when S3 is not used): back up the `api_uploads` volume.
- Hostinger's VPS snapshots are a useful extra layer, not a replacement for the two above.

### Things to know

- The web and admin images bake their API/site URLs in at **build** time. Changing a domain means re-running the workflow, not just editing `.env`.
- `deploy/vps/docker-compose.yml` is a separate file from the root one. When you change a service's env vars, healthcheck or volumes in the root file, mirror it there.
- Only ports 80/443 are published (Caddy). MySQL and the app containers are reachable only inside the compose network.
