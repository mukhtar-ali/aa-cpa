import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { NewsCard, NewsGrid } from './NewsCard';

const article = {
  id: 'a1',
  title: 'How AI is changing the work of an auditor',
  category: 'Articles',
  date: '2026-10-12',
  image: { src: '/a.jpg', alt: 'Auditor at a desk', width: 267, height: 250 },
  href: '/articles/ai',
};

describe('NewsCard', () => {
  it('is an article with the photo, category, heading link, date and read-more text', () => {
    render(<NewsCard article={article} readMoreLabel="Read more" locale="en" />);
    const card = screen.getByRole('article');
    expect(within(card).getByRole('img', { name: 'Auditor at a desk' })).toHaveClass('h-62.5', 'rounded-image', 'object-cover');
    expect(within(card).getByText('Articles')).toBeInTheDocument();
    const link = within(card).getByRole('link', { name: article.title });
    expect(link).toHaveAttribute('href', '/articles/ai');
    expect(link.closest('h3')).toHaveClass('text-h6', 'text-text-heading');
    expect(within(card).getByText('Read more')).toBeInTheDocument();
  });

  it('formats the date by locale with Western digits and a machine-readable value', () => {
    const { rerender } = render(<NewsCard article={article} readMoreLabel="x" locale="en" />);
    expect(screen.getByText('October 12, 2026')).toHaveAttribute('datetime', '2026-10-12');
    rerender(<NewsCard article={article} readMoreLabel="x" locale="ar" />);
    expect(screen.getByRole('article').querySelector('time')?.textContent).toMatch(/12/);
  });

  it('the read-more affordance is decorative so the link is not announced twice, and its chevron points forward', () => {
    const { container } = render(<NewsCard article={article} readMoreLabel="Read more" />);
    const more = screen.getByText('Read more');
    expect(more).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveClass('-scale-x-100', 'rtl:scale-x-100');
  });

  it('a decorative image gets empty alt', () => {
    render(<NewsCard article={{ ...article, image: { ...article.image, decorative: true } }} readMoreLabel="x" />);
    expect(screen.getByRole('article').querySelector('img')).toHaveAttribute('alt', '');
  });
});

describe('NewsGrid', () => {
  const articles = [article, { ...article, id: 'a2', title: 'Second article' }, { ...article, id: 'a3', title: 'Third article' }];

  it('lists every article, four across on large screens', () => {
    render(<NewsGrid articles={articles} readMoreLabel="Read more" />);
    const list = screen.getByRole('list');
    expect(list).toHaveClass('lg:grid-cols-4');
    expect(within(list).getAllByRole('article')).toHaveLength(3);
  });

  it('renders the optional filter and pagination slots around the grid', () => {
    render(<NewsGrid articles={articles} readMoreLabel="x" filters={<div data-testid="f" />} pagination={<div data-testid="p" />} />);
    const all = screen.getByTestId('f').compareDocumentPosition(screen.getByRole('list'));
    expect(all & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('list').compareDocumentPosition(screen.getByTestId('p')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <NewsGrid articles={articles} readMoreLabel="Read more" locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
