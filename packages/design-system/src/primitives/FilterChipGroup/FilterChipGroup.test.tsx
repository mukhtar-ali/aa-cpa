import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { DesignSystemProvider } from '../../layout/DesignSystemProvider/DesignSystemProvider';
import { FilterChipGroup } from './FilterChipGroup';

const items = [
  { value: 'all', label: 'All' },
  { value: 'audit', label: 'Audit' },
  { value: 'tax', label: 'Tax' },
];

function Harness({ locale = 'en', initial = 'all' }: { locale?: 'ar' | 'en'; initial?: string }) {
  const [value, setValue] = React.useState(initial);
  return (
    <DesignSystemProvider locale={locale}>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
        <FilterChipGroup label="Filter" items={items} value={value} onValueChange={setValue} />
        <output data-testid="value">{value}</output>
      </div>
    </DesignSystemProvider>
  );
}

describe('FilterChipGroup', () => {
  it('is a labelled group of toggle buttons with aria-pressed', () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: 'Filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Audit' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('selected chip uses the inverse fill, others the chip border', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-bg-inverse', 'text-text-inverse', 'h-10', 'rounded-full');
    expect(screen.getByRole('button', { name: 'Audit' })).toHaveClass('border-border-chip', 'text-text-heading');
  });

  it('clicking selects', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Tax' }));
    expect(screen.getByTestId('value')).toHaveTextContent('tax');
  });

  it('uses a roving tabindex: only the selected chip is in the tab order', () => {
    render(<Harness initial="audit" />);
    expect(screen.getByRole('button', { name: 'Audit' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('tabindex', '-1');
  });

  it('LTR: ArrowRight moves forward and ArrowLeft back, wrapping', async () => {
    render(<Harness />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'All' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Audit' })).toHaveFocus();
    expect(screen.getByTestId('value')).toHaveTextContent('audit');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Tax' })).toHaveFocus();
  });

  it('RTL: ArrowLeft moves forward and ArrowRight back (reading order)', async () => {
    render(<Harness locale="ar" />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('value')).toHaveTextContent('audit');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByTestId('value')).toHaveTextContent('all');
  });

  it('Home and End jump to the first and last chip', async () => {
    render(<Harness />);
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    expect(screen.getByTestId('value')).toHaveTextContent('tax');
    await userEvent.keyboard('{Home}');
    expect(screen.getByTestId('value')).toHaveTextContent('all');
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (locale) => {
    const { container } = render(<Harness locale={locale} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
