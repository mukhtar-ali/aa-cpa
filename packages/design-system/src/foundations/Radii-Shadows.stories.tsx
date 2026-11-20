import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Foundations/Radii & Shadows',
  parameters: {
    docs: {
      description: {
        component:
          'Border radius and box shadow tokens extracted from Figma variables and components.',
      },
    },
  },
};

export default meta;

const RADII = [
  { name: 'radius-button', token: '--radius-button', value: '100px', class: 'rounded-button', usage: 'Buttons and pill badges' },
  { name: 'radius-section', token: '--radius-section', value: '30px', class: 'rounded-section', usage: 'Full-width section bands (30px in Figma)' },
  { name: 'radius-image', token: '--radius-image', value: '20px', class: 'rounded-image', usage: 'Feature images, cards with media' },
  { name: 'radius-card', token: '--radius-card', value: '16px', class: 'rounded-card', usage: 'Standard content cards and containers' },
  { name: 'radius-field', token: '--radius-field', value: '8px', class: 'rounded-field', usage: 'Form inputs, dropdowns, textareas' },
  { name: 'radius-sm', token: '--radius-sm', value: '6px', class: 'rounded-sm', usage: 'Tags, chips, and small controls' },
];

const SHADOWS = [
  {
    name: 'shadow-button-primary',
    token: '--shadow-button-primary',
    value: '0px 4px 14px 0px rgba(34, 134, 100, 0.35)',
    class: 'shadow-button-primary',
    usage: 'Primary green action button glow on light/dark backgrounds',
  },
];

export const RadiiAndShadows: StoryObj = {
  render: () => (
    <div className="space-y-12 p-6 bg-bg-page text-text-heading">
      <header>
        <h1 className="text-h1 font-bold">Corner Radii & Shadows</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          Visual styling tokens ensuring consistent geometric curvature and elevations.
        </p>
      </header>

      {/* Radii */}
      <section aria-labelledby="radii-title" className="space-y-6">
        <h2 id="radii-title" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Border Radius Scale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RADII.map((r) => (
            <div
              key={r.name}
              className={`p-6 bg-bg-surface border-2 border-border-strong shadow-sm ${r.class} flex flex-col justify-between h-44`}
            >
              <div>
                <span className="font-mono text-xs font-bold text-action-primary uppercase tracking-wider">
                  {r.token}
                </span>
                <h3 className="text-h4 font-bold mt-1 text-text-heading">{r.name}</h3>
                <p className="font-mono text-xs text-text-muted mt-0.5">{r.value}</p>
              </div>
              <p className="text-body-xs text-text-body mt-2">{r.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shadows */}
      <section aria-labelledby="shadows-title" className="space-y-6">
        <h2 id="shadows-title" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Elevation & Shadows
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SHADOWS.map((s) => (
            <div
              key={s.name}
              className="p-6 bg-bg-surface rounded-card border border-border-subtle space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <span className="font-mono font-bold text-action-primary text-sm">{s.name}</span>
                <span className="font-mono text-xs text-text-muted">{s.token}</span>
              </div>
              <p className="text-body-sm text-text-body">{s.usage}</p>
              <div className="pt-2">
                <button
                  type="button"
                  className={`px-6 py-3 bg-action-primary text-neutral-0 font-bold rounded-button ${s.class}`}
                >
                  Action Button with Shadow
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
