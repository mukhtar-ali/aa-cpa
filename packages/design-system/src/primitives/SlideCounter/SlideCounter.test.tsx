import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SlideCounter } from './SlideCounter';

describe('SlideCounter', () => {
  it('shows zero-padded Western digits isolated left-to-right', () => {
    render(<SlideCounter current={1} total={5} label="Slide" />);
    const text = screen.getByText('01 / 05');
    expect(text.tagName).toBe('BDI');
    expect(text).toHaveAttribute('dir', 'ltr');
  });

  it('is a progressbar with the current and maximum values', () => {
    render(<SlideCounter current={3} total={5} label="Slide" />);
    const bar = screen.getByRole('progressbar', { name: 'Slide' });
    expect(bar).toHaveAttribute('aria-valuemin', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuetext', '3 / 5');
  });

  it('fills the bar proportionally', () => {
    render(<SlideCounter current={2} total={4} label="Slide" />);
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('clamps out-of-range values', () => {
    const { rerender } = render(<SlideCounter current={9} total={5} label="Slide" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5');
    rerender(<SlideCounter current={0} total={5} label="Slide" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <SlideCounter current={2} total={5} label={lang === 'ar' ? 'الشريحة' : 'Slide'} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders nothing for an empty set', () => {
    const { container } = render(<SlideCounter current={1} total={0} label="Slide" />);
    expect(container).toBeEmptyDOMElement();
  });
});
