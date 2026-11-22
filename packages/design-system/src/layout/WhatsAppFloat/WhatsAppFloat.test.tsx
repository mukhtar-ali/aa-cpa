import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { WhatsAppFloat } from './WhatsAppFloat';

describe('WhatsAppFloat', () => {
  it('is an external link named by its label', () => {
    render(<WhatsAppFloat href="https://wa.me/966500000000" label="WhatsApp" />);
    const link = screen.getByRole('link', { name: 'WhatsApp' });
    expect(link).toHaveAttribute('href', 'https://wa.me/966500000000');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('is fixed 24 px from the bottom and the inline end, above the safe area', () => {
    render(<WhatsAppFloat href="#" label="WhatsApp" />);
    expect(screen.getByRole('link')).toHaveClass('fixed', 'end-6', 'bottom-6', 'mb-[env(safe-area-inset-bottom)]');
  });

  it('matches the Figma pill: paper fill, full radius, 24/16 padding, shadow', () => {
    render(<WhatsAppFloat href="#" label="WhatsApp" />);
    expect(screen.getByRole('link')).toHaveClass('rounded-full', 'bg-bg-page', 'px-6', 'py-4', 'shadow-float', 'text-text-strong');
  });

  it('has a decorative icon', () => {
    const { container } = render(<WhatsAppFloat href="#" label="WhatsApp" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <WhatsAppFloat href="https://wa.me/966500000000" label={lang === 'ar' ? 'واتساب' : 'WhatsApp'} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
