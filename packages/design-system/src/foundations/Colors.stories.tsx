import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import figmaData from '../../tokens/figma-variables.json';

interface VariableDef {
  name: string;
  value: string;
  type: string;
  figmaValue?: string;
  a11yOverride?: boolean;
  reason?: string;
}

const variables: VariableDef[] = figmaData.variables as VariableDef[];
const colorVars = variables.filter((v) => v.type === 'color');

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function getColor(name: string): string {
  const found = colorVars.find((v) => v.name === name);
  return found?.value ?? '#000000';
}

const R4_PAIRS = [
  { fg: 'action/primary', bg: 'neutral/0', min: 4.5, note: 'White button label on primary action (R4 override)' },
  { fg: 'text/link', bg: 'bg/page', min: 4.5, note: 'Link text on page background (R4 override)' },
  { fg: 'text/link', bg: 'bg/surface', min: 4.5, note: 'Link text on surface background (R4 override)' },
  { fg: 'text/link', bg: 'bg/surface-ice', min: 4.5, note: 'Link text on ice background (R4 override)' },
  { fg: 'text/muted', bg: 'bg/page', min: 4.5, note: 'Muted text on page background (R4 override)' },
  { fg: 'text/muted', bg: 'bg/surface', min: 4.5, note: 'Muted text on surface background (R4 override)' },
  { fg: 'gradient/end-text-large', bg: 'bg/page', min: 3.0, note: 'Large accent text on page (H1-H3, R4 override)' },
  { fg: 'gradient/end-text', bg: 'bg/page', min: 4.5, note: 'Small accent text on page (<24px, R4 override)' },
  { fg: 'text/heading', bg: 'bg/page', min: 4.5, note: 'Heading on page background' },
  { fg: 'text/body', bg: 'bg/page', min: 4.5, note: 'Body copy on page background' },
  { fg: 'text/strong', bg: 'bg/page', min: 4.5, note: 'Strong text on page background' },
  { fg: 'text/inverse', bg: 'bg/inverse', min: 4.5, note: 'Inverse text on dark inverse background' },
  { fg: 'text/inverse-muted', bg: 'bg/inverse', min: 4.5, note: 'Inverse muted text on dark inverse background' },
  { fg: 'accent/progress', bg: 'bg/inverse', min: 4.5, note: 'Progress accent on inverse' },
  { fg: 'text/accent', bg: 'bg/page', min: 4.5, note: 'Gold accent on page' },
];

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    docs: {
      description: {
        component:
          'Design tokens color palette derived 1:1 from Figma variables, including WCAG 2.2 AA accessibility contrast adjustments documented in research R4.',
      },
    },
  },
};

export default meta;

export const AllColors: StoryObj = {
  render: () => {
    const overrides = colorVars.filter((v) => v.a11yOverride);

    return (
      <div className="space-y-10 p-6 bg-bg-page text-text-heading">
        <header>
          <h1 className="text-h1 font-bold">Color Tokens & Contrast Matrix</h1>
          <p className="mt-2 text-body-lg text-text-muted">
            Tokens exported from Figma variables with WCAG 2.2 AA accessibility overrides.
          </p>
        </header>

        {/* Overrides Table */}
        <section aria-labelledby="overrides-heading" className="rounded-card bg-bg-surface p-6 shadow-sm border border-border-subtle">
          <h2 id="overrides-heading" className="text-h2 font-bold mb-4">
            Accessibility Overrides (R4)
          </h2>
          <p className="text-body-md text-text-muted mb-4">
            Adjusted colors to guarantee ≥4.5:1 normal text contrast or ≥3.0:1 large text contrast.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-body-sm border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface-ice text-text-heading">
                  <th scope="col" className="p-3 text-start">Figma Token</th>
                  <th scope="col" className="p-3 text-start">Original Figma</th>
                  <th scope="col" className="p-3 text-start">Shipped Value</th>
                  <th scope="col" className="p-3 text-start">Swatch</th>
                  <th scope="col" className="p-3 text-start">Reason</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((item) => (
                  <tr key={item.name} className="border-b border-border-subtle">
                    <td className="p-3 font-bold font-mono">{item.name}</td>
                    <td className="p-3 font-mono text-text-muted">{item.figmaValue}</td>
                    <td className="p-3 font-mono font-bold text-action-primary">{item.value}</td>
                    <td className="p-3">
                      <span
                        className="inline-block w-8 h-8 rounded-sm border border-border-subtle"
                        style={{ backgroundColor: item.value }}
                        aria-hidden="true"
                      />
                    </td>
                    <td className="p-3 text-text-body">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contrast Table */}
        <section aria-labelledby="contrast-heading" className="rounded-card bg-bg-surface p-6 shadow-sm border border-border-subtle">
          <h2 id="contrast-heading" className="text-h2 font-bold mb-4">
            WCAG 2.2 AA Contrast Verification
          </h2>
          <p className="text-body-md text-text-muted mb-4">
            Computed dynamically using WCAG 2.x relative luminance from token values.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-body-sm border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface-ice text-text-heading">
                  <th scope="col" className="p-3 text-start">Usage Note</th>
                  <th scope="col" className="p-3 text-start">Foreground</th>
                  <th scope="col" className="p-3 text-start">Background</th>
                  <th scope="col" className="p-3 text-start">Ratio</th>
                  <th scope="col" className="p-3 text-start">Req. Min</th>
                  <th scope="col" className="p-3 text-start">Status</th>
                </tr>
              </thead>
              <tbody>
                {R4_PAIRS.map((pair) => {
                  const fgHex = getColor(pair.fg);
                  const bgHex = getColor(pair.bg);
                  const ratio = contrast(fgHex, bgHex);
                  const pass = ratio >= pair.min - 0.01;

                  return (
                    <tr key={`${pair.fg}-${pair.bg}`} className="border-b border-border-subtle">
                      <td className="p-3 text-text-body font-medium">{pair.note}</td>
                      <td className="p-3 font-mono text-xs">{pair.fg} ({fgHex})</td>
                      <td className="p-3 font-mono text-xs">{pair.bg} ({bgHex})</td>
                      <td className="p-3 font-bold">{ratio.toFixed(2)}:1</td>
                      <td className="p-3 text-text-muted">{pair.min.toFixed(1)}:1</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm ${
                            pass ? 'bg-bg-surface-ice text-action-primary' : 'bg-status-error text-neutral-0'
                          }`}
                        >
                          {pass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Swatches Grid */}
        <section aria-labelledby="swatches-heading">
          <h2 id="swatches-heading" className="text-h2 font-bold mb-4">
            All Figma Color Swatches
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colorVars.map((item) => (
              <div
                key={item.name}
                className="rounded-card bg-bg-surface p-4 border border-border-subtle shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-full h-16 rounded-field border border-border-subtle mb-3"
                    style={{ backgroundColor: item.value }}
                    aria-hidden="true"
                  />
                  <h3 className="font-mono text-sm font-bold text-text-heading break-all">{item.name}</h3>
                  <p className="font-mono text-xs text-text-muted mt-1">{item.value}</p>
                </div>
                {item.a11yOverride && (
                  <div className="mt-3 text-xs bg-bg-surface-ice p-2 rounded-sm text-action-primary">
                    <span className="font-bold">Figma:</span> {item.figmaValue} (A11y override)
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  },
};
