import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Pattern, type PatternName, type PatternTone } from './Pattern';

describe('Pattern component', () => {
  it('renders with aria-hidden="true" and no role attribute', () => {
    const { container } = render(<Pattern name="flow-lines" tone="dark" />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
  });

  it('is absolutely positioned with logical insets', () => {
    const { container } = render(<Pattern name="flow-lines" tone="dark" />);
    const root = container.firstElementChild;

    expect(root).toHaveClass('absolute');
    expect(root).toHaveClass('inset-0');
    expect(root).toHaveClass('pointer-events-none');
  });

  it('applies RTL mirroring class only to directional flow-lines pattern', () => {
    const { container: flowContainer } = render(
      <Pattern name="flow-lines" tone="dark" />,
    );
    expect(flowContainer.firstElementChild).toHaveClass('rtl:-scale-x-100');

    const { container: dotsContainer } = render(
      <Pattern name="dots-grid" tone="light" />,
    );
    expect(dotsContainer.firstElementChild).not.toHaveClass('rtl:-scale-x-100');

    const { container: logoContainer } = render(
      <Pattern name="logo-lines" tone="light" />,
    );
    expect(logoContainer.firstElementChild).not.toHaveClass('rtl:-scale-x-100');
  });

  it('applies correct colour classes per pattern and tone', () => {
    // logo-lines: light -> text-border-decor, dark -> text-border-inverse
    const { container: logoLight } = render(
      <Pattern name="logo-lines" tone="light" />,
    );
    expect(logoLight.firstElementChild).toHaveClass('text-border-decor');

    const { container: logoDark } = render(
      <Pattern name="logo-lines" tone="dark" />,
    );
    expect(logoDark.firstElementChild).toHaveClass('text-border-inverse');

    // flow-lines: dark tone -> text-border-inverse, light tone -> a pale grey line
    const { container: flowLight } = render(
      <Pattern name="flow-lines" tone="light" />,
    );
    expect(flowLight.firstElementChild).toHaveClass('text-border-subtle');

    const { container: flowDark } = render(
      <Pattern name="flow-lines" tone="dark" />,
    );
    expect(flowDark.firstElementChild).toHaveClass('text-border-inverse');

    // dots-grid -> text-text-strong for both tones
    const { container: dotsLight } = render(
      <Pattern name="dots-grid" tone="light" />,
    );
    expect(dotsLight.firstElementChild).toHaveClass('text-text-strong');

    const { container: dotsDark } = render(
      <Pattern name="dots-grid" tone="dark" />,
    );
    expect(dotsDark.firstElementChild).toHaveClass('text-text-strong');
  });

  it('merges custom className via cn', () => {
    const { container } = render(
      <Pattern name="flow-lines" tone="dark" className="opacity-50" />,
    );
    expect(container.firstElementChild).toHaveClass('opacity-50');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Pattern ref={ref} name="flow-lines" tone="dark" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders inline SVG elements keeping root dimensions/viewBox', () => {
    const { container: flow } = render(<Pattern name="flow-lines" tone="dark" />);
    const flowSvg = flow.querySelector('svg');
    expect(flowSvg).toHaveAttribute('viewBox', '0 0 1512 771');
    expect(flowSvg).toHaveAttribute('width', '1512');
    expect(flowSvg).toHaveAttribute('height', '771');

    const { container: dots } = render(<Pattern name="dots-grid" tone="light" />);
    const dotsSvg = dots.querySelector('svg');
    expect(dotsSvg).toHaveAttribute('viewBox', '0 0 1479 741');
    expect(dotsSvg).toHaveAttribute('width', '1479');
    expect(dotsSvg).toHaveAttribute('height', '741');

    const { container: logo } = render(<Pattern name="logo-lines" tone="light" />);
    const logoSvg = logo.querySelector('svg');
    expect(logoSvg).toHaveAttribute('viewBox', '0 0 1512 800');
    expect(logoSvg).toHaveAttribute('width', '1512');
    expect(logoSvg).toHaveAttribute('height', '800');
  });

  it('renders correctly under RTL and LTR contexts', () => {
    const { container: rtl } = render(
      <div dir="rtl">
        <Pattern name="flow-lines" tone="dark" />
      </div>,
    );
    expect(rtl.querySelector('[aria-hidden="true"]')).toHaveClass('rtl:-scale-x-100');

    const { container: ltr } = render(
      <div dir="ltr">
        <Pattern name="flow-lines" tone="dark" />
      </div>,
    );
    expect(ltr.querySelector('[aria-hidden="true"]')).toHaveClass('rtl:-scale-x-100');
  });

  it('passes automated axe accessibility check with zero violations', async () => {
    const names: PatternName[] = ['flow-lines', 'dots-grid', 'logo-lines'];
    const tones: PatternTone[] = ['light', 'dark'];

    for (const name of names) {
      for (const tone of tones) {
        const { container } = render(
          <div className="relative w-96 h-64 bg-bg-page">
            <Pattern name={name} tone={tone} />
          </div>,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  });
});
