import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Heading } from './Heading';

describe('Heading', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('renders an h%i with the matching visual size by default', (level) => {
    render(<Heading level={level}>Title</Heading>);
    const el = screen.getByRole('heading', { level });
    expect(el).toHaveClass(`text-h${level}`, 'font-bold', 'text-text-heading');
  });

  it('separates semantic level from visual size', () => {
    render(
      <Heading level={2} size="h4">
        Small h2
      </Heading>,
    );
    const el = screen.getByRole('heading', { level: 2 });
    expect(el.tagName).toBe('H2');
    expect(el).toHaveClass('text-h4');
    expect(el).not.toHaveClass('text-h2');
  });

  it('uses the gradient accent only for h1-h3 sizes', () => {
    const { rerender } = render(
      <Heading level={1} accent="accent line">
        Main
      </Heading>,
    );
    const gradient = screen.getByText('accent line');
    expect(gradient).toHaveAttribute('data-accent', 'gradient');
    expect(gradient).toHaveClass('bg-clip-text', 'text-transparent', 'to-gradient-end-text-large');

    rerender(
      <Heading level={2} size="h5" accent="small accent">
        Sub
      </Heading>,
    );
    const solid = screen.getByText('small accent');
    expect(solid).toHaveAttribute('data-accent', 'solid');
    expect(solid).toHaveClass('text-gradient-end-text');
    expect(solid).not.toHaveClass('text-transparent');
  });

  it('renders no accent element when accent is absent', () => {
    const { container } = render(<Heading level={3}>Plain</Heading>);
    expect(container.querySelector('[data-accent]')).toBeNull();
  });

  it('supports the inverse tone and merges className', () => {
    render(
      <Heading level={2} tone="inverse" className="mb-4">
        Dark
      </Heading>,
    );
    expect(screen.getByRole('heading')).toHaveClass('text-text-inverse', 'mb-4');
  });

  it.each(['ar', 'en'])('works in %s direction without violations', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Heading level={1} accent={lang === 'ar' ? 'سطر مميز' : 'Accent'}>
          {lang === 'ar' ? 'عنوان' : 'Title'}
        </Heading>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
