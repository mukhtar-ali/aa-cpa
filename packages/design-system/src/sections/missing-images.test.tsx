import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCardCompact, CaseStoryCard, FeaturedNews, GapSection, NewsCard } from './index';

/**
 * Content without a photo (a new article before the editor uploads a cover, a CMS home without gap images) must render, not crash:
 * the web mappers return no image for missing data and the page is built from these components.
 */
const article = { id: '1', title: 'Zakat guide', category: 'Zakat', date: '2026-01-05', href: '/ar/articles/zakat' };

describe('sections without an image', () => {
  it('NewsCard renders a decorative placeholder instead of a photo', () => {
    const { container } = render(<NewsCard article={article} readMoreLabel="Read more" locale="en" />);
    expect(screen.getByRole('heading', { name: 'Zakat guide' })).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('ArticleCardCompact and FeaturedNews render', () => {
    const { container } = render(
      <div>
        <ArticleCardCompact article={article} locale="en" />
        <FeaturedNews featured={article} latest={[article]} latestTitle="Latest" readMoreLabel="Read more" locale="en" />
      </div>,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getAllByText('Zakat guide').length).toBeGreaterThan(0);
  });

  it('CaseStoryCard renders', () => {
    const { container } = render(<CaseStoryCard story={{ title: 'Audit story', sector: 'Retail', href: '/ar', ctaLabel: 'Read' }} />);
    expect(screen.getByRole('heading', { name: 'Audit story' })).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('GapSection renders with no, one or two photos', () => {
    const photo = (n: number) => ({ src: `/p${n}.jpg`, alt: '', width: 100, height: 100, decorative: true });
    const none = render(<GapSection statement="S" eyebrow="E" body="B" />);
    expect(none.container.querySelectorAll('img')).toHaveLength(0);
    none.unmount();
    const one = render(<GapSection statement="S" eyebrow="E" body="B" images={[photo(1)]} />);
    expect(one.container.querySelectorAll('img')).toHaveLength(1);
    one.unmount();
    const two = render(<GapSection statement="S" eyebrow="E" body="B" images={[photo(1), photo(2)]} />);
    expect(two.container.querySelectorAll('img')).toHaveLength(2);
  });
});
