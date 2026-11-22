import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Logo } from './Logo';

describe('Logo', () => {
  it('is an image named by its label at the native 237 x 60 size', () => {
    render(<Logo variant="on-light" label="AA-CPA" />);
    const img = screen.getByRole('img', { name: 'AA-CPA' });
    expect(img).toHaveAttribute('width', '237');
    expect(img).toHaveAttribute('height', '60');
  });

  it('uses a different asset for each variant', () => {
    const { rerender } = render(<Logo variant="on-dark" label="AA-CPA" />);
    const dark = screen.getByRole('img').getAttribute('src');
    rerender(<Logo variant="on-light" label="AA-CPA" />);
    const light = screen.getByRole('img').getAttribute('src');
    expect(dark).toMatch(/logo-on-dark/);
    expect(light).toMatch(/logo-on-light/);
    expect(dark).not.toBe(light);
  });

  it('merges className and forwards a ref', () => {
    const ref = { current: null as HTMLImageElement | null };
    render(<Logo variant="on-dark" label="AA-CPA" className="h-10 w-auto" ref={ref} />);
    expect(screen.getByRole('img')).toHaveClass('h-10', 'w-auto');
    expect(ref.current?.tagName).toBe('IMG');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <a href="/">
          <Logo variant="on-light" label="AA-CPA" />
        </a>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
