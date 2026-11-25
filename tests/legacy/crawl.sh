#!/usr/bin/env bash
# Legacy URL inventory (feature 004, T004a, research R4b). Builds the list of every URL the OLD aacpa.sa site serves, so each can be
# mapped to its new equivalent in docs/launch/legacy-redirects.csv before cutover.
#
#   tests/legacy/crawl.sh https://old.aacpa.sa [extra-urls.txt ...]
#
# Sources merged (de-duplicated, query strings and fragments dropped, lower-cased, trailing slash removed):
#   1. a spider crawl of the old site (wget --spider, same host only)
#   2. the old sitemap(s) listed in /robots.txt, or /sitemap.xml
#   3. any extra files you pass: one URL or path per line (export top pages from the old Search Console / analytics,
#      top backlinked pages from Search Console "Links", old social posts)
# Output: tests/legacy/out/legacy-urls.txt (paths only) and a draft docs/launch/legacy-redirects.csv if none exists.
set -euo pipefail
BASE="${1:?usage: crawl.sh https://old-site [extra-url-files...]}"; shift || true
BASE="${BASE%/}"
HOST="$(printf '%s' "$BASE" | sed -E 's#^https?://([^/]+).*#\1#')"
OUT="$(cd "$(dirname "$0")" && pwd)/out"; mkdir -p "$OUT"
norm() { sed -E 's/[?#].*$//' | sed -E "s#^https?://[^/]+##" | tr 'A-Z' 'a-z' | sed -E 's#/+$##' | sed -E 's#^$#/#' | grep -E '^/' || true; }

echo "[1/3] crawling $BASE (polite: 1 request/second)"
wget --spider --recursive --level=6 --no-verbose --wait=1 --random-wait --no-parent \
     --domains="$HOST" --reject-regex '\.(jpe?g|png|gif|svg|webp|ico|css|js|woff2?|ttf|map|mp4|zip)(\?.*)?$' \
     --user-agent="aacpa-migration-inventory" "$BASE/" 2>&1 \
  | grep -oE 'https?://[^ ]+' | sort -u > "$OUT/crawl.raw" || true

echo "[2/3] reading sitemaps"
: > "$OUT/sitemap.raw"
sitemaps="$(curl -fsS "$BASE/robots.txt" 2>/dev/null | grep -i '^sitemap:' | awk '{print $2}' || true)"
[ -z "$sitemaps" ] && sitemaps="$BASE/sitemap.xml"
for sm in $sitemaps; do
  curl -fsS "$sm" 2>/dev/null | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g' >> "$OUT/sitemap.raw" || true
done

echo "[3/3] merging"
{ cat "$OUT/crawl.raw" "$OUT/sitemap.raw"; for f in "$@"; do cat "$f"; done; } | norm | sort -u > "$OUT/legacy-urls.txt"
wc -l "$OUT/legacy-urls.txt"

CSV="$(cd "$(dirname "$0")/../.." && pwd)/docs/launch/legacy-redirects.csv"
if [ ! -f "$CSV" ]; then
  { echo 'from,to,type'; sed -E 's#$#,,permanent#' "$OUT/legacy-urls.txt"; } > "$CSV"
  echo "Draft written to $CSV: fill the 'to' column (new path such as /ar/services/audit), the client reviews it."
else
  echo "Existing $CSV kept. New paths not yet in it:"
  comm -23 "$OUT/legacy-urls.txt" <(tail -n +2 "$CSV" | cut -d, -f1 | sort -u) || true
fi
