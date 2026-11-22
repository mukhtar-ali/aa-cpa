import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a horizontal <hr> by default', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el.tagName).toBe('HR');
    expect(el).toHaveClass('h-px', 'w-full', 'bg-border-decor');
  });

  it('renders a vertical separator with orientation', () => {
    render(<Divider orientation="vertical" tone="dark" />);
    const el = screen.getByRole('separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
    expect(el).toHaveClass('w-px', 'self-stretch', 'bg-pine-700');
  });

  it('merges className', () => {
    render(<Divider className="my-4" />);
    expect(screen.getByRole('separator')).toHaveClass('my-4');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Divider />
        <Divider orientation="vertical" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
