import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CaseStories, CaseStoryCard } from './CaseStories';

const make = (n: number) => ({ title: `Case ${n}`, sector: 'Contracting', service: 'External audit', image: { src: `/c${n}.jpg`, alt: `Photo ${n}`, width: 267, height: 250 }, href: `/cases/${n}`, ctaLabel: 'Read the story' });

describe('CaseStoryCard', () => {
  it('is an article with the photo, gradient sector tag, H3 title (H6 size), service line and a decorative read-more', () => {
    render(<CaseStoryCard story={make(1)} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo 1' })).toHaveClass('h-62.5', 'rounded-image', 'object-cover');
    expect(screen.getByText('Contracting').parentElement).toHaveClass('bg-clip-text');
    expect(screen.getByRole('heading', { level: 3, name: 'Case 1' })).toHaveClass('text-h6');
    expect(screen.getByRole('link', { name: 'Case 1' })).toHaveAttribute('href', '/cases/1');
    expect(screen.getByText('External audit')).toHaveClass('text-text-muted');
    expect(screen.getByText('Read the story')).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits the service line when absent', () => {
    render(<CaseStoryCard story={{ ...make(1), service: undefined }} />);
    expect(screen.queryByText('External audit')).toBeNull();
  });
});

describe('CaseStories', () => {
  it('is the ice band with an H2 and a four-across list of cards', () => {
    const { container } = render(<CaseStories title="Stories from the sectors" stories={[1, 2, 3, 4].map(make)} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-surface-ice');
    expect(screen.getByRole('heading', { level: 2, name: 'Stories from the sectors' })).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(list).toHaveClass('lg:grid-cols-4');
    expect(within(list).getAllByRole('article')).toHaveLength(4);
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <CaseStories title="Stories" stories={[1, 2].map(make)} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
