# Email authentication runbook: SPF, DKIM, DMARC (feature 004, T010)

Goal: mail the site sends (lead and application notifications, confirmations) is delivered and authenticated **without
disturbing the client's existing mail** on `aacpa.sa` (research R10). Do not change MX records.

## Before touching DNS
1. Export the current zone (client/registrar) and keep it in the handover folder (T004).
2. Identify what already sends mail for the domain: MX host (Microsoft 365 / Google Workspace / other), existing SPF
   `TXT`, any DKIM selectors, existing DMARC `_dmarc` record.
3. Choose the sender: provider decision from T004 (Amazon SES `me-central-1`, or the existing 365/Workspace SMTP relay).
   Sender addresses: `noreply@aacpa.sa` (system), replies to `info@aacpa.sa`.

## Records (replace placeholders with the provider's values)

| Record | Host | Value | Notes |
| --- | --- | --- | --- |
| SPF | `aacpa.sa` TXT | **merge** into the existing record, e.g. `v=spf1 include:spf.protection.outlook.com include:amazonses.com -all` | Only **one** SPF record may exist; max 10 DNS lookups. Never add a second TXT. |
| DKIM (SES) | `<token1>._domainkey` CNAME ... 3 records | `<token1>.dkim.amazonses.com` | Easy DKIM from the SES console. Workspace/365: the selector TXT/CNAMEs from their admin. |
| Custom MAIL FROM (SES, optional) | `mail.aacpa.sa` MX + TXT | per SES console | Aligns the return-path for DMARC SPF alignment. |
| DMARC | `_dmarc.aacpa.sa` TXT | `v=DMARC1; p=none; rua=mailto:dmarc@aacpa.sa; fo=1; adkim=r; aspf=r` | Start at `p=none` (monitor only). |

## Staging
Configure the staging sender first (admin → Settings → Email on staging): same provider, a verified test address or
subdomain `staging.aacpa.sa` so test mail never uses the production reputation.

## Verification checklist
- [ ] `dig +short TXT aacpa.sa` shows exactly one SPF record and the merged includes.
- [ ] `dig +short CNAME <token>._domainkey.aacpa.sa` resolves for every DKIM selector.
- [ ] Provider console shows the domain/identity as **Verified** and DKIM **Successful**.
- [ ] Send a staging contact-form lead to `mail-tester.com`: score **≥ 9/10** (L6); headers show `spf=pass dkim=pass dmarc=pass`.
- [ ] Existing mail still works: send and receive between the client's mailboxes and an external address.
- [ ] A failed send shows in the admin outbox with its error and can be retried.

## Hardening after launch
1. Read DMARC aggregate reports (`rua`) for **2 weeks**; fix any legitimate sender that fails.
2. Move to `p=quarantine; pct=100`, then after a further clean period to `p=reject` (T039).
3. Keep SPF at `-all` only once every sender is listed; use `~all` while discovering senders.

## Troubleshooting
| Symptom | Likely cause |
| --- | --- |
| `spf=permerror` | two SPF records, or more than 10 lookups: merge/flatten |
| `dkim=none` | selector CNAME missing or the proxy (Cloudflare) is proxying it: set DNS-only |
| Lands in spam with all passes | new domain reputation, missing `Reply-To`, HTML-only message: warm up, check content |
| Provider sandbox | SES starts in sandbox: request production access (24 h lead time, do it early) |
