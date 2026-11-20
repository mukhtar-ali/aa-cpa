import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Pattern } from '../layout/Pattern';

const meta: Meta = {
  title: 'Foundations/Patterns',
  parameters: {
    docs: {
      description: {
        component:
          'Decorative SVG patterns for background styling across section tones, including flow lines, dot matrices, and brand logo contours.',
      },
    },
  },
};

export default meta;

export const AllPatternsOnTones: StoryObj = {
  render: () => (
    <div className="space-y-12 p-6 bg-bg-page text-text-heading">
      <header>
        <h1 className="text-h1 font-bold">Figma Background Patterns</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          All SVG patterns with their corresponding light and dark tone token classes.
        </p>
      </header>

      {/* Flow Lines */}
      <section aria-labelledby="flow-lines-heading" className="space-y-4">
        <h2 id="flow-lines-heading" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Flow Lines (Directional / Mirrored in RTL)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark Tone on Inverse */}
          <div className="relative h-80 rounded-section overflow-hidden bg-bg-inverse p-6 text-text-inverse flex flex-col justify-end">
            <Pattern name="flow-lines" tone="dark" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-text-inverse-muted">tone: dark | bg-bg-inverse</span>
              <h3 className="text-h3 font-bold mt-1">Flow Lines on Dark Band</h3>
              <p className="mt-1 text-body-sm text-text-inverse-muted">
                Directional flow strokes rendered using text-border-inverse.
              </p>
            </div>
          </div>

          {/* Light Tone on Page */}
          <div className="relative h-80 rounded-section overflow-hidden bg-bg-surface-ice p-6 text-text-heading flex flex-col justify-end border border-border-subtle">
            <Pattern name="flow-lines" tone="light" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-text-muted">tone: light | bg-bg-surface-ice</span>
              <h3 className="text-h3 font-bold mt-1">Flow Lines on Ice Band</h3>
              <p className="mt-1 text-body-sm text-text-body">
                Strokes visible against lighter page and ice backgrounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dots Grid */}
      <section aria-labelledby="dots-grid-heading" className="space-y-4">
        <h2 id="dots-grid-heading" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Dots Grid (Dot Matrix Pattern)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Tone on Page */}
          <div className="relative h-80 rounded-section overflow-hidden bg-bg-page p-6 text-text-heading flex flex-col justify-end border border-border-subtle">
            <Pattern name="dots-grid" tone="light" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-text-muted">tone: light | bg-bg-page</span>
              <h3 className="text-h3 font-bold mt-1">Dots Grid on Page</h3>
              <p className="mt-1 text-body-sm text-text-body">
                Structured dot array rendered using text-text-strong for subtle grid texture.
              </p>
            </div>
          </div>

          {/* Dark Tone on Inverse */}
          <div className="relative h-80 rounded-section overflow-hidden bg-bg-inverse p-6 text-text-inverse flex flex-col justify-end">
            <Pattern name="dots-grid" tone="dark" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-text-inverse-muted">tone: dark | bg-bg-inverse</span>
              <h3 className="text-h3 font-bold mt-1">Dots Grid on Inverse</h3>
              <p className="mt-1 text-body-sm text-text-inverse-muted">
                Dot matrix structure across dark sections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Lines */}
      <section aria-labelledby="logo-lines-heading" className="space-y-4">
        <h2 id="logo-lines-heading" className="text-h2 font-bold border-b border-border-subtle pb-2">
          Logo Lines (Figma Hero & Footer Motif)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Tone on Page */}
          <div className="relative h-96 rounded-section overflow-hidden bg-bg-page p-6 text-text-heading flex flex-col justify-end border border-border-subtle">
            <Pattern name="logo-lines" tone="light" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-text-muted">tone: light (text-border-decor)</span>
              <h3 className="text-h3 font-bold mt-1">Logo Lines on Light Background</h3>
              <p className="mt-1 text-body-sm text-text-body">
                Figma logo geometry rendered in subtle warm stone tone (#e1ded2).
              </p>
            </div>
          </div>

          {/* Dark Tone on Inverse */}
          <div className="relative h-96 rounded-section overflow-hidden bg-bg-inverse p-6 text-text-inverse flex flex-col justify-end">
            <Pattern name="logo-lines" tone="dark" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-text-inverse-muted">tone: dark (text-border-inverse)</span>
              <h3 className="text-h3 font-bold mt-1">Logo Lines on Inverse Background</h3>
              <p className="mt-1 text-body-sm text-text-inverse-muted">
                Figma logo geometry rendered in deep pine tone (#2a4b2f).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};
