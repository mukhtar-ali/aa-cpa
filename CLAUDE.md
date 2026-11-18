<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/001-design-system/plan.md` (with `research.md`, `data-model.md`, `contracts/components.md`,
`quickstart.md` in the same folder). Project principles: `.specify/memory/constitution.md`.
<!-- SPECKIT END -->

## Work split

- **agy**: UI — `packages/design-system/**`, `apps/web/**`, design-system e2e specs.
- **Claude**: backend — `packages/shared/**`, `apps/api/**`, `apps/admin/**`; reviews UI PRs against Figma,
  the constitution and quickstart validations.
- Shared files (root `package.json`, `turbo.json`, `pnpm-lock.yaml`, `.github/workflows/**`) change in their own
  commit and are called out in the PR.

## Figma

File `1jzfujyx2OJ6EKDRD2X6Xm` (AA-CPA). Only frames on page **"Page 1"** are approved; homepage is
**"Homepage – with logo lines" (`411:169`)**; Sectors is `547:4555`. Never implement frames from other pages.
