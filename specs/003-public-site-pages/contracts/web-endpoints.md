# Web app contracts (`apps/web`)

**Feature**: `003-public-site-pages`

## Routes

See spec "Page map". All page routes exist under `/{lang}` with `lang ∈ {ar, en}`; unknown `lang` → 404.
Redirects: `/` → `/{negotiated}`; `/{lang}/news/:path*` → `/{lang}/articles/:path*` (308).

## Route handlers

| Method & path | Caller | Request | Response |
| --- | --- | --- | --- |
| POST `/api/revalidate` | 002 API outbox | header `x-revalidate-secret: WEB_REVALIDATE_SECRET`; JSON `{ tags: string[] }` (max 50, each matching `^[a-z]+(:[a-z0-9-]+)?$`) | `200 { revalidated: string[] }`; `401` bad secret; `400` invalid body |
| GET `/api/preview?token=&path=` | editor's browser (link from admin) | `token` JWT issued by 002 `POST /api/preview/token` (verified with `PREVIEW_SECRET`, `exp` ≤ 15 min); `path` must start with `/ar/` or `/en/` | enables draft mode, `307` to `path`; `401` invalid/expired token |
| GET `/api/preview/exit?path=` | preview banner | — | disables draft mode, `307` to `path` |
| GET `/api/health` | uptime monitor (004) | — | `200 { status: 'ok', version }` |

## Server Actions (`apps/web/src/actions`)

| Action | Input (FormData fields) | Calls (002) | Result |
| --- | --- | --- | --- |
| `submitContact` | `ContactRequestSchema` fields + `lang` | `POST /api/contact` | `FormResult` |
| `submitApplication` | `JobApplicationSchema` fields + `resume` file + `slug` + `lang` | `POST /api/jobs/{slug}/apply` (multipart) | `FormResult` incl. `closed` |
| `estimate` | `{ answers }` | `POST /api/estimator/estimate` | `{ min, max, currency, disclaimer } \| error` |
| `requestQuote` | `QuoteRequestSchema` fields + `lang` | `POST /api/estimator/quote` | `FormResult` |

All actions forward `X-Forwarded-For` (visitor IP) and `Accept-Language`, map 422 field errors to `fieldErrors`, map
429 to a localized "too many attempts" message, and never expose API error internals.

## Analytics events (`apps/web/src/lib/analytics.ts`)

| Event | Properties | Fired when |
| --- | --- | --- |
| `page_view` | `path`, `lang`, `page_type` | route render (client) |
| `lead_submitted` | `source: 'contact'`, `service_id?`, `lang` | contact action success |
| `quote_requested` | `service_id?`, `range_band` (e.g. `25k-50k`), `lang` | quote action success |
| `estimate_completed` | `service_id?`, `lang` | estimate shown (GTM only, via 004; not sent to the monitoring endpoint — the API counts completions server-side) |
| `job_applied` | `department`, `lang` | application success |
| `contact_click` | `channel: 'phone' \| 'email' \| 'whatsapp'`, `location: 'header' \| 'footer' \| 'contact' \| 'float'` | link click |
| `article_shared` | `network: 'x' \| 'linkedin' \| 'whatsapp' \| 'copy'` | share action |

No names, emails, phones, free text or exact estimate values in any event. 003 sends events to the monitoring endpoint;
004 forwards them to GTM `dataLayer` only with analytics consent.
