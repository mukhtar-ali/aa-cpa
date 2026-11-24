# Record of processing activities: aacpa.sa (feature 004, T032)

**DRAFT for review by the client and their legal advisor (PDPL, Saudi Arabia).** Prepared from how the system actually
works (database models and jobs in `apps/api`); legal bases, retention periods and processor details marked ⚠ need the
client's decision. Not legal advice.

- **Controller**: Abdulrahman Al-Shubaishiri Professional Consulting (SOCPA licence 522), Riyadh. Data protection contact: ⚠ name and e-mail.
- **Version**: 0.1 draft · **Last reviewed**: ________ · **Policy version shown to visitors**: `1.0` (T003)

## 1. Processing activities

| # | Activity | Personal data | Data subjects | Purpose | Legal basis ⚠ | Storage | Retention | Access |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Contact and quote requests (`contacts`) | full name, company, mobile, e-mail, message, selected service, estimator answers and range, language, landing path | prospects and clients | answer enquiries, prepare quotes | consent given on the form / steps at the data subject's request | MySQL (production VPS) | ⚠ proposed 24 months after last contact, then erased | roles with leads permission (admin portal) |
| 2 | Job applications (`job_applications`) | full name, e-mail, mobile, LinkedIn URL, motivation text, CV file (`resumeKey`), language | applicants | assess applications | consent given on the form | MySQL + uploads volume or S3 | **12 months by default** (`retentionMonths` in notification settings), purged daily at 03:00 by `purgeExpiredApplications` | roles with applications permission |
| 3 | Consent records (`consent_records`) | hashed e-mail, subject type/id, policy version, timestamp | form submitters | prove consent under PDPL | legal obligation | MySQL | ⚠ for the life of the related record plus limitation period | privacy officer / super admin |
| 4 | Email outbox (`email_outbox`) | recipient address, rendered notification payload (may include the data in #1/#2) | staff, submitters | deliver notifications and confirmations | legitimate interest / performance of the request | MySQL | ⚠ sent rows pruned after 90 days; failed rows until resolved | super admin |
| 5 | Staff accounts and audit | name, e-mail, role, login timestamps, notes added to leads | staff | operate the admin portal | contract / legitimate interest | MySQL | while employed; removed on departure | super admin |
| 6 | First-party monitoring (`monitoring_events`) | anonymous session id, page path, event names, web-vitals; no name/e-mail by design | visitors | detect errors, measure performance | legitimate interest (strictly necessary operation) | MySQL, aggregated into rollups | ⚠ raw events 90 days, rollups longer | developers, admin dashboard |
| 7 | Analytics (GA4 through GTM) | pseudonymous client id, IP (truncated by Google), pages, events (`lead_submitted`, `quote_requested`, `job_applied`, `contact_click`) | visitors who accept the **analytics** category | measure site use and conversions | **consent** (banner, Consent Mode v2) | Google (processor) | GA4 data retention set to ⚠ 14 months | marketing owner |
| 8 | Marketing pixel (Meta), only if the client supplies one | cookie ids, pages, events | visitors who accept **marketing** | advertising measurement | **consent** | Meta (processor/controller) | per Meta | marketing owner |
| 9 | Consent choice cookie `aacpa_consent` | choices, policy version, timestamp (in the browser only) | visitors | remember choices | strictly necessary | visitor's browser | 12 months | n/a |
| 10 | Server and proxy logs | IP address, user agent, URL, status | visitors | security, troubleshooting | legitimate interest | Docker logs on the VPS (rotated, 5 × 10 MB per container) | days (rotation) | system administrator |
| 11 | Backups | everything above | all | disaster recovery | legitimate interest | restic repository, encrypted, off-site (⚠ bucket and region) | 30 daily + 12 monthly snapshots | system administrator holding the restic password |

## 2. Processors and transfers ⚠ (confirm contracts and DPAs)

| Processor | Service | Data | Location |
| --- | --- | --- | --- |
| VPS provider ⚠ | hosting | all | ⚠ region (prefer KSA/GCC) |
| Backup storage ⚠ (AWS S3 me-central-1 / Backblaze) | off-site backups | encrypted | ⚠ |
| E-mail provider ⚠ (SES / Microsoft 365 / Google Workspace) | notifications | recipient + content | ⚠ |
| Google (GTM, GA4) | analytics, after consent | pseudonymous usage | outside KSA: needs PDPL transfer basis ⚠ |
| Meta (optional) | pixel, after consent | cookie ids | outside KSA ⚠ |
| Cloudflare Turnstile / CDN ⚠ if used | anti-spam, caching | IP, request metadata | ⚠ |

## 3. Data subject rights: how they are served

| Right | Procedure | Tooling |
| --- | --- | --- |
| Access / copy | Verify identity by e-mail reply; admin → Privacy → Export for the person's e-mail; send within ⚠ 30 days | `privacy.controller` export |
| Correction | Edit the lead/application in admin | admin portal |
| Erasure / withdrawal | Admin → Privacy → Erase; removes contacts, applications and CV files; an erasure log keeps only a hash of the e-mail | `privacy.service`, erasure log |
| Withdraw cookie consent | Footer "Cookie settings" | consent banner |
| Complaint | Policy names the contact and the Saudi Data & AI Authority (SDAIA) | privacy policy |

## 4. Security measures (summary)
TLS everywhere with HSTS; encrypted off-site backups; role-based admin access with per-permission checks; rate limiting and anti-spam on forms;
content-sniffed uploads with random names; secrets in server-side env files (mode 600); CSP and security headers; weekly dependency and image
scans; uptime and host monitoring; restore and rollback drills. Details: `docs/launch/security-review.md`.

## 5. Open decisions for the client
1. Retention for contacts/leads (row 1) and outbox (row 4).
2. Data protection contact and the exact wording in the privacy policy.
3. Hosting, backup and e-mail provider regions; basis for transfers to Google/Meta.
4. Whether a Data Protection Impact Assessment or registration with the regulator is required for this processing.
