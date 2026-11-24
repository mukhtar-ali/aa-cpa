# SEO & Rich Results Manual Validation Log

**Feature**: `004-seo-compliance-launch` (Task T019)  
**Date**: 2026-11-24  
**Status**: NOT RUN (Pending deployment to staging/production with seeded API)  
**Validator**: [Google Rich Results Test](https://search.google.com/test/rich-results) & [Schema.org Validator](https://validator.schema.org/)

---

## 1. Overview & Verification Protocol

Before final launch cutover, each public page template must be tested manually against Google's Rich Results Testing Tool and the Schema Markup Validator in both Arabic (`ar`) and English (`en`).

### Quality Criteria
- **Rich Results**: 0 errors, 0 warnings on supported schema types (`AccountingService`, `Organization`, `Service`, `Article`, `JobPosting`, `FAQPage`, `BreadcrumbList`).
- **Canonical URL**: Absolute URL matching the current locale and route.
- **Hreflang**: Bilateral tags for `ar`, `en`, and `x-default` pointing to `ar`.
- **OpenGraph & Twitter Cards**: Valid image preview (1200×630), title, description, and `og:locale:alternate`.

---

## 2. Template Validation Checklist

| Template | Locale | URL Under Test | Schema Type(s) Tested | Status | Notes / Errors |
| --- | --- | --- | --- | --- | --- |
| **Home** | `ar` | `https://staging.aacpa.sa/ar` | `AccountingService`, `Organization` | NOT RUN | SOCPA licence 522, 3E memberOf, logo, offices |
| **Home** | `en` | `https://staging.aacpa.sa/en` | `AccountingService`, `Organization` | NOT RUN | Bilingual parity |
| **About** | `ar` | `https://staging.aacpa.sa/ar/about` | `AccountingService`, `Organization`, `BreadcrumbList` | NOT RUN | Office locations (Riyadh HQ, Al-Khobar, Al-Qassim) |
| **About** | `en` | `https://staging.aacpa.sa/en/about` | `AccountingService`, `Organization`, `BreadcrumbList` | NOT RUN | Breadcrumb hierarchy & offices |
| **Services List** | `ar` | `https://staging.aacpa.sa/ar/services` | `BreadcrumbList` | NOT RUN | Indexable list |
| **Services List** | `en` | `https://staging.aacpa.sa/en/services` | `BreadcrumbList` | NOT RUN | Indexable list |
| **Service Detail** | `ar` | `https://staging.aacpa.sa/ar/services/audit` | `Service`, `BreadcrumbList`, `FAQPage` | NOT RUN | Provider link to organization, FAQ entities |
| **Service Detail** | `en` | `https://staging.aacpa.sa/en/services/audit` | `Service`, `BreadcrumbList`, `FAQPage` | NOT RUN | Provider link to organization, FAQ entities |
| **Sectors** | `ar` | `https://staging.aacpa.sa/ar/sectors` | `BreadcrumbList` | NOT RUN | Breadcrumbs |
| **Sectors** | `en` | `https://staging.aacpa.sa/en/sectors` | `BreadcrumbList` | NOT RUN | Breadcrumbs |
| **Articles List** | `ar` | `https://staging.aacpa.sa/ar/articles` | `BreadcrumbList` | NOT RUN | Listing page |
| **Articles List** | `en` | `https://staging.aacpa.sa/en/articles` | `BreadcrumbList` | NOT RUN | Listing page |
| **Article Detail** | `ar` | `https://staging.aacpa.sa/ar/articles/[slug]` | `Article`, `BreadcrumbList` | NOT RUN | Headline, datePublished, author, publisher |
| **Article Detail** | `en` | `https://staging.aacpa.sa/en/articles/[slug]` | `Article`, `BreadcrumbList` | NOT RUN | Headline, datePublished, author, publisher |
| **Careers List** | `ar` | `https://staging.aacpa.sa/ar/careers` | `BreadcrumbList` | NOT RUN | Listing page |
| **Careers List** | `en` | `https://staging.aacpa.sa/en/careers` | `BreadcrumbList` | NOT RUN | Listing page |
| **Job Detail** | `ar` | `https://staging.aacpa.sa/ar/careers/[slug]` | `JobPosting`, `BreadcrumbList` | NOT RUN | `validThrough` (= `closesAt`), `hiringOrganization`, `jobLocation` |
| **Job Detail** | `en` | `https://staging.aacpa.sa/en/careers/[slug]` | `JobPosting`, `BreadcrumbList` | NOT RUN | `validThrough` (= `closesAt`), `hiringOrganization`, `jobLocation` |
| **Contact** | `ar` | `https://staging.aacpa.sa/ar/contact` | `AccountingService`, `Organization`, `FAQPage`, `BreadcrumbList` | NOT RUN | PostalAddress, telephone, openingHours |
| **Contact** | `en` | `https://staging.aacpa.sa/en/contact` | `AccountingService`, `Organization`, `FAQPage`, `BreadcrumbList` | NOT RUN | PostalAddress, telephone, openingHours |
| **Privacy Policy** | `ar` | `https://staging.aacpa.sa/ar/privacy` | `BreadcrumbList` | NOT RUN | Legal template |
| **Privacy Policy** | `en` | `https://staging.aacpa.sa/en/privacy` | `BreadcrumbList` | NOT RUN | Legal template |
| **Terms** | `ar` | `https://staging.aacpa.sa/ar/terms` | `BreadcrumbList` | NOT RUN | Legal template |
| **Terms** | `en` | `https://staging.aacpa.sa/en/terms` | `BreadcrumbList` | NOT RUN | Legal template |
| **Accessibility** | `ar` | `https://staging.aacpa.sa/ar/accessibility` | `BreadcrumbList` | NOT RUN | Legal template |
| **Accessibility** | `en` | `https://staging.aacpa.sa/en/accessibility` | `BreadcrumbList` | NOT RUN | Legal template |

---

## 3. Robots & Sitemap Checks

| Resource | Environment | Expected Behavior | Status |
| --- | --- | --- | --- |
| `/robots.txt` | `production` | `Allow: /`, `Disallow: /api/`, `Disallow: /*/reference/`, `Sitemap: https://aacpa.sa/sitemap.xml` | NOT RUN |
| `/robots.txt` | `staging` / `preview` | `Disallow: /` | NOT RUN |
| `/sitemap.xml` | `production` | Valid XML, `ar` + `en` URLs, `xhtml:link` alternates incl `x-default=ar`, no draft/noindex items, lastmod from `updatedAt` | NOT RUN |

---

## 4. Playwright E2E Automation Notice

The automated test suite `e2e/specs/seo/seo.spec.ts` covers all verification checks above (canonical, hreflang, OG tags, JSON-LD schema parsing and @types, robots.txt, sitemap.xml).
To run against a live running stack:

```bash
pnpm --filter @repo/e2e test specs/seo/seo.spec.ts
```
