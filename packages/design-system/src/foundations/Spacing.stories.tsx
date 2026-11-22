import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Foundations/Spacing',
  parameters: {
    docs: {
      description: {
        component:
          'Design tokens spacing scale and vertical section rhythm derived from Figma variables.',
      },
    },
  },
};

export default meta;

const SPACE_SCALE = [
  { name: 'space-0', value: '0px', rem: '0rem', barWidth: 'w-0' },
  { name: 'space-8', value: '8px', rem: '0.5rem', barWidth: 'w-2' },
  { name: 'space-16', value: '16px', rem: '1rem', barWidth: 'w-4' },
  { name: 'space-24', value: '24px', rem: '1.5rem', barWidth: 'w-6' },
  { name: 'space-48', value: '48px', rem: '3rem', barWidth: 'w-12' },
  { name: 'space-64', value: '64px', rem: '4rem', barWidth: 'w-16' },
  { name: 'space-80', value: '80px', rem: '5rem', barWidth: 'w-20' },
  { name: 'space-96', value: '96px', rem: '6rem', barWidth: 'w-24' },
];

const SECTION_RHYTHM = [
  {
    name: 'section-sm',
    token: '--spacing-section-sm',
    cssVar: 'var(--space-48)',
    value: '48px',
    pyClass: 'py-section-sm',
    usage: 'Compact bands and small interstitial sections',
  },
  {
    name: 'section-md',
    token: '--spacing-section-md',
    cssVar: 'var(--space-64)',
    value: '64px',
    pyClass: 'py-section-md',
    usage: 'Secondary content sections and card grids',
  },
  {
    name: 'section-lg',
    token: '--spacing-section-lg',
    cssVar: 'var(--space-80)',
    value: '80px',
    pyClass: 'py-section-lg',
    usage: 'Default vertical rhythm for standard content sections',
  },
  {
    name: 'section-xl',
    token: '--spacing-section-xl',
    cssVar: 'var(--space-96)',
    value: '96px',
    pyClass: 'py-section-xl',
    usage: 'Hero banners and high-impact conclusion sections',
  },
];

export const SpacingScale: StoryObj = {
  render: () => (
    <div className="space-y-12 p-6 bg-bg-page text-text-heading">
      <header>
        <h1 className="text-h1 font-bold">Spacing Scale & Vertical Rhythm</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          Unified space tokens used for layout margins, padding, and vertical rhythm across pages.
        </p>
      </header>

      {/* Basic Space Scale */}
      <section aria-labelledby="space-scale-title" className="rounded-card bg-bg-surface p-6 border border-border-subtle shadow-sm space-y-6">
        <h2 id="space-scale-title" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Base Space Scale (0px – 96px)
        </h2>
        <div className="space-y-4">
          {SPACE_SCALE.map((s) => (
            <div key={s.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-sm bg-bg-surface-ice/40 border border-border-subtle/50">
              <div className="w-48">
                <span className="font-mono font-bold text-sm text-text-heading">{s.name}</span>
                <span className="ms-3 font-mono text-xs text-text-muted">
                  {s.value} ({s.rem})
                </span>
              </div>
              <div className="flex-1 flex items-center">
                <div
                  className={`h-4 bg-action-primary rounded-sm ${s.barWidth}`}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Rhythm Scale */}
      <section aria-labelledby="section-rhythm-title" className="rounded-card bg-bg-surface p-6 border border-border-subtle shadow-sm space-y-6">
        <h2 id="section-rhythm-title" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Section Rhythm (Vertical Padding)
        </h2>
        <p className="text-body-md text-text-muted">
          Configured in theme.css mapped to section utilities (py-section-sm .. py-section-xl).
        </p>

        <div className="space-y-6">
          {SECTION_RHYTHM.map((r) => (
            <div key={r.name} className="rounded-card border border-border-subtle overflow-hidden">
              <div className="bg-bg-surface-ice px-4 py-2 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-action-primary text-sm">
                  {r.pyClass} ({r.token})
                </span>
                <span className="font-mono text-xs text-text-muted">{r.value} top & bottom</span>
              </div>
              <div className={`${r.pyClass} bg-bg-page px-6 text-center border-dashed border-y border-border-subtle`}>
                <div className="py-2 bg-bg-surface rounded-field border border-border-subtle text-body-sm text-text-body font-medium">
                  {r.usage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
