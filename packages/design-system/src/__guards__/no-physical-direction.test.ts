import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getFilesRecursively(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

const PHYSICAL_PATTERN_1 =
  /\b(ml|mr|pl|pr|left|right|rounded-[lr]|border-[lr]|scroll-m[lr]|scroll-p[lr])-/;
const PHYSICAL_PATTERN_2 = /\btext-(left|right)\b/;
const ALLOW_COMMENT = /\/\/\s*ds-allow-physical:\s*.+/;

describe('Guard: no physical direction utilities', () => {
  it('enforces logical direction utilities across all component tsx files', () => {
    const srcDir = path.resolve(import.meta.dirname, '..');
    const tsxFiles = getFilesRecursively(srcDir, '.tsx').filter(
      (file) => !file.includes('.stories.tsx') && !file.includes('.test.tsx'),
    );

    const violations: string[] = [];

    for (const filePath of tsxFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (ALLOW_COMMENT.test(line)) continue;
        // Also check if previous line has the allow-list comment
        if (i > 0 && ALLOW_COMMENT.test(lines[i - 1]!)) continue;

        if (PHYSICAL_PATTERN_1.test(line) || PHYSICAL_PATTERN_2.test(line)) {
          const relPath = path.relative(srcDir, filePath);
          violations.push(`${relPath}:${i + 1}: ${line.trim()}`);
        }
      }
    }

    expect(
      violations,
      `Found physical direction utilities. Use logical properties (e.g. ms-*, pe-*, start-*, end-*, text-start). Violations:\n${violations.join('\n')}`,
    ).toEqual([]);
  });
});
