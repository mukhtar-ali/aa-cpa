import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { HomeHero } from './HomeHero';

const props = {
  title: 'Partner-led audit, backed by AI precision.',
  body: 'We combine licensed partners with smart audit technology.',
  actions: [
    { label: 'Learn more', href: '/about' },
    { label: 'Our services', href: '/services' },
  ],
  image: { src: '/hero.jpg', alt: 'Riyadh skyline', width: 630, height: 498 },
};

describe('HomeHero', () => {
  it('has the page h1, the intro paragraph and a photo', () => {
    render(<HomeHero {...props} />);
    expect(screen.getByRole('heading', { level: 1, name: props.title })).toHaveClass('bg-clip-text', 'text-transparent', 'from-gradient-start', 'to-gradient-end');
    expect(screen.getByText(props.body)).toHaveClass('text-body-lg', 'text-text-inverse-muted');
    expect(screen.getByRole('img', { name: 'Riyadh skyline' })).toHaveClass('object-cover', 'aspect-[630/498]');
  });

  it('is the dark hero tone with decorative flow lines', () => {
    const { container } = render(<HomeHero {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-hero', 'text-text-inverse');
    const pattern = container.querySelector('[aria-hidden="true"]');
    expect(pattern).not.toBeNull();
  });

  it('renders the first action as the primary button and the second as the secondary button', () => {
    render(<HomeHero {...props} />);
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveClass('bg-action-primary');
    expect(screen.getByRole('link', { name: 'Our services' })).toHaveClass('text-text-link', 'bg-bg-page');
  });

  it('works with a single action and with none', () => {
    const { rerender } = render(<HomeHero {...props} actions={[props.actions[0]!]} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    rerender(<HomeHero {...props} actions={[]} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('lays out on a 12-column grid with logical column starts so it mirrors in RTL', () => {
    render(<HomeHero {...props} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('lg:col-start-1', 'lg:col-span-6');
    expect(h1.parentElement).toHaveClass('lg:grid-cols-12');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <HomeHero {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
