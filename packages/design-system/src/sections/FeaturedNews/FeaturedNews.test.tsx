import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { FeaturedNews } from './FeaturedNews';

const make = (id: string, title: string) => ({ id, title, category: 'Audit', date: '2026-10-12', image: { src: `/${id}.jpg`, alt: `Photo ${id}`, width: 640, height: 360 }, href: `/news/${id}`, excerpt: 'An excerpt about the article.' });
const props = { featured: make('f', 'Featured article title'), latest: [make('l1', 'Latest one'), make('l2', 'Latest two'), make('l3', 'Latest three')], latestTitle: 'Latest articles', readMoreLabel: 'Read more', locale: 'en' as const };

describe('FeaturedNews', () => {
  it('shows the featured article with category, H2 at the H3 size, excerpt, date and read-more', () => {
    render(<FeaturedNews {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Featured article title' })).toHaveClass('text-h3', 'font-bold');
    expect(screen.getByRole('link', { name: 'Featured article title' })).toHaveAttribute('href', '/news/f');
    expect(screen.getByText('An excerpt about the article.')).toHaveClass('text-body-lg');
    expect(screen.getAllByText('October 12, 2026', { selector: 'time' }).length).toBeGreaterThan(0);
    expect(screen.getByText('Read more')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('img', { name: 'Photo f' })).toHaveClass('aspect-[16/9]', 'rounded-card');
  });

  it('lists the latest articles as compact rows in a dark panel, the last without a divider', () => {
    render(<FeaturedNews {...props} />);
    const panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('bg-bg-inverse');
    expect(within(panel).getByRole('heading', { level: 2, name: 'Latest articles' })).toBeInTheDocument();
    const rows = within(panel).getAllByRole('article');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveClass('border-b');
    expect(rows[2]).not.toHaveClass('border-b');
  });

  it('omits the excerpt when absent', () => {
    render(<FeaturedNews {...props} featured={{ ...props.featured, excerpt: undefined }} />);
    expect(screen.queryByText('An excerpt about the article.')).toBeNull();
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <FeaturedNews {...props} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
