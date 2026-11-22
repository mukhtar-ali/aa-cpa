import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ArticleCardCompact } from './ArticleCardCompact';

const article = { id: 'a', title: 'New update to zakat rules', category: 'Tax', date: '2026-10-12', image: { src: '/t.jpg', alt: 'Thumbnail', width: 72, height: 75 }, href: '/news/zakat' };

describe('ArticleCardCompact', () => {
  it('is an article with a heading link, a time and a 72 x 75 thumbnail with the 14 px radius', () => {
    render(<ArticleCardCompact article={article} locale="en" />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-body-md', 'font-bold', 'text-text-inverse');
    expect(screen.getByRole('link', { name: article.title })).toHaveAttribute('href', '/news/zakat');
    expect(screen.getByText('October 12, 2026')).toHaveAttribute('datetime', '2026-10-12');
    expect(screen.getByRole('img', { name: 'Thumbnail' })).toHaveClass('w-18', 'h-18.75', 'rounded-thumb-lg');
  });

  it('shows the inverse divider unless disabled', () => {
    const { rerender } = render(<ArticleCardCompact article={article} />);
    expect(screen.getByRole('article')).toHaveClass('border-b', 'border-border-inverse', 'pb-5');
    rerender(<ArticleCardCompact article={article} divider={false} />);
    expect(screen.getByRole('article')).not.toHaveClass('border-b');
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s on a dark panel', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-bg-inverse p-6">
        <ArticleCardCompact article={article} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
