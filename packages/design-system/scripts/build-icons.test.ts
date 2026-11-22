import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildIcons, parseSvg, toJsx, toPascalCase } from './build-icons.mjs';

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-icons-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const write = (rel: string, content: string) => {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};
const svg = (inner: string, vb = '0 0 24 24') => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${vb}" fill="none">${inner}</svg>`;

describe('build-icons', () => {
  it('converts names to PascalCase', () => {
    expect(toPascalCase('globe-check')).toBe('GlobeCheck');
    expect(toPascalCase('phone')).toBe('Phone');
  });

  it('maps colours: accent and inverse to tokens, everything else to currentColor, none/url kept', () => {
    const jsx = toJsx('<path stroke="#238b68" fill="#9ddbf4" d="M0 0"/><path fill="#132015" stroke="white" d="M1 1"/><path fill="none" stroke="url(#g)" d="M2 2"/>');
    expect(jsx).toContain('stroke="currentColor" fill="var(--color-icon-accent)"');
    expect(jsx).toContain('fill="var(--color-bg-inverse)" stroke="currentColor"');
    expect(jsx).toContain('fill="none" stroke="url(#g)"');
    expect(jsx).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('camel-cases SVG attributes and drops noisy ones', () => {
    const jsx = toJsx('<path id="a" style="display:block" stroke-width="1.5" stroke-linecap="round" fill-opacity=".85" d="M0 0"/>');
    expect(jsx).toBe('<path strokeWidth="1.5" strokeLinecap="round" d="M0 0" />');
  });

  it('removes viewBox-sized clip paths and their references', () => {
    const parsed = parseSvg(svg('<g clip-path="url(#c)"><path d="M0 0h1v1"/></g><defs><clipPath id="c"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>'), 'x.svg');
    expect(parsed.inner).not.toContain('clip');
    expect(parsed.inner).toContain('<path d="M0 0h1v1"/>');
  });

  it('rejects clip paths that are not the viewBox rectangle and unsupported elements', () => {
    expect(() => parseSvg(svg('<g clip-path="url(#c)"/><defs><clipPath id="c"><path d="M0 0h5v5H0z"/></clipPath></defs>'), 'x.svg')).toThrow(/clipPath/);
    expect(() => parseSvg(svg('<mask id="m"/>'), 'x.svg')).toThrow(/unsupported/);
    expect(() => parseSvg('<svg><path d=""/></svg>', 'x.svg')).toThrow(/viewBox/);
  });

  it('generates components, a typed name union, registry and metadata deterministically', () => {
    write('in/phone.svg', svg('<path stroke="#000" d="M1 1"/>', '0 0 22 22'));
    write('in/arrow.svg', svg('<path stroke="#000" d="M2 2"/>'));
    const opts = { inputDir: path.join(dir, 'in'), outDir: path.join(dir, 'out') };
    expect(buildIcons(opts).count).toBe(2);
    const first = fs.readFileSync(path.join(dir, 'out/index.ts'), 'utf8');
    expect(first).toContain("export const iconNames = ['arrow', 'phone'] as const;");
    expect(first).toContain("'phone': { size: 22, directional: false }");
    expect(first).toContain("'arrow': { size: 24, directional: true }");
    expect(fs.readFileSync(path.join(dir, 'out/PhoneIcon.tsx'), 'utf8')).toContain('stroke="currentColor"');
    buildIcons(opts);
    expect(fs.readFileSync(path.join(dir, 'out/index.ts'), 'utf8')).toBe(first);
  });

  it('refuses an output directory that would delete the working directory, the package or their parents', () => {
    write('in/a.svg', svg('<path stroke="#000" d="M1 1"/>'));
    const inputDir = path.join(dir, 'in');
    for (const outDir of ['.', '..', path.resolve(process.cwd(), '..', '..'), path.parse(process.cwd()).root]) {
      expect(() => buildIcons({ inputDir, outDir }), outDir).toThrow(/Refusing/);
    }
  });

  it('fails clearly for bad input', () => {
    expect(() => buildIcons({ inputDir: path.join(dir, 'missing'), outDir: path.join(dir, 'o') })).toThrow(/not found/);
    write('empty/.keep', '');
    expect(() => buildIcons({ inputDir: path.join(dir, 'empty'), outDir: path.join(dir, 'o') })).toThrow(/No .svg/);
    write('bad/Bad_Name.svg', svg('<path d="M0 0"/>'));
    expect(() => buildIcons({ inputDir: path.join(dir, 'bad'), outDir: path.join(dir, 'o') })).toThrow(/kebab-case/);
  });
});
