# Mobile navigation: client review (FR-031, task T054)

The approved Figma frames are desktop-only (1512 px). The header collapses below 1024 px into a menu button and a side sheet. This
is a team design and needs client sign-off before feature 003 wires it to pages.

## What to review (Storybook: Layout / Header, Layout / MobileNav)

| Viewport | Story | Check |
| --- | --- | --- |
| 360 px | Layout / Header / Phone360 | Logo at the start, menu button at the end, no horizontal scroll |
| 768 px | Layout / Header / Tablet768 | Still collapsed; the nav appears only from 1024 px |
| 1024 px | Layout / Header / Laptop1024 | Full desktop nav and call-to-action visible, no menu button |
| any | Layout / MobileNav (open it) | Sheet slides from the inline end (left in Arabic), links, call-to-action and language switch inside |

Behaviour already covered by tests: focus moves into the panel and stays trapped, Escape and the close button close it, focus returns to
the menu button, following a link closes it, the active page has `aria-current`.

## Open questions for the client

1. Is a side sheet from the inline end acceptable, or should it be a full-screen overlay?
2. Should the call-to-action stay inside the sheet or become a sticky bar on mobile?
3. Is the menu icon (three lines) acceptable? It is not from Figma.

## Decision

_Pending client review._ Record the date, reviewer and any requested changes here.
