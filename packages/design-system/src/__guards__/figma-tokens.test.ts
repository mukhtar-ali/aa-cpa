import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { toCssVariableName, formatCssValue } from '../../scripts/build-tokens.mjs';

type FigmaVariable = {
  name: string;
  value: string | number;
  type?: string;
  figmaValue?: string | number;
  a11yOverride?: boolean;
  reason?: string;
};

const root = path.resolve(import.meta.dirname, '../..');
const doc = JSON.parse(fs.readFileSync(path.join(root, 'tokens/figma-variables.json'), 'utf8')) as {
  variables: FigmaVariable[];
};
const css = fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');

const cssProps = new Map<string, string>();
for (const [, prop, value] of css.matchAll(/^\s*(--[a-z0-9-]+):\s*(.+?);\s*$/gm)) {
  if (prop && value) cssProps.set(prop, value);
}

describe('Figma variables snapshot vs tokens.css', () => {
  it('snapshot is not empty and tokens.css is generated from it', () => {
    expect(doc.variables.length).toBeGreaterThan(40);
    expect(cssProps.size).toBe(doc.variables.length);
  });

  it.each(doc.variables.map((v) => [v.name, v] as const))('%s has a matching custom property', (_name, v) => {
    const prop = toCssVariableName(v.name, v.type, v.value);
    const expected = formatCssValue(v.value, prop);
    expect(cssProps.get(prop), `${prop} missing or different in tokens.css`).toBe(expected);
  });

  it('accessibility overrides document the Figma value and a reason, and really differ', () => {
    const overrides = doc.variables.filter((v) => v.a11yOverride);
    expect(overrides.length).toBeGreaterThanOrEqual(5);
    for (const v of overrides) {
      expect(v.figmaValue, `${v.name} figmaValue`).toBeTruthy();
      expect(String(v.value).toLowerCase(), `${v.name} must differ from figmaValue`).not.toBe(
        String(v.figmaValue).toLowerCase(),
      );
      expect((v.reason ?? '').length, `${v.name} reason`).toBeGreaterThan(10);
    }
  });

  it('non-overridden variables never carry a figmaValue', () => {
    for (const v of doc.variables.filter((x) => !x.a11yOverride)) {
      expect(v.figmaValue, `${v.name} has figmaValue without a11yOverride`).toBeUndefined();
    }
  });

  it('every R4 override from research is present with its shipped value', () => {
    const byName = new Map(doc.variables.map((v) => [v.name, v]));
    expect(byName.get('action/primary')?.value).toBe('#228664');
    expect(byName.get('text/link')?.value).toBe('#1e785a');
    expect(byName.get('text/muted')?.value).toBe('#686b68');
    expect(byName.get('gradient/end-text-large')?.value).toBe('#2a91bc');
    expect(byName.get('gradient/end-text')?.value).toBe('#217294');
  });
});
