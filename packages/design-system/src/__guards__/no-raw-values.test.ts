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

const HEX_COLOR = /#([0-9a-fA-F]{3,8})\b/;
const RGB_COLOR = /rgba?\(/;
const ARBITRARY_PX = /-\[\d+px\]/;
const ALLOW_COMMENT = /\/\/\s*ds-allow-raw:\s*.+/;

describe('Guard: no raw hex/rgb/arbitrary px values in components', () => {
  it('enforces design tokens rather than raw values in tsx files outside styles', () => {
    const srcDir = path.resolve(import.meta.dirname, '..');
    const tsxFiles = getFilesRecursively(srcDir, '.tsx').filter(
      (file) =>
        !file.includes(path.join('src', 'styles')) &&
        !file.includes('.stories.tsx') &&
        !file.includes('.test.tsx'),
    );

    const violations: string[] = [];

    for (const filePath of tsxFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (ALLOW_COMMENT.test(line)) continue;
        if (i > 0 && ALLOW_COMMENT.test(lines[i - 1]!)) continue;

        if (HEX_COLOR.test(line) || RGB_COLOR.test(line) || ARBITRARY_PX.test(line)) {
          const relPath = path.relative(srcDir, filePath);
          violations.push(`${relPath}:${i + 1}: ${line.trim()}`);
        }
      }
    }

    expect(
      violations,
      `Found raw colors or arbitrary pixel values in component code. Use design tokens instead. Violations:\n${violations.join('\n')}`,
    ).toEqual([]);
  });
});
