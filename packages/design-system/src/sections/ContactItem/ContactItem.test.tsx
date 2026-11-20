import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ContactItem } from './ContactItem';

describe('ContactItem', () => {
  it('phone is a tel link with a left-to-right isolated value', () => {
    render(<ContactItem channel={{ type: 'phone', label: 'Phone', value: '+966 55 534 6560' }} />);
    const link = screen.getByRole('link', { name: '+966 55 534 6560' });
    expect(link).toHaveAttribute('href', 'tel:+966555346560');
    expect(link.querySelector('bdi')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Phone')).toHaveClass('text-text-muted', 'text-body-sm');
  });

  it('email is a mailto link; WhatsApp opens wa.me in a new tab', () => {
    const { rerender } = render(<ContactItem channel={{ type: 'email', label: 'Email', value: 'info@aacpa.sa' }} />);
    expect(screen.getByRole('link', { name: 'info@aacpa.sa' })).toHaveAttribute('href', 'mailto:info@aacpa.sa');
    rerender(<ContactItem channel={{ type: 'whatsapp', label: 'WhatsApp', value: '+966 55 534 6560' }} />);
    const wa = screen.getByRole('link', { name: '+966 55 534 6560' });
    expect(wa).toHaveAttribute('href', 'https://wa.me/966555346560');
    expect(wa).toHaveAttribute('target', '_blank');
  });

  it('opening hours are plain text without a link', () => {
    render(<ContactItem channel={{ type: 'hours', label: 'Hours', value: 'Sun to Thu, 9 am to 5 pm' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Sun to Thu, 9 am to 5 pm')).toHaveClass('font-bold');
  });

  it('an explicit href wins and the icon sits in a 48 px emerald-100 circle', () => {
    const { container } = render(<ContactItem channel={{ type: 'phone', label: 'Phone', value: '011 000 0000', href: 'tel:+966110000000' }} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'tel:+966110000000');
    const circle = container.querySelector('span')!;
    expect(circle).toHaveClass('size-12', 'rounded-full', 'bg-emerald-100');
    expect(circle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ContactItem channel={{ type: 'phone', label: 'Phone', value: '+966 55 534 6560' }} />
        <ContactItem channel={{ type: 'hours', label: 'Hours', value: '9 to 5' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
