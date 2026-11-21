import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SectorIndex } from './SectorIndex';

const sectors = [
  { id: 'construction', title: 'Contracting and construction', summary: 'Project accounting and audit for contractors.', href: '/sectors/construction' },
  { id: 'retail', title: 'Retail and trade', summary: 'Inventory and margin assurance.' },
  { id: 'health', title: 'Healthcare', summary: 'Compliance for providers.', href: '/sectors/health' },
];

describe('SectorIndex', () => {
  it('is a labelled list with a top hairline and a divider under each row', () => {
    render(<SectorIndex sectors={sectors} label="Sectors we serve" />);
    const list = screen.getByRole('list', { name: 'Sectors we serve' });
    expect(list).toHaveClass('border-t', 'border-border-subtle');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveClass('border-b', 'border-border-subtle');
  });

  it('rows with an href are links containing an H3 (H4 size), the summary and a mirrored arrow; others are plain', () => {
    const { container } = render(<SectorIndex sectors={sectors} label="x" />);
    const link = screen.getByRole('link', { name: /Contracting and construction/ });
    expect(link).toHaveAttribute('href', '/sectors/construction');
    expect(within(link).getByRole('heading', { level: 3 })).toHaveClass('text-h4', 'font-bold');
    expect(link.querySelector('svg')).toHaveClass('rtl:-scale-x-100');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(container.querySelectorAll('li')[1]!.querySelector('a')).toBeNull();
  });

  it('rows use 24 px vertical padding and a 48 px gap from md', () => {
    const { container } = render(<SectorIndex sectors={sectors} label="x" />);
    expect(container.querySelector('li > a')).toHaveClass('py-6', 'md:gap-12');
    expect(screen.getByText('Project accounting and audit for contractors.')).toHaveClass('text-body-lg', 'md:w-130');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <SectorIndex sectors={sectors} label="Sectors" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
