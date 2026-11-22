import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { StatsStrip, StatTile, formatStat } from './StatsStrip';

const stats = [
  { value: 522, label: 'SOCPA licence number' },
  { value: 4, suffix: 'weeks', label: 'Average review turnaround' },
  { value: 120, prefix: '+', label: 'Clients in 8 sectors' },
  { value: 10, suffix: 'years', label: 'Of professional practice' },
];

describe('formatStat', () => {
  it('combines prefix, value and suffix with Western digits', () => {
    expect(formatStat({ value: 120, prefix: '+', label: 'x' }, 'ar')).toBe('+120');
    expect(formatStat({ value: 4, suffix: 'أسابيع', label: 'x' }, 'ar')).toBe('4 أسابيع');
    expect(formatStat({ value: 12000000, label: 'x' }, 'ar')).toBe('12,000,000');
    expect(formatStat({ value: 12000000, label: 'x' }, 'en')).toBe('12,000,000');
  });

  it('passes string values through unchanged', () => {
    expect(formatStat({ value: '24/7', label: 'x' }, 'en')).toBe('24/7');
  });
});

describe('StatsStrip', () => {
  it('is a list with one item per statistic', () => {
    render(<StatsStrip stats={stats} />);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('+120')).toBeInTheDocument();
    expect(screen.getByText('4 weeks')).toBeInTheDocument();
    expect(screen.getByText('Clients in 8 sectors')).toBeInTheDocument();
  });

  it('dark tone is the pine-900 proof box with 20 px radius and pine dividers after the first item', () => {
    render(<StatsStrip stats={stats} />);
    const list = screen.getByRole('list');
    expect(list).toHaveClass('bg-pine-900', 'rounded-card');
    const items = within(list).getAllByRole('listitem');
    expect(items[0]).not.toHaveClass('lg:border-s');
    expect(items[1]).toHaveClass('lg:border-s', 'lg:border-pine-700');
  });

  it('light tone is a bordered white card', () => {
    render(<StatsStrip stats={stats} tone="light" />);
    expect(screen.getByRole('list')).toHaveClass('bg-bg-surface', 'border-border-subtle');
  });

  it('values use the gradient accent at the H2 size', () => {
    render(<StatTile stat={stats[0]!} />);
    expect(screen.getByText('522').closest('p')).toHaveClass('text-h2', 'font-bold', 'text-transparent', 'bg-clip-text', 'to-gradient-end-text-large');
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s (dark and light)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <StatsStrip stats={stats} locale={lang} />
        <StatsStrip stats={stats} tone="light" locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('StatsStrip bidi', () => {
  it('isolates the value so a prefix or unit cannot jump sides in right-to-left text', () => {
    const { container } = render(<StatTile stat={{ value: 120, prefix: '+', label: 'clients' }} locale="ar" />);
    expect(container.querySelector('bdi')).toHaveAttribute('dir', 'ltr');
    expect(container.querySelector('bdi')).toHaveTextContent('+120');
  });
});
