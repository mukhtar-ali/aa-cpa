# Analytics, Consent Mode & GTM Setup Guide

This document describes the event tracking architecture, Google Consent Mode v2 integration, Google Tag Manager (GTM) container configuration, and Google Analytics 4 (GA4) conversion setup for the AA-CPA production website.

---

## 1. Event Catalogue

All client-side events originate from `apps/web/src/lib/analytics.ts`. Events are dispatched to `window.dataLayer` **only when analytics consent has been granted** via the first-party `aacpa_consent` cookie.

### Privacy Guardrails (Strict PDPL Compliance)
- **Zero PII**: Under no circumstances are visitor names, email addresses, phone numbers, or free-text messages pushed to `dataLayer` or external tools.
- Payload sanitization strips sensitive keys before pushing to `window.dataLayer`.

### Supported Events & Payloads

| Event Name | Trigger | Properties | Purpose |
|---|---|---|---|
| `lead_submitted` | Visitor submits the general contact inquiry form | `source: 'contact'`<br>`service_id?: string`<br>`lang: 'ar' \| 'en'` | Primary business conversion |
| `quote_requested` | Visitor requests a quote from the fee estimator | `service_id?: string`<br>`range_band: string`<br>`lang: 'ar' \| 'en'` | High-intent lead generation |
| `estimate_completed` | Visitor completes calculation in the fee estimator | `service_id?: string`<br>`lang: 'ar' \| 'en'` | Pricing interaction engagement |
| `job_applied` | Candidate submits career application | `department: string`<br>`lang: 'ar' \| 'en'` | Recruitment conversion |
| `contact_click` | Visitor clicks a direct contact channel | `channel: 'phone' \| 'email' \| 'whatsapp'`<br>`location: 'header' \| 'footer' \| 'contact' \| 'float'` | Channel preference tracking |
| `article_shared` | Visitor clicks a social sharing link | `network: 'x' \| 'linkedin' \| 'whatsapp' \| 'copy'` | Content amplification |

---

## 2. Google Consent Mode v2 & Category Gating

The site implements Google Consent Mode v2 directly:

1. **Default State**:
   Before any script or tag executes, an inline script in `<head>` sets default permissions to `denied` with a 500 ms wait buffer:
   ```javascript
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag('consent', 'default', {
     'ad_storage': 'denied',
     'ad_user_data': 'denied',
     'ad_personalization': 'denied',
     'analytics_storage': 'denied',
     'wait_for_update': 500
   });
   ```

2. **Gated Loading**:
   - `GTM` / `GA4` script is **not loaded** until the visitor grants `analytics` consent.
   - `Meta Pixel` is **not loaded** until the visitor grants `marketing` consent.

3. **Choice & Updates**:
   When preferences change or the user accepts/rejects:
   ```javascript
   gtag('consent', 'update', {
     'analytics_storage': granted ? 'granted' : 'denied',
     'ad_storage': granted ? 'granted' : 'denied',
     'ad_user_data': granted ? 'granted' : 'denied',
     'ad_personalization': granted ? 'granted' : 'denied'
   });
   ```

4. **Withdrawal**:
   When consent is revoked or rejected, tracking cookies (`_ga*`, `_gid`, `_fbp`, `_fbc`) are deleted immediately from first-party domains.

---

## 3. Google Tag Manager (GTM) Container Setup

### 3.1 Variables
Create User-Defined Data Layer Variables:
- `dlv - service_id` (Data Layer Variable Name: `service_id`)
- `dlv - range_band` (Data Layer Variable Name: `range_band`)
- `dlv - department` (Data Layer Variable Name: `department`)
- `dlv - channel` (Data Layer Variable Name: `channel`)
- `dlv - location` (Data Layer Variable Name: `location`)
- `dlv - lang` (Data Layer Variable Name: `lang`)

### 3.2 Triggers (Custom Events)
- **CE - lead_submitted**: Event name = `lead_submitted`
- **CE - quote_requested**: Event name = `quote_requested`
- **CE - estimate_completed**: Event name = `estimate_completed`
- **CE - job_applied**: Event name = `job_applied`
- **CE - contact_click**: Event name = `contact_click`

### 3.3 Tags & Consent Settings
1. **Google Tag (GA4 Base Configuration)**:
   - Tag Type: Google Tag
   - Tag ID: `{{GA4 Measurement ID}}` (e.g. `G-XXXXXXXXXX`)
   - Trigger: Initialization - All Pages (or All Pages)
   - Consent Settings: Built-in consent check requires `analytics_storage`.

2. **GA4 Event - Lead Submitted**:
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `lead_submitted`
   - Event Parameters:
     - `service_id`: `{{dlv - service_id}}`
     - `source`: `contact`
     - `lang`: `{{dlv - lang}}`
   - Trigger: `CE - lead_submitted`
   - Consent: Require `analytics_storage`.

3. **GA4 Event - Quote Requested**:
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `quote_requested`
   - Event Parameters:
     - `service_id`: `{{dlv - service_id}}`
     - `range_band`: `{{dlv - range_band}}`
     - `lang`: `{{dlv - lang}}`
   - Trigger: `CE - quote_requested`
   - Consent: Require `analytics_storage`.

4. **GA4 Event - Job Applied**:
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `job_applied`
   - Event Parameters:
     - `department`: `{{dlv - department}}`
     - `lang`: `{{dlv - lang}}`
   - Trigger: `CE - job_applied`
   - Consent: Require `analytics_storage`.

5. **GA4 Event - Contact Click**:
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `contact_click`
   - Event Parameters:
     - `channel`: `{{dlv - channel}}`
     - `location`: `{{dlv - location}}`
   - Trigger: `CE - contact_click`
   - Consent: Require `analytics_storage`.

6. **Meta Pixel Tag (if configured)**:
   - Custom HTML or Meta Pixel Template
   - Trigger: All Pages / Lead Custom Events
   - Consent Settings: Additional Consent Checks -> Require `ad_storage`, `ad_personalization`, `ad_user_data`.

---

## 4. GA4 Conversions & Custom Dimensions

In the Google Analytics 4 Admin interface:

### 4.1 Key Events (Conversions)
Navigate to **Admin > Property display > Events** and toggle as **Key Event**:
- `lead_submitted`
- `quote_requested`
- `job_applied`

### 4.2 Custom Dimensions
Navigate to **Admin > Custom definitions > Custom dimensions > Create custom dimension**:
- Dimension Name: `Service ID` | Event parameter: `service_id` | Scope: Event
- Dimension Name: `Range Band` | Event parameter: `range_band` | Scope: Event
- Dimension Name: `Department` | Event parameter: `department` | Scope: Event
- Dimension Name: `Contact Channel` | Event parameter: `channel` | Scope: Event
- Dimension Name: `Contact Location` | Event parameter: `location` | Scope: Event
- Dimension Name: `Content Language` | Event parameter: `lang` | Scope: Event

---

## 5. Verification & GA4 DebugView Guide

Follow these steps to verify tracking in staging or production before sign-off:

1. **Step 1: Fresh Profile Verification (No Consent)**
   - Open an incognito browser window or clear all cookies.
   - Open Developer Tools > Network tab (filter by `google-analytics.com`, `googletagmanager.com`, `facebook.net`).
   - Navigate to the homepage.
   - **Verification**: No requests must be sent to `google-analytics.com/g/collect` or `facebook.net`. Inspect `document.cookie` to confirm no `_ga*` or `_fbp` cookies are set.
   - In console: inspect `dataLayer` to verify `gtag('consent', 'default', { ... denied ... })` has fired.

2. **Step 2: Analytics Consent Granted**
   - Click "Accept all" or open "Preferences" and select only "Analytics".
   - **Verification**: GTM and GA4 scripts load. `dataLayer` receives `consent, update, { analytics_storage: 'granted' }`.

3. **Step 3: GA4 DebugView Live Testing**
   - Enable GTM Preview mode or append `?_dbg=1` to the URL.
   - Navigate to GA4 Admin > **DebugView**.
   - Trigger test actions:
     - Click the WhatsApp floating button -> observe `contact_click` event in DebugView with `channel: 'whatsapp'` and `location: 'float'`.
     - Fill and submit the Contact form -> observe `lead_submitted` event with `service_id` and `source: 'contact'`.
     - Confirm that no `name`, `email`, or `phone` parameter appears in the DebugView event details.

4. **Step 4: Withdrawal & Cookie Deletion**
   - Click the "Cookie settings" / "إعدادات ملفات الارتباط" link in the footer.
   - Turn off Analytics or click "Reject all".
   - **Verification**: `gtag('consent', 'update', { analytics_storage: 'denied' })` is emitted. Inspect `document.cookie` to confirm `_ga*` cookies have been deleted. Future page navigations do not fire GA4 events.
