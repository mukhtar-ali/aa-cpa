// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import {
  buildTokens,
  validateTokenDoc,
} from './build-tokens.mjs';

describe('build-tokens generator', () => {
  let tempDir: string;
  const scriptPath = path.resolve(import.meta.dirname, 'build-tokens.mjs');
  const fixturePath = path.resolve(
    import.meta.dirname,
    '../tokens/__fixtures__/figma-variables.fixture.json',
  );

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-tokens-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('generates expected token names and values from fixture', () => {
    const res = buildTokens({
      inputPath: fixturePath,
      outDir: tempDir,
    });

    expect(fs.existsSync(res.cssPath)).toBe(true);
    expect(fs.existsSync(res.tsPath)).toBe(true);

    const cssContent = fs.readFileSync(res.cssPath, 'utf-8');
    const tsContent = fs.readFileSync(res.tsPath, 'utf-8');

    // Names check
    expect(cssContent).toContain('--color-bg-page: #ffffff;');
    expect(cssContent).toContain('--color-action-primary: #228664;');
    expect(cssContent).toContain('--color-text-heading: #111827;');
    expect(cssContent).toContain('--font-size-h1: 48px;');
    expect(cssContent).toContain('--spacing-24: 24px;');
    expect(cssContent).toContain('--radius-32: 32px;');
    expect(cssContent).toContain('--shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1);');

    // TS exports check
    expect(tsContent).toContain("'--color-bg-page'");
    expect(tsContent).toContain("'--color-action-primary'");
    expect(tsContent).toContain('export type ColorToken');
    expect(tsContent).toContain('export type DesignToken');
    expect(tsContent).toContain('export const tokenValues = {');
  });

  it('honours a11yOverride by emitting shipped value and omitting figmaValue in CSS', () => {
    const res = buildTokens({
      inputPath: fixturePath,
      outDir: tempDir,
    });

    const cssContent = fs.readFileSync(res.cssPath, 'utf-8');

    // Shipped accessible value
    expect(cssContent).toContain('--color-action-primary: #228664;');
    // Original Figma value (#238b68) must NOT be emitted in CSS output
    expect(cssContent).not.toContain('#238b68');
  });

  it('produces deterministic output across multiple runs', () => {
    const run1Dir = path.join(tempDir, 'run1');
    const run2Dir = path.join(tempDir, 'run2');

    buildTokens({ inputPath: fixturePath, outDir: run1Dir });
    buildTokens({ inputPath: fixturePath, outDir: run2Dir });

    const css1 = fs.readFileSync(path.join(run1Dir, 'styles/tokens.css'), 'utf-8');
    const css2 = fs.readFileSync(path.join(run2Dir, 'styles/tokens.css'), 'utf-8');
    const ts1 = fs.readFileSync(path.join(run1Dir, 'lib/tokens.ts'), 'utf-8');
    const ts2 = fs.readFileSync(path.join(run2Dir, 'lib/tokens.ts'), 'utf-8');

    expect(css1).toBe(css2);
    expect(ts1).toBe(ts2);
  });

  it('fails with clear error on malformed input', () => {
    // Missing name
    expect(() =>
      validateTokenDoc({
        variables: [{ value: '#fff' }],
      }),
    ).toThrowError(/name/i);

    // Missing value
    expect(() =>
      validateTokenDoc({
        variables: [{ name: 'bg/page' }],
      }),
    ).toThrowError(/value/i);

    // a11yOverride without figmaValue
    expect(() =>
      validateTokenDoc({
        variables: [
          {
            name: 'action/primary',
            value: '#228664',
            a11yOverride: true,
            reason: 'Contrast test',
          },
        ],
      }),
    ).toThrowError(/figmaValue/i);

    // a11yOverride without reason
    expect(() =>
      validateTokenDoc({
        variables: [
          {
            name: 'action/primary',
            value: '#228664',
            figmaValue: '#238b68',
            a11yOverride: true,
          },
        ],
      }),
    ).toThrowError(/reason/i);

    // Non-existent input file
    expect(() =>
      buildTokens({
        inputPath: path.join(tempDir, 'non-existent.json'),
        outDir: tempDir,
      }),
    ).toThrowError(/not found/i);
  });

  it('accepts --input and --out-dir CLI arguments when executed', () => {
    const cliOutDir = path.join(tempDir, 'cli-out');

    const stdout = execFileSync(
      process.execPath,
      [scriptPath, '--input', fixturePath, '--out-dir', cliOutDir],
      { encoding: 'utf-8' },
    );

    expect(stdout).toContain('Successfully built 7 design tokens');
    expect(fs.existsSync(path.join(cliOutDir, 'styles/tokens.css'))).toBe(true);
    expect(fs.existsSync(path.join(cliOutDir, 'lib/tokens.ts'))).toBe(true);
  }, 30_000); // spawns node; slow on the /mnt drive
});
