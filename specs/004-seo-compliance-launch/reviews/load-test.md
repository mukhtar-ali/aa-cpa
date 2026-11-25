# Load test (T028)

Status: **NOT RUN.** Scripts: `tests/load/k6-{home,service,article,contact}.js`. Run from a machine outside the VPS against
**staging** only: `k6 run -e BASE_URL=https://staging.aacpa.sa tests/load/k6-home.js`.
Target (FR-033): 500 concurrent visitors, p95 < 1 s on cached pages, 0 errors.

| Script | VUs | p95 (ms) | Error rate | Cache hit % | Notes / tuning |
| --- | --- | --- | --- | --- | --- |
| home | 500 | | | | |
| service | 500 | | | | |
| article | 500 | | | | |
| contact | 500 | | | | |

Tuning applied (revalidate times, Caddy/CDN caching, container CPU/memory):
