import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Rating } from './Rating';

describe('Rating', () => {
  it('is one image with the accessible label and five decorative stars', () => {
    const { container } = render(<Rating value={4} label="4 of 5" />);
    expect(screen.getByRole('img', { name: '4 of 5' })).toBeInTheDocument();
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(5);
  });

  it.each([1, 2, 3, 4, 5] as const)('fills %i stars', (value) => {
    const { container } = render(<Rating value={value} label={`${value} of 5`} />);
    expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(value);
    expect(container.querySelectorAll('[data-filled="false"]')).toHaveLength(5 - value);
  });

  it('uses 22 px stars with 6 px gaps', () => {
    const { container } = render(<Rating value={5} label="5 of 5" />);
    expect(container.firstElementChild).toHaveClass('gap-1.5');
    expect(container.querySelector('svg')).toHaveAttribute('width', '22');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Rating value={5} label={lang === 'ar' ? '5 من 5' : '5 of 5'} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
