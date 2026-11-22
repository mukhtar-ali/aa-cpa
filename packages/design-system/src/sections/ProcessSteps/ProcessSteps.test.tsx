import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ProcessSteps } from './ProcessSteps';

const steps = [
  { index: 1, title: 'Intro call', body: 'We understand your business and deadlines.' },
  { index: 2, title: 'Quote within 7 working days', body: 'A written quote with scope and fees.' },
  { index: 3, title: 'Partner-led fieldwork', body: 'A licensed partner supervises the team.' },
  { index: 4, title: 'Signed report and handover', body: 'Ready for banks and boards.' },
];

describe('ProcessSteps', () => {
  it('is an ordered list with one card per step', () => {
    render(<ProcessSteps steps={steps} locale="en" />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(list).toHaveClass('lg:grid-cols-4');
  });

  it('each step has an H3 title (H5 size) and body text; the decorative numeral is hidden from assistive technology', () => {
    render(<ProcessSteps steps={steps} locale="en" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Intro call' })).toHaveClass('text-h5', 'font-bold');
    expect(screen.getByText('We understand your business and deadlines.')).toHaveClass('text-body-sm');
    const numeral = screen.getByText('01');
    expect(numeral).toHaveAttribute('aria-hidden', 'true');
    expect(numeral).toHaveClass('text-h1', 'text-transparent');
  });

  it('pads single digits with Western digits in both locales', () => {
    const { rerender } = render(<ProcessSteps steps={steps} locale="ar" />);
    expect(screen.getByText('04')).toBeInTheDocument();
    rerender(<ProcessSteps steps={[{ index: 12, title: 'T', body: 'B' }]} locale="en" />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('cards are bordered with the 20 px radius', () => {
    render(<ProcessSteps steps={steps} />);
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('rounded-card', 'border-border-decor', 'bg-transparent', 'lg:min-h-80');
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ProcessSteps steps={steps} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
