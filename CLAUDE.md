<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## Roles

- **Claude**: planning only — constitution, specs, plans, tasks, and review of delivered work against Figma, the
  constitution and each feature's quickstart. Claude does not write application code.
- **agy**: implements every feature from its `tasks.md`, one git worktree and branch per feature, in reviewed batches.
- Area ownership per run: UI runs (001, 003) edit `packages/design-system/**` and `apps/web/**`; backend run (002) edits
  `packages/shared/**`, `apps/api/**`, `apps/admin/**`. Shared files (root `package.json`, `turbo.json`,
  `pnpm-lock.yaml`, `.github/workflows/**`) change in their own commit and are called out in the PR.

## Figma

File `1jzfujyx2OJ6EKDRD2X6Xm` (AA-CPA). Only frames on page **"Page 1"** are approved; homepage is
**"Homepage – with logo lines" (`411:169`)**; Sectors is `547:4555`. Never implement frames from other pages.
