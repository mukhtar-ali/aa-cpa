import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CategoryBadge } from './CategoryBadge';

describe('CategoryBadge', () => {
  it('renders the label and a decorative dot with the gold accent by default', () => {
    const { container } = render(<CategoryBadge>Articles</CategoryBadge>);
    const root = screen.getByText('Articles').parentElement!;
    expect(root).toHaveClass('text-text-accent', 'text-body-sm', 'font-bold');
    const dot = container.querySelector('[data-dot]')!;
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveClass('size-1.5', 'rounded-full', 'bg-text-accent-inverse');
  });

  it('green tone uses the link and action colours', () => {
    const { container } = render(<CategoryBadge tone="green">News</CategoryBadge>);
    expect(screen.getByText('News').parentElement).toHaveClass('text-text-link');
    expect(container.querySelector('[data-dot]')).toHaveClass('bg-action-primary');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <CategoryBadge>{lang === 'ar' ? 'مقالات' : 'Articles'}</CategoryBadge>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
