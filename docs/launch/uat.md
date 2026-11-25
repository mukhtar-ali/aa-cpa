# User acceptance test script (feature 004, T036)

Executed by the client on **staging** with production content, in Arabic first and then English, on a phone and a laptop.
Each row: result **Pass / Fail / Blocked**, tester initials, note or screenshot. Failures get a ticket; the sign-off table at the end
lists any accepted deviations. Journeys come from `specs/003-public-site-pages` (P1–P5) and 004's launch gates.

| # | Journey | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | First visit | Open `/` in a fresh browser | Arabic site, consent banner appears, nothing blocks the first screen | | |
| 2 | Language | Switch ar ↔ en on three different pages | Same page in the other language; choice remembered next visit | | |
| 3 | Find a service | Home → Services → open a service | Correct content, breadcrumb, related items, contact call-to-action | | |
| 4 | Request a quote | From a service click the quote button, fill the form, submit | Confirmation shown; lead visible in admin; confirmation e-mail received | | |
| 5 | Contact | Contact page: submit with a mistake, correct it, submit | Clear field errors, then success; lead in admin with the right service | | |
| 6 | Estimator | Complete the estimator with two different inputs | Prices match the approved table; result can be sent to the firm | | |
| 7 | Read an article | Articles → filter by sector → open an article → share | Filter works, pagination, share link shows the right title and image | | |
| 8 | Apply for a job | Careers → open a job → apply with a CV (PDF) | Success message; application and CV visible in admin | | |
| 9 | Closed job | Open a job whose closing date has passed | Application is not possible; message is clear | | |
| 10 | Offices | Contact page: each office's address, phone, hours, map link | Match the client's official details | | |
| 11 | Legal pages | Privacy, Terms, Accessibility in both languages | Approved text, version shown, links work | | |
| 12 | Cookie choices | Reject all; reload; open "Cookie settings" in the footer; accept analytics only | No tracking before consent; choices persist; withdrawal works | | |
| 13 | Search appearance | Share the home URL in WhatsApp/LinkedIn | Title, description and image appear correctly in Arabic | | |
| 14 | Old links | Open five links from the old website | Each lands on the matching new page (no 404) | | |
| 15 | Not found | Open `/ar/does-not-exist` | Branded 404 with a way back | | |
| 16 | Keyboard and zoom | Use Tab only on home and contact; zoom 200 % | Every control reachable, focus visible, nothing overlaps | | |
| 17 | Admin: publish | Log in, edit an article title, publish | Public page updates within 60 s | | |
| 18 | Admin: preview | Open the preview link of a draft | Draft shown with a banner; not indexable | | |
| 19 | Admin: leads | Open the lead from #4, change status, export CSV | Status saved; CSV opens cleanly in Excel with Arabic text intact | | |
| 20 | Admin: roles | Log in as an editor | Cannot see user/role management or settings reserved for admins | | |
| 21 | Privacy request | In admin, export and erase a test person's data | Export lists their records; erase removes them | | |
| 22 | Speed | Open home on mobile data | Meaningful content within about 2 seconds | | |

## Sign-off
Open defects accepted for launch (ticket, reason): ____________________________

Client representative: ____________  Date: ________  Signature: ____________
Project manager: ____________  Date: ________
