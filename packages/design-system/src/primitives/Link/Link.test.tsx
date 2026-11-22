import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Link } from './Link';

describe('Link', () => {
  it('renders an inline link by default', () => {
    render(<Link href="/about">About</Link>);
    const el = screen.getByRole('link', { name: 'About' });
    expect(el).toHaveAttribute('href', '/about');
    expect(el).toHaveClass('text-text-link', 'underline');
  });

  it('renders the nav variant without underline', () => {
    render(
      <Link href="/x" variant="nav">
        Nav
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-text-heading', 'no-underline');
  });

  it('external links open in a new tab safely', () => {
    render(
      <Link href="https://example.com" external>
        Out
      </Link>,
    );
    const el = screen.getByRole('link');
    expect(el).toHaveAttribute('target', '_blank');
    expect(el).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('internal links keep caller-provided target and rel', () => {
    render(
      <Link href="/x" target="_self" rel="nofollow">
        In
      </Link>,
    );
    const el = screen.getByRole('link');
    expect(el).toHaveAttribute('target', '_self');
    expect(el).toHaveAttribute('rel', 'nofollow');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Link href="/x">{lang === 'ar' ? 'من نحن' : 'About us'}</Link>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
