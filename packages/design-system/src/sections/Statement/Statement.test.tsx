import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Statement } from './Statement';

describe('Statement', () => {
  it('is a bold H3-sized paragraph without a heading role', () => {
    render(<Statement>Mid-sized companies deserve more.</Statement>);
    const el = screen.getByText('Mid-sized companies deserve more.');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text-h3', 'font-bold', 'text-text-heading');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('supports the dark tone and className', () => {
    render(
      <Statement tone="dark" className="max-w-xl">
        Dark
      </Statement>,
    );
    expect(screen.getByText('Dark')).toHaveClass('text-text-inverse', 'max-w-xl');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Statement>{lang === 'ar' ? 'الشركات المتوسطة تستحق أكثر.' : 'Mid-sized companies deserve more.'}</Statement>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
