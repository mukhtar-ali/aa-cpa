import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { compile } from 'tailwindcss';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Guard (T050 / quickstart V2.6): compiles the real web app entry stylesheet
 * (`apps/web/src/assets/styles/tailwind.css`, which imports `@repo/design-system/styles.css`)
 * using Tailwind v4's `compile` API with candidates scanned from `packages/design-system/src/**\/*.tsx`.
 *
 * Proves:
 * 1. `@repo/design-system/styles.css` registers `packages/design-system/src` via `@source "../"`.
 * 2. Package-only utility classes (used in DS components, not in `apps/web`) are emitted in web CSS.
 * 3. Design token custom properties are defined exactly once (no missing or duplicated token blocks).
 */

const require = createRequire(import.meta.url);

const DS_ROOT = path.resolve(import.meta.dirname, '../..');
const REPO_ROOT = path.resolve(DS_ROOT, '../..');
const DS_SRC_DIR = path.join(DS_ROOT, 'src');
const WEB_ENTRY_CSS = path.join(REPO_ROOT, 'apps/web/src/assets/styles/tailwind.css');

const PACKAGE_ONLY_CLASSES = [
  'bg-bg-surface-ice',
  'rounded-section',
  'py-section-lg',
  'text-h1',
  'bg-action-primary',
  'shadow-button-primary',
] as const;

const SINGLETON_TOKEN_VARS = [
  '--color-bg-page',
  '--color-bg-surface-ice',
  '--color-action-primary',
  '--radius-section',
] as const;

function collectComponentTsxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectComponentTsxFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.tsx') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.stories.tsx')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanCandidatesFromTsx(files: string[]): Set<string> {
  const candidates = new Set<string>();
  const tokenPattern = /[A-Za-z0-9_:@/[\]\-!%.()]+/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(tokenPattern)) {
      candidates.add(match[0]);
    }
  }

  return candidates;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Guard: Tailwind scans @repo/design-system and emits package-only utilities in apps/web CSS', () => {
  let compiledCss = '';
  let compiledSources: { base: string; pattern: string; negated: boolean }[] = [];
  let scannedCandidates = new Set<string>();

  beforeAll(async () => {
    const dsPkg = JSON.parse(fs.readFileSync(path.join(DS_ROOT, 'package.json'), 'utf8')) as {
      exports?: Record<string, string>;
    };
    const stylesExport = dsPkg.exports?.['./styles.css'];
    if (!stylesExport) {
      throw new Error('packages/design-system/package.json is missing exports["./styles.css"]');
    }

    const dsStylesEntry = path.resolve(DS_ROOT, stylesExport);
    const tailwindCssEntry = require.resolve('tailwindcss/index.css');
    const webEntryContent = fs.readFileSync(WEB_ENTRY_CSS, 'utf8');

    const compiled = await compile(webEntryContent, {
      base: path.dirname(WEB_ENTRY_CSS),
      loadStylesheet: async (id, base) => {
        let resolvedPath: string;
        if (id === 'tailwindcss') {
          resolvedPath = tailwindCssEntry;
        } else if (id === '@repo/design-system/styles.css') {
          resolvedPath = dsStylesEntry;
        } else {
          resolvedPath = path.resolve(base, id);
        }

        return {
          path: resolvedPath,
          base: path.dirname(resolvedPath),
          content: fs.readFileSync(resolvedPath, 'utf8'),
        };
      },
    });

    compiledSources = compiled.sources;
    const componentFiles = collectComponentTsxFiles(DS_SRC_DIR);
    scannedCandidates = scanCandidatesFromTsx(componentFiles);
    compiledCss = compiled.build([...scannedCandidates]);
  });

  it('registers packages/design-system/src as a Tailwind @source from apps/web tailwind.css', () => {
    const resolvedDirs = compiledSources
      .filter((source) => !source.negated)
      .map((source) => path.resolve(source.base, source.pattern));

    expect(resolvedDirs).toContain(DS_SRC_DIR);
  });

  it.each(PACKAGE_ONLY_CLASSES)(
    'emits package-only class %s scanned from packages/design-system/src/**/*.tsx',
    (className) => {
      expect(
        scannedCandidates.has(className),
        `Expected ${className} to be used in packages/design-system/src/**/*.tsx`,
      ).toBe(true);

      const selectorRegex = new RegExp(`\\.${escapeRegExp(className)}\\s*\\{`);
      expect(
        selectorRegex.test(compiledCss),
        `Expected compiled apps/web CSS to emit a rule for .${className}`,
      ).toBe(true);
    },
  );

  it.each(SINGLETON_TOKEN_VARS)(
    'defines design token custom property %s exactly once in compiled apps/web CSS',
    (tokenVar) => {
      const defRegex = new RegExp(`${escapeRegExp(tokenVar)}\\s*:`, 'g');
      const matches = compiledCss.match(defRegex) ?? [];
      expect(
        matches.length,
        `Expected ${tokenVar} to be defined exactly once in compiled CSS, found ${matches.length}`,
      ).toBe(1);
    },
  );
});
