import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { RelatedCarousel } from './RelatedCarousel';

const articles = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `a${n}`,
  title: `Related article ${n}`,
  category: 'Tax and zakat',
  date: '2026-10-05',
  image: { src: `/a${n}.jpg`, alt: `Cover ${n}`, width: 267, height: 250 },
  href: `/news/${n}`,
}));
const props = { title: 'Related articles', articles, readMoreLabel: 'Read more', prevLabel: 'Previous', nextLabel: 'Next', progressLabel: 'Related articles', locale: 'en' as const };

afterEach(() => vi.restoreAllMocks());

function setMetrics(track: HTMLElement, m: { scrollLeft: number; scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(track, 'scrollWidth', { value: m.scrollWidth, configurable: true });
  Object.defineProperty(track, 'clientWidth', { value: m.clientWidth, configurable: true });
  track.scrollLeft = m.scrollLeft;
  fireEvent.scroll(track);
}

describe('RelatedCarousel', () => {
  it('has the heading, a list of cards with gradient category tags, and the controls', () => {
    const { container } = render(<RelatedCarousel {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Related articles' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(container.querySelector('li.snap-start')).toHaveClass('w-66.75', 'shrink-0');
    expect(screen.getAllByText('Tax and zakat')[0]!.parentElement).toHaveClass('bg-clip-text');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveClass('size-12');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
  });

  it('is a CSS scroll-snap track', () => {
    const { container } = render(<RelatedCarousel {...props} />);
    expect(container.querySelector('ul')).toHaveClass('snap-x', 'snap-mandatory', 'overflow-x-auto');
  });

  it('at the start previous is disabled; the counter and progress show 1 of 6', () => {
    const { container } = render(<RelatedCarousel {...props} />);
    setMetrics(container.querySelector('ul') as HTMLElement, { scrollLeft: 0, scrollWidth: 1746, clientWidth: 1140 });
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Next' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByText('1/6')).toHaveAttribute('dir', 'ltr');
    const bar = screen.getByRole('progressbar', { name: 'Related articles' });
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '6');
  });

  it('next scrolls by one card width (267 + 24 gap) smoothly', async () => {
    const { container } = render(<RelatedCarousel {...props} />);
    const track = container.querySelector('ul') as HTMLElement;
    const card = track.firstElementChild as HTMLElement;
    Object.defineProperty(card, 'offsetWidth', { value: 267, configurable: true });
    const scrollBy = vi.fn();
    track.scrollBy = scrollBy as unknown as typeof track.scrollBy;
    setMetrics(track, { scrollLeft: 0, scrollWidth: 1746, clientWidth: 1140 });
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 291, behavior: 'smooth' });
  });

  it('in RTL it scrolls the other way', async () => {
    const { container } = render(<RelatedCarousel {...props} />);
    const track = container.querySelector('ul') as HTMLElement;
    Object.defineProperty(track.firstElementChild, 'offsetWidth', { value: 267, configurable: true });
    const scrollBy = vi.fn();
    track.scrollBy = scrollBy as unknown as typeof track.scrollBy;
    track.style.direction = 'rtl';
    setMetrics(track, { scrollLeft: 0, scrollWidth: 1746, clientWidth: 1140 });
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(scrollBy).toHaveBeenCalledWith({ left: -291, behavior: 'smooth' });
  });

  it('scrolling updates the counter, enables previous and disables next at the end', () => {
    const { container } = render(<RelatedCarousel {...props} />);
    const track = container.querySelector('ul') as HTMLElement;
    Object.defineProperty(track.firstElementChild, 'offsetWidth', { value: 267, configurable: true });
    setMetrics(track, { scrollLeft: 582, scrollWidth: 1746, clientWidth: 1140 });
    expect(screen.getByText('3/6')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).not.toHaveAttribute('aria-disabled');
    setMetrics(track, { scrollLeft: 606, scrollWidth: 1746, clientWidth: 1140 });
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses instant scrolling under prefers-reduced-motion', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...original(q), matches: true, media: q })) as typeof window.matchMedia;
    const { container } = render(<RelatedCarousel {...props} />);
    const track = container.querySelector('ul') as HTMLElement;
    Object.defineProperty(track.firstElementChild, 'offsetWidth', { value: 267, configurable: true });
    const scrollBy = vi.fn();
    track.scrollBy = scrollBy as unknown as typeof track.scrollBy;
    setMetrics(track, { scrollLeft: 0, scrollWidth: 1746, clientWidth: 1140 });
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 291, behavior: 'auto' });
    window.matchMedia = original;
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <RelatedCarousel {...props} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('when every card fits, Next is disabled and the counter shows the last card', () => {
    const { container } = render(<RelatedCarousel {...props} />);
    setMetrics(container.querySelector('ul') as HTMLElement, { scrollLeft: 0, scrollWidth: 1140, clientWidth: 1140 });
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders nothing without articles', () => {
    const { container } = render(<RelatedCarousel {...props} articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
