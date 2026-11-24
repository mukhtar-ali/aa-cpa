# Manual security review checklist (feature 004, T027)

Run on **staging** with production-like data before go-live; repeat the items marked ↻ after any change in that area.
Tick each box with the date and initials, link evidence (screenshot, request/response, ticket) and either fix the finding
or record the client's written risk acceptance in the table at the end. Automated scans (`pnpm audit`, Trivy, ZAP,
`security.yml`, `zap-baseline.yml`) complement this; they do not replace it.

## 1. Public forms (contact, quote request, estimator, job application)
- [ ] Server-side validation matches the client: oversize, wrong type, empty and unicode/RTL-control input all rejected cleanly (no 500).
- [ ] Per-IP and per-email rate limits hold (`@Throttle` on `leads` and `careers` controllers): the 11th rapid submission gets 429; limit headers present.
- [ ] Turnstile (or the configured captcha) is verified **server-side**; a request without a token is rejected.
- [ ] Honeypot/time checks (if enabled) cannot be bypassed by omitting the field.
- [ ] Submitted text is stored as text and escaped on output everywhere: `<script>`, `"><img onerror=…>` in every field render inert in admin lists, detail views, e-mails and CSV export.
- [ ] No personal data in URLs, analytics events (`lead_submitted` etc.) or logs.
- [ ] Notification e-mails: header injection attempts (`\r\nBcc:`) in name/subject/e-mail fields are rejected.

## 2. Uploads (CV and attachments, admin images)
- [ ] Type is checked by **content** (magic bytes), not only extension or `Content-Type`; `.html`, `.svg` with script, `.exe` renamed to `.pdf` are rejected.
- [ ] Size limit enforced server-side; oversize request rejected before it is buffered fully.
- [ ] Stored file names are random; the original name is never used as a path. `../` and null bytes cannot escape the storage folder.
- [ ] Uploaded files are served with `Content-Disposition`/safe `Content-Type` and `X-Content-Type-Options: nosniff`; CVs are not publicly listable (access only through a permission-checked admin route).
- [ ] The uploads volume/bucket is not publicly writable; the bucket policy denies listing.

## 3. Authentication and sessions (admin)
- [ ] Login throttling works (`AUTH_THROTTLE_LIMIT`, default 10 per 15 min per IP); lockout message does not reveal whether the account exists.
- [ ] Production has no default/seed password left (`SUPER_ADMIN_PASSWORD` changed after first login); no demo users.
- [ ] Cookies: `HttpOnly`, `Secure`, `SameSite`; CSRF middleware active in production (`csrf.middleware.production.spec.ts` passes; a POST without the token is rejected).
- [ ] JWT secret is ≥ 32 random chars and differs between staging and production; password reset links expire and are single-use.
- [ ] Logout and password change invalidate old sessions/refresh tokens.

## 4. Authorisation: RBAC and IDOR
- [ ] For every admin route group, a user **without** the permission gets 403 (leads, applications, redirects `admin_portal.seo.*`, settings, users, roles, outbox, dashboard). The `admin-permissions.e2e-spec.ts` matrix is green and covers the new routes.
- [ ] IDOR: with a low-privilege account, request another record's id on `leads/:id`, `applications/:id`, privacy export/erase, outbox retry: 403/404, never data.
- [ ] A role cannot grant itself or others permissions it does not hold; the last super admin cannot be deleted or demoted.
- [ ] Public endpoints never return unpublished/future-dated content, draft translations or internal fields (`lastError`, `createdById`, notes) — compare the public JSON against the admin JSON.
- [ ] Preview tokens expire and cannot be used for admin routes.

## 5. Injection and output encoding
- [ ] No string-built SQL anywhere (Prisma only; grep for `$queryRaw`/`$executeRaw` and justify each).
- [ ] **CSV/formula injection**: values starting with `=`, `+`, `-`, `@`, tab or CR are neutralised in every export (leads, applications, redirects `export.csv`) and imports reject them or store them harmlessly.
- [ ] CMS rich text and legal pages are sanitised on write **and** on read (`fix(api): sanitize legal page HTML`); JSON-LD output escapes `<` so CMS text cannot close the script tag.
- [ ] Open redirects: redirect targets (`/api/redirects`, `?next=`, locale switch) cannot be pointed at an arbitrary host by a visitor; only admins with `admin_portal.seo.update` set absolute targets.
- [ ] SSRF: no endpoint fetches a user-supplied URL (OG renderer and image proxy take keys, not URLs).

## 6. Transport, headers, configuration ↻
- [ ] securityheaders.com **A+** and SSL Labs **A+** for web, admin and API hostnames (HSTS, CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`).
- [ ] CSP report-only ran one week on staging with **no violations** on all 12 page templates before enforcing.
- [ ] Swagger disabled in production (`SWAGGER_ENABLED` empty); `/api/health` exposes no secrets or versions of internals; error responses carry no stack traces.
- [ ] CORS allows only the web and admin origins; CSRF/cookie domains match.
- [ ] `.env` files are `chmod 600`, not in git; GitHub environment secrets scoped per environment; no secret in image layers (`docker history`).
- [ ] MySQL is not published on a host port; only 80/443 (and SSH from known IPs) are open on the VPS; SSH password login disabled; automatic security updates on.
- [ ] Staging and preview hosts are `noindex` and not linked from production; staging uses its own database and e-mail sender.

## 7. Privacy (PDPL)
- [ ] Consent banner blocks all non-essential requests before consent (Playwright `consent.spec.ts`).
- [ ] Privacy export and erase work for a test lead and remove the person from outbox payloads and CSV exports; retention periods match `docs/compliance/record-of-processing.md`.
- [ ] Backups are encrypted (restic) and the restic password is held by the client, not only on the server.

## 8. Denial of service
- [ ] k6 runs (`tests/load/`) show no errors at 500 concurrent visitors; expensive endpoints (OG image, search, CSV import/export) have caching or limits and cannot be used to exhaust CPU (e.g. `/api/og` rejects unknown keys without rendering).
- [ ] Request body size limits are set; CSV import max 5,000 rows.

## Findings and risk acceptance

| # | Finding | Severity | Decision (fixed / accepted) | Evidence / owner / date |
| --- | --- | --- | --- | --- |
| | | | | |

Reviewer: ____________  Date: ________  Client acceptance of remaining risks: ____________
