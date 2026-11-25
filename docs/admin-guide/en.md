# Admin guide: aacpa.sa (English)

For the firm's staff. Admin portal: **https://admin.aacpa.sa**. Menu names below match the left-hand menu; screens may differ
slightly after updates. Every change you publish appears on the public site within about a minute, in both languages.

## 1. Signing in and your account
1. Open the admin address and sign in with your e-mail and password. After 10 failed attempts you are locked out for 15 minutes.
2. **User Preferences → Profile / Account**: change your name, password and language. Use a long, unique password.
3. What you see depends on your **role**. If a menu item is missing, you do not have that permission; ask an administrator.

## 2. Publish an article (Articles & Insights)
1. **Articles & Insights → New**. Fill the **Arabic and English** tabs: title, slug (the address part; lower-case, no spaces), summary, body.
2. Choose the **category**, **author**, **sector** and the cover image (add alt text in both languages and the licence note).
3. Open the **SEO** block: meta title (about 60 characters), meta description (120–160), optional social image. The preview shows how Google will display it.
4. Click **Preview** to see the draft exactly as visitors will, with a "draft" banner; it is never indexed.
5. Set the publish date (a future date schedules it) and status **Published**, then Save. Check the live page in both languages.
6. Changing a slug later is safe: the old address redirects automatically to the new one.

## 3. Update a service or sector (Services, Sectors)
Open the item, edit the Arabic and English text, FAQs and related content, keep titles unique, then Save. Reorder with the list's order field.
A service marked unpublished disappears from the site and from search results after the next refresh.

## 4. Manage leads (Leads & PDPL, Contact Submissions)
1. **Leads & PDPL** lists contact and quote requests with source, service and landing page. Filter by status, source or date.
2. Open a lead to read the message and, for quote requests, the fee estimate the visitor saw.
3. Set the **status** (new → contacted → qualified → closed; use **spam** for junk), **assign** it to a colleague and add **notes**. Notes are internal.
4. **Export CSV** for reporting. Open exports in a spreadsheet only from trusted sources; the export neutralises formulas for safety.
5. Respond within your agreed time. A lead whose notification e-mail failed is flagged under **Notifications & Retention → Outbox**: press **Retry**.

## 5. Job applications (Careers & Jobs)
1. **Careers & Jobs**: create a job (Arabic and English text, department, location, type, closing date). After the closing date applying is disabled automatically.
2. Open a job to see its applications: read the details, download the CV, change the status (pending, reviewed, shortlisted, interview, offer, hired, rejected), assign and note.
3. Applications are **deleted automatically after 12 months** (configurable under Notifications & Retention). Download anything you must keep before then.

## 6. Privacy requests: export and erase (Leads & PDPL)
1. When a person asks for a copy of their data: confirm their identity by e-mail reply, then **Leads & PDPL → Privacy → Export** with their e-mail address. Send the file securely.
2. For erasure or withdrawal of consent: **Privacy → Erase** with their e-mail. It removes their contact requests, applications and CV files; a log keeps only an irreversible hash of the e-mail as proof.
3. Answer within the period set in the privacy policy (proposed 30 days). Keep the request e-mail.
4. Cookie choices are the visitor's own (footer "Cookie settings"); nothing to do in the portal.

## 7. Roles and users (Users)
1. **Users → New**: name, e-mail, role. The person receives a link to set a password.
2. Roles group permissions (for example Editor: content only; Lead manager: leads and applications; Administrator: everything including users and settings). Give the least access needed.
3. Deactivate a leaver the same day. Never share accounts.

## 8. Redirects
**Redirects → New**: from path (for example `/old-page`) to new path (`/ar/services/audit`), permanent (308) or temporary (307). The system rejects loops and joins chains. Bulk: **Import CSV** with columns `from,to,type`; all rows are checked first and nothing is saved if any row has an error. After launch, open the list sorted by **hits** weekly and add redirects for addresses that people still use.

## 9. Site settings
- **General Info / Social Media**: contact details, offices and social links shown in the footer and in search results.
- **SEO Settings / Site SEO & Tracking**: default titles, social image, Google Tag Manager and Analytics IDs, consent version (increase it to ask every visitor again after a policy change).
- **Email Settings / Notifications & Retention**: sender, recipients of lead notifications, retention period.
- **Spam & Bot Protection**: anti-spam options for the forms.
- **Fee Estimator**: prices and ranges. Only approved prices are published; keep the draft flag on while editing.

## 10. Good practice checklist
- Fill **both languages** before publishing; the site shows Arabic-only items only in Arabic.
- Every image needs alt text in both languages and a licence note.
- Unique title and description on every page; no duplicate slugs.
- After publishing, open the live page on a phone.
- Never paste personal data from leads into articles or e-mails to third parties.

## 11. Getting help
Support contact and hours: ____________ . For an outage, call the escalation number on the go-live sheet.

---
*PDF export:* `pandoc docs/admin-guide/en.md -o docs/admin-guide/en.pdf --pdf-engine=xelatex` (Arabic: `pandoc docs/admin-guide/ar.md -o docs/admin-guide/ar.pdf --pdf-engine=xelatex -V dir=rtl -V mainfont="Noto Naskh Arabic"`).
