import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Pattern } from './Pattern';

const meta: Meta<typeof Pattern> = {
  title: 'Layout/Pattern',
  component: Pattern,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/1jzfujyx2OJ6EKDRD2X6Xm/AA-CPA?node-id=413-323',
    },
    docs: {
      description: {
        component:
          'Pattern component renders decorative background SVGs (flow-lines, dots-grid, logo-lines) with tone-aware token colours and RTL mirroring for directional paths.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pattern>;

export const FlowLinesDark: Story = {
  render: () => (
    <div className="relative h-80 w-full overflow-hidden rounded-card bg-bg-inverse p-6 text-text-inverse">
      <Pattern name="flow-lines" tone="dark" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Flow Lines (Dark)</h3>
        <p className="mt-2 text-body-md text-text-inverse-muted">
          Directional SVG pattern used across dark brand bands. Mirrors automatically in RTL.
        </p>
      </div>
    </div>
  ),
};

export const FlowLinesLight: Story = {
  render: () => (
    <div className="relative h-80 w-full overflow-hidden rounded-card bg-bg-page p-6 text-text-heading">
      <Pattern name="flow-lines" tone="light" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Flow Lines (Light)</h3>
        <p className="mt-2 text-body-md text-text-muted">
          Flow lines rendered on a page tone background.
        </p>
      </div>
    </div>
  ),
};

export const DotsGridLight: Story = {
  render: () => (
    <div className="relative h-80 w-full overflow-hidden rounded-card bg-bg-page p-6 text-text-heading">
      <Pattern name="dots-grid" tone="light" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Dots Grid (Light)</h3>
        <p className="mt-2 text-body-md text-text-muted">
          Subtle geometric dot matrix pattern for structured content areas.
        </p>
      </div>
    </div>
  ),
};

export const DotsGridDark: Story = {
  render: () => (
    <div className="relative h-80 w-full overflow-hidden rounded-card bg-bg-inverse p-6 text-text-inverse">
      <Pattern name="dots-grid" tone="dark" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Dots Grid (Dark)</h3>
        <p className="mt-2 text-body-md text-text-inverse-muted">
          Dot matrix pattern rendered on an inverse section.
        </p>
      </div>
    </div>
  ),
};

export const LogoLinesLight: Story = {
  render: () => (
    <div className="relative h-96 w-full overflow-hidden rounded-card bg-bg-page p-6 text-text-heading">
      <Pattern name="logo-lines" tone="light" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Logo Lines (Light)</h3>
        <p className="mt-2 text-body-md text-text-muted">
          Figma logo-lines motif rendered with border-decor colour on light background.
        </p>
      </div>
    </div>
  ),
};

export const LogoLinesDark: Story = {
  render: () => (
    <div className="relative h-96 w-full overflow-hidden rounded-card bg-bg-inverse p-6 text-text-inverse">
      <Pattern name="logo-lines" tone="dark" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Logo Lines (Dark)</h3>
        <p className="mt-2 text-body-md text-text-inverse-muted">
          Figma logo-lines motif rendered with border-inverse colour on inverse background.
        </p>
      </div>
    </div>
  ),
};

export const Arabic: Story = {
  parameters: {
    locale: 'ar',
  },
  render: () => (
    <div dir="rtl" className="relative h-80 w-full overflow-hidden rounded-card bg-bg-inverse p-6 text-text-inverse text-start">
      <Pattern name="flow-lines" tone="dark" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">نمط الخطوط المنسابة (العربية - معكوس)</h3>
        <p className="mt-2 text-body-md text-text-inverse-muted">
          يتم عكس اتجاه الخطوط تلقائياً في واجهة اليمين إلى اليسار لتطابق اتجاه القراءة والتصميم في فيجما.
        </p>
      </div>
    </div>
  ),
};

export const English: Story = {
  parameters: {
    locale: 'en',
  },
  render: () => (
    <div dir="ltr" className="relative h-80 w-full overflow-hidden rounded-card bg-bg-inverse p-6 text-text-inverse text-start">
      <Pattern name="flow-lines" tone="dark" />
      <div className="relative z-10">
        <h3 className="text-h3 font-bold">Flow Lines Pattern (English - LTR)</h3>
        <p className="mt-2 text-body-md text-text-inverse-muted">
          Demonstrates flow lines aligned in standard LTR reading orientation.
        </p>
      </div>
    </div>
  ),
};
