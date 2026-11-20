import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TimelineStepper } from './TimelineStepper';

const steps = [
  { index: 1, title: 'Application review', body: 'We read every application.' },
  { index: 2, title: 'Interview', body: 'A conversation with the partner.' },
  { index: 3, title: 'Offer', body: 'A written offer within a week.' },
];

describe('TimelineStepper', () => {
  it('is an ordered list with a numbered pill, an H3 title (H5 size) and text per step', () => {
    render(<TimelineStepper steps={steps} locale="en" />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 3, name: 'Interview' })).toHaveClass('text-h5', 'font-bold');
    expect(screen.getByText('01')).toHaveClass('size-12', 'rounded-full');
    expect(screen.getByText('A written offer within a week.')).toHaveClass('text-body-sm');
  });

  it('is horizontal from md and vertical below', () => {
    render(<TimelineStepper steps={steps} />);
    expect(screen.getByRole('list')).toHaveClass('flex-col', 'md:flex-row');
  });

  it('highlights the current step with the inverse pill and aria-current=step', () => {
    render(<TimelineStepper steps={steps} current={2} locale="en" />);
    expect(screen.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('02')).toHaveClass('bg-bg-inverse', 'text-text-inverse');
    expect(screen.getByText('01')).toHaveClass('border-border-subtle', 'bg-bg-surface');
  });

  it('draws connectors between steps only (decorative), none after the last', () => {
    const { container } = render(<TimelineStepper steps={steps} />);
    expect(container.querySelectorAll('li > span[aria-hidden="true"]')).toHaveLength(2);
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <TimelineStepper steps={steps} current={1} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
