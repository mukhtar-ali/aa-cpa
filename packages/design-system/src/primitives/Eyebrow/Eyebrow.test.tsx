import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Eyebrow } from './Eyebrow';

describe('Eyebrow', () => {
  it('renders Body/Large Bold in the heading colour', () => {
    render(<Eyebrow>Why us</Eyebrow>);
    expect(screen.getByText('Why us')).toHaveClass('text-body-lg', 'font-bold', 'text-text-heading');
  });

  it('supports the inverse tone and className', () => {
    render(
      <Eyebrow tone="inverse" className="mb-2">
        Dark
      </Eyebrow>,
    );
    expect(screen.getByText('Dark')).toHaveClass('text-text-inverse', 'mb-2');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Eyebrow>{lang === 'ar' ? 'لماذا شركة عبدالرحمن الشبيشيري' : 'Why us'}</Eyebrow>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
