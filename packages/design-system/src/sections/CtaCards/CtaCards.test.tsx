import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CtaCards } from './CtaCards';

const cards = [
  { icon: 'help' as const, title: 'Explore the FAQ', body: 'Scroll down to find answers to the most common questions.', action: { label: 'FAQ', href: '#faq' } },
  { icon: 'message' as const, title: 'Talk to an expert', body: 'Share a few details about your business.', action: { label: 'Contact', href: '/contact' }, tone: 'dark' as const },
];

describe('CtaCards', () => {
  it('lists the cards with an H3 title (H4 size), text and a button link each', () => {
    render(<CtaCards cards={cards} />);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('heading', { level: 3, name: 'Explore the FAQ' })).toHaveClass('text-h4', 'font-bold');
    expect(screen.getByText(cards[0]!.body)).toHaveClass('text-body-md');
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '#faq');
  });

  it('light card is white with the 24 px radius and a 64 px emerald-100 icon circle', () => {
    const { container } = render(<CtaCards cards={cards} />);
    const light = screen.getAllByRole('listitem')[0]!;
    expect(light).toHaveClass('bg-bg-surface', 'rounded-cta');
    const circle = container.querySelector('li span')!;
    expect(circle).toHaveClass('size-16', 'rounded-full', 'bg-emerald-100');
    expect(circle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('dark card is the inverse tone with flow lines and a paper button', () => {
    const { container } = render(<CtaCards cards={cards} />);
    const dark = screen.getAllByRole('listitem')[1]!;
    expect(dark).toHaveClass('bg-bg-inverse', 'text-text-inverse');
    expect(dark.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveClass('bg-bg-page', 'text-text-strong');
    expect(container.querySelectorAll('li')[0]!.querySelector('div[aria-hidden]')).toBeNull();
  });

  it('shows an optional heading', () => {
    render(<CtaCards title="Not sure the service is for you?" cards={cards} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Not sure the service is for you?' })).toBeInTheDocument();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <CtaCards title="Not sure?" cards={cards} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
