import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MethodologyList } from './MethodologyList';

const rows = [
  { title: 'Fieldwork and testing', body: 'Substantive tests of balances, transactions and internal controls.' },
  { title: 'Reporting', body: 'A signed report ready for banks and boards.' },
];

describe('MethodologyList', () => {
  it('has an H2 and a list with one row per capability', () => {
    render(<MethodologyList title="Our methodology" rows={rows} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Our methodology' })).toHaveClass('text-h2');
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
  });

  it('each row has an H3-sized name and a Body/Large description with a hairline divider', () => {
    render(<MethodologyList title="T" rows={rows} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Reporting' })).toHaveClass('text-h3', 'font-bold');
    expect(screen.getByText('A signed report ready for banks and boards.')).toHaveClass('text-body-lg');
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('border-b', 'border-black/6', 'py-6');
  });

  it('uses the blue-950 text colour', () => {
    const { container } = render(<MethodologyList title="T" rows={rows} />);
    expect(container.firstElementChild).toHaveClass('text-blue-950');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <MethodologyList title="Our methodology" rows={rows} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
