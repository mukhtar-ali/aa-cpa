import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders a pill tag with the chip border and heading text', () => {
    render(<Chip>Audit</Chip>);
    expect(screen.getByText('Audit')).toHaveClass('rounded-full', 'border-border-chip', 'text-text-heading', 'text-body-sm', 'font-bold');
  });

  it('merges className', () => {
    render(<Chip className="me-2">x</Chip>);
    expect(screen.getByText('x')).toHaveClass('me-2');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Chip>{lang === 'ar' ? 'مراجعة' : 'Audit'}</Chip>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
