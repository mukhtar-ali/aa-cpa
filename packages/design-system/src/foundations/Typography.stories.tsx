import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Typography scale for AA-CPA design system. Fluid typography stepping down at smaller breakpoints with paired line heights in Almarai font.',
      },
    },
  },
};

export default meta;

const HEADINGS = [
  { level: 'H1', class: 'text-h1', token: '--text-h1', figma: '48px / 67px line-height' },
  { level: 'H2', class: 'text-h2', token: '--text-h2', figma: '40px / 56px line-height' },
  { level: 'H3', class: 'text-h3', token: '--text-h3', figma: '33px / 46px line-height' },
  { level: 'H4', class: 'text-h4', token: '--text-h4', figma: '28px / 39px line-height' },
  { level: 'H5', class: 'text-h5', token: '--text-h5', figma: '23px / 32px line-height' },
  { level: 'H6', class: 'text-h6', token: '--text-h6', figma: '19px / 27px line-height' },
];

const BODY_SIZES = [
  { name: 'Body Large', class: 'text-body-lg', token: '--text-body-lg', figma: '19px / 30px line-height' },
  { name: 'Body Medium (Default)', class: 'text-body-md', token: '--text-body-md', figma: '16px / 26px line-height' },
  { name: 'Body Small', class: 'text-body-sm', token: '--text-body-sm', figma: '13px / 21px line-height' },
  { name: 'Body Extra Small', class: 'text-body-xs', token: '--text-body-xs', figma: '11px / 18px line-height' },
];

const WEIGHTS = [
  { name: 'Regular (400)', class: 'font-normal' },
  { name: 'Bold (700)', class: 'font-bold' },
  { name: 'ExtraBold (800)', class: 'font-extrabold' },
];

const AR_SAMPLE = 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية - حلول التدقيق والضرائب';
const EN_SAMPLE = 'Abdulrahman Al-Shubaishiri Professional Consulting - Audit & Tax Advisory';

export const Scale: StoryObj = {
  render: () => (
    <div className="space-y-12 p-6 bg-bg-page text-text-heading">
      <header>
        <h1 className="text-h1 font-bold">Typography Scale & Font Weights</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          Font: Almarai (Arabic + Latin) across 300, 400, 700, 800 weights with fluid responsive scaling.
        </p>
      </header>

      {/* Headings */}
      <section aria-labelledby="headings-title" className="space-y-6">
        <h2 id="headings-title" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Heading Hierarchy (H1 – H6)
        </h2>
        <div className="space-y-8">
          {HEADINGS.map((h) => (
            <div key={h.level} className="rounded-card bg-bg-surface p-6 border border-border-subtle shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <span className="font-mono font-bold text-action-primary text-sm">
                  {h.level} ({h.token})
                </span>
                <span className="font-mono text-xs text-text-muted">{h.figma}</span>
              </div>
              <div className="space-y-3">
                <div dir="rtl">
                  <p className={`${h.class} font-bold text-text-heading text-start`}>
                    {AR_SAMPLE}
                  </p>
                </div>
                <div dir="ltr">
                  <p className={`${h.class} font-bold text-text-heading text-start`}>
                    {EN_SAMPLE}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Body Sizes across weights 400, 700, 800 */}
      <section aria-labelledby="body-title" className="space-y-6">
        <h2 id="body-title" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Body Type Sizes × Weights (400, 700, 800)
        </h2>
        <div className="space-y-8">
          {BODY_SIZES.map((b) => (
            <div key={b.name} className="rounded-card bg-bg-surface p-6 border border-border-subtle shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <span className="font-mono font-bold text-action-primary text-sm">
                  {b.name} ({b.token})
                </span>
                <span className="font-mono text-xs text-text-muted">{b.figma}</span>
              </div>

              <div className="space-y-6">
                {WEIGHTS.map((w) => (
                  <div key={w.name} className="space-y-2 border-b border-border-subtle/50 pb-4 last:border-b-0 last:pb-0">
                    <span className="font-mono text-xs text-text-muted">{w.name}</span>
                    <div dir="rtl">
                      <p className={`${b.class} ${w.class} text-text-body text-start`}>
                        {AR_SAMPLE}
                      </p>
                    </div>
                    <div dir="ltr">
                      <p className={`${b.class} ${w.class} text-text-body text-start`}>
                        {EN_SAMPLE}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
