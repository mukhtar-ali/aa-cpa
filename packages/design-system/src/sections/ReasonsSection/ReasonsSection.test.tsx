import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ReasonsSection } from './ReasonsSection';

const props = {
  title: 'Why do companies move to us?',
  description: 'The person who reviews your work is the one who answers your questions.',
  pillars: [
    { icon: 'scan', title: 'Technology that shortens the work', body: 'Faster deviation detection.' },
    { icon: 'hexagon-dot', title: 'Licensed partners', body: 'SOCPA licence No. 522.' },
    { icon: 'globe-check', title: 'A global network', body: '3E Accounting, 80+ countries.' },
  ],
  image: { src: '/p.jpg', alt: 'Partner meeting', width: 461, height: 542 },
  action: { label: 'Request a quote', href: '/quote' },
  stats: [
    { value: 522, label: 'SOCPA licence' },
    { value: 4, suffix: 'weeks', label: 'Average turnaround' },
    { value: 120, prefix: '+', label: 'Clients' },
    { value: 10, suffix: 'years', label: 'Practice' },
  ],
  locale: 'en' as const,
};

describe('ReasonsSection', () => {
  it('is the dark inverse band with the H2 and intro', () => {
    const { container } = render(<ReasonsSection {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-inverse', 'text-text-inverse');
    expect(screen.getByRole('heading', { level: 2, name: props.title })).toHaveClass('text-text-inverse');
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it('shows two small pillar cards and one wide card', () => {
    render(<ReasonsSection {...props} />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(cards[2]).toHaveClass('sm:col-span-2', 'sm:flex-row');
    expect(cards[0]).not.toHaveClass('sm:col-span-2');
  });

  it('puts the 461 px photo in the inline-end column below the heading row, with rounded corners', () => {
    const { container } = render(<ReasonsSection {...props} />);
    expect(container.querySelector('.lg\\:grid-cols-\\[1fr_28\\.8125rem\\]')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Partner meeting' })).toHaveClass('rounded-card', 'aspect-[461/542]');
  });

  it('shows the photo, the paper action and the statistics list', () => {
    render(<ReasonsSection {...props} />);
    expect(screen.getByRole('img', { name: 'Partner meeting' })).toHaveClass('object-cover');
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveClass('bg-bg-page', 'text-text-strong');
    const stats = screen.getByRole('list');
    expect(within(stats).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('+120')).toBeInTheDocument();
  });

  it('omits the action when none is given', () => {
    render(<ReasonsSection {...props} action={undefined} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ReasonsSection {...props} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
