# Consent & SEO output contract (004, web)

## Consent

- Categories: `necessary` (always), `analytics` (GA4), `marketing` (Meta pixel / ads, only if configured).
- Before any choice: inline Consent Mode v2 defaults
  `gtag('consent','default',{ ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', wait_for_update: 500 })`;
  GTM container script is NOT loaded until at least one category is granted.
- On choice: `gtag('consent','update', …)` with granted categories, cookie `aacpa_consent` written (data-model), GTM loaded
  if needed. Withdrawal: update to denied, delete `_ga*`/`_fbp` cookies, stop loading on next navigation.
- `consentVersion` change → banner shown again.
- UI: DS `ConsentBanner` (bottom, non-modal, does not cover primary CTA on mobile), `ConsentPreferences` (dialog),
  footer link "Cookie settings" / "إعدادات ملفات الارتباط". Copy from CMS (`seo-global.consentTexts`, bilingual).

## SEO output per page (from `buildMetadata` + `JsonLd`)

| Element | Rule |
| --- | --- |
| `<title>` | `{page/entity metaTitle or title} | {site name}`; ≤ 60 chars target |
| meta description | `metaDescription` or summary; 120–160 chars target |
| canonical | absolute production URL of the current language; listing filters canonicalize to the unfiltered page except `?category=` (indexable) and `?page>1` (self-canonical) |
| alternates | `ar`, `en`, `x-default` → `ar` |
| robots | `noindex,nofollow` outside production, in draft mode, for `noindex` items, for `/reference/*` |
| Open Graph | `og:title`, `og:description`, `og:image` (ogImage or `/api/og`), `og:locale` `ar_SA`/`en_US`, `og:locale:alternate` |
| JSON-LD | per research R1 types; one `BreadcrumbList` on inner pages |
