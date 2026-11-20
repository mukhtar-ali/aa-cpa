import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const COMPONENT_GROUPS = ['primitives', 'forms', 'layout', 'sections'] as const;

const FIGMA_DESIGN_URL_PATTERN =
  /^https:\/\/www\.figma\.com\/design\/1jzfujyx2OJ6EKDRD2X6Xm\/AA-CPA\?node-id=\d+-\d+$/;

/**
 * Component folders that intentionally have no Figma design node (utilities/providers).
 * Keep this list tiny and comment every entry.
 */
const NO_FIGMA_NODE: ReadonlySet<string> = new Set([
  'VisuallyHidden', // Screen-reader-only utility; no Figma node.
  'DesignSystemProvider', // Context & Radix DirectionProvider utility; no Figma node.
]);

/**
 * Non-visual provider utility applied globally in `.storybook/preview.tsx` and re-exported directly
 * from `src/layout/index.ts`, so it has no standalone story file or folder barrel `index.ts`.
 */
const UTILITY_WITHOUT_STANDALONE_STORY: ReadonlySet<string> = new Set([
  'layout/DesignSystemProvider',
]);

/**
 * Form-control folders whose stories and unit tests are intentionally colocated with their parent
 * family folder (`forms/Field`). Each entry is verified to be imported by that family's
 * `*.stories.tsx` and `*.test.tsx` so coverage cannot silently disappear.
 */
const SHARED_FAMILY_COVERAGE: Readonly<Record<string, string>> = {
  'forms/Select': 'forms/Field',
  'forms/Textarea': 'forms/Field',
  'forms/TextInput': 'forms/Field',
};

interface ComponentFolder {
  group: (typeof COMPONENT_GROUPS)[number];
  name: string;
  key: string;
  dir: string;
  files: string[];
}

function discoverComponentFolders(srcDir: string): ComponentFolder[] {
  const folders: ComponentFolder[] = [];

  for (const group of COMPONENT_GROUPS) {
    const groupDir = path.join(srcDir, group);
    if (!fs.existsSync(groupDir)) continue;

    const entries = fs
      .readdirSync(groupDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const dir = path.join(groupDir, entry.name);
      const files = fs.readdirSync(dir).sort();
      folders.push({
        group,
        name: entry.name,
        key: `${group}/${entry.name}`,
        dir,
        files,
      });
    }
  }

  return folders;
}

/**
 * Strip JS/TS comments while preserving string literals (so URLs like `https://...` stay intact).
 */
function stripComments(source: string): string {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const ch = source[i]!;
    const next = source[i + 1];

    // String literals: single, double, or template
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      out += ch;
      i += 1;
      while (i < source.length) {
        const c = source[i]!;
        out += c;
        if (c === '\\' && i + 1 < source.length) {
          out += source[i + 1]!;
          i += 2;
          continue;
        }
        i += 1;
        if (c === quote) break;
      }
      continue;
    }

    // Single-line comment
    if (ch === '/' && next === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }

    // Block comment
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') out += '\n';
        i += 1;
      }
      i += 2;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

/**
 * Extract the balanced `{ ... }` block for a named object property (e.g. `parameters: { ... }`).
 */
function extractObjectPropertyBlock(source: string, propertyName: string): string | null {
  const propRegex = new RegExp(`\\b${propertyName}\\s*:\\s*\\{`);
  const match = propRegex.exec(source);
  if (!match) return null;

  const openBraceIndex = match.index + match[0].length - 1;
  let depth = 0;
  let i = openBraceIndex;

  while (i < source.length) {
    const ch = source[i]!;

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      i += 1;
      while (i < source.length) {
        if (source[i] === '\\') {
          i += 2;
          continue;
        }
        if (source[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBraceIndex, i + 1);
      }
    }

    i += 1;
  }

  return null;
}

/**
 * Extract `parameters.design.url` from a Storybook story file's source text.
 */
export function extractStoryDesignUrl(source: string): string | null {
  const code = stripComments(source);
  const parametersBlock = extractObjectPropertyBlock(code, 'parameters');
  if (!parametersBlock) return null;

  const designBlock = extractObjectPropertyBlock(parametersBlock, 'design');
  if (!designBlock) return null;

  const urlMatch = /\burl\s*:\s*(['"])([^'"]+)\1/.exec(designBlock);
  return urlMatch?.[2] ?? null;
}

describe('Guard: stories, tests, barrels, and Figma design URLs coverage', () => {
  const srcDir = path.resolve(import.meta.dirname, '..');
  const folders = discoverComponentFolders(srcDir);

  it('discovers component folders across primitives, forms, layout, and sections', () => {
    expect(folders.length).toBeGreaterThan(0);
  });

  it('every component folder has an index.ts barrel (or is a documented utility exported directly)', () => {
    const offenders: string[] = [];

    for (const folder of folders) {
      if (folder.files.includes('index.ts')) continue;

      if (UTILITY_WITHOUT_STANDALONE_STORY.has(folder.key)) {
        const groupBarrel = fs.readFileSync(path.join(srcDir, folder.group, 'index.ts'), 'utf8');
        if (!groupBarrel.includes(folder.name)) {
          offenders.push(`${folder.key}: missing from ${folder.group}/index.ts`);
        }
        continue;
      }

      offenders.push(`${folder.key}: missing index.ts`);
    }

    expect(
      offenders,
      `Component folders missing index.ts:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('every component folder has a colocated *.test.tsx (or verified shared family test)', () => {
    const offenders: string[] = [];

    for (const folder of folders) {
      const testFiles = folder.files.filter((file) => file.endsWith('.test.tsx'));
      if (testFiles.length > 0) continue;

      const familyKey = SHARED_FAMILY_COVERAGE[folder.key];
      if (familyKey) {
        const familyDir = path.join(srcDir, familyKey);
        const familyTests = fs.existsSync(familyDir)
          ? fs.readdirSync(familyDir).filter((file) => file.endsWith('.test.tsx'))
          : [];
        const covered = familyTests.some((file) =>
          fs.readFileSync(path.join(familyDir, file), 'utf8').includes(`../${folder.name}`),
        );
        if (covered) continue;
        offenders.push(`${folder.key}: mapped to ${familyKey}, but ${familyKey}/*.test.tsx does not import ../${folder.name}`);
        continue;
      }

      offenders.push(`${folder.key}: missing *.test.tsx`);
    }

    expect(
      offenders,
      `Component folders missing unit tests:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('every component folder has a *.stories.tsx with a valid Figma parameters.design.url', () => {
    const offenders: string[] = [];

    for (const folder of folders) {
      const storyFiles = folder.files.filter((file) => file.endsWith('.stories.tsx'));

      if (storyFiles.length === 0) {
        if (UTILITY_WITHOUT_STANDALONE_STORY.has(folder.key)) {
          continue;
        }

        const familyKey = SHARED_FAMILY_COVERAGE[folder.key];
        if (familyKey) {
          const familyDir = path.join(srcDir, familyKey);
          const familyStories = fs.existsSync(familyDir)
            ? fs.readdirSync(familyDir).filter((file) => file.endsWith('.stories.tsx'))
            : [];
          const covered = familyStories.some((file) => {
            const content = fs.readFileSync(path.join(familyDir, file), 'utf8');
            const url = extractStoryDesignUrl(content);
            return (
              content.includes(`../${folder.name}`) &&
              (NO_FIGMA_NODE.has(folder.name) || (url !== null && FIGMA_DESIGN_URL_PATTERN.test(url)))
            );
          });
          if (covered) continue;
          offenders.push(
            `${folder.key}: mapped to ${familyKey}, but ${familyKey}/*.stories.tsx does not import ../${folder.name} with a valid Figma parameters.design.url`,
          );
          continue;
        }

        offenders.push(`${folder.key}: missing *.stories.tsx`);
        continue;
      }

      if (NO_FIGMA_NODE.has(folder.name)) {
        continue;
      }

      for (const storyFile of storyFiles) {
        const storyPath = path.join(folder.dir, storyFile);
        const content = fs.readFileSync(storyPath, 'utf8');
        const url = extractStoryDesignUrl(content);

        if (!url) {
          offenders.push(`${folder.key}/${storyFile}: missing parameters.design.url`);
        } else if (!FIGMA_DESIGN_URL_PATTERN.test(url)) {
          offenders.push(
            `${folder.key}/${storyFile}: invalid parameters.design.url "${url}" (expected https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=<digits>-<digits>)`,
          );
        }
      }
    }

    expect(
      offenders,
      `Story / Figma design URL coverage violations:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
