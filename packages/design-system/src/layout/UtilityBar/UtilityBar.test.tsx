import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { UtilityBar } from './UtilityBar';
import { LanguageToggle } from '../../primitives/LanguageToggle';

const props = {
  license: 'SOCPA licence No. 522',
  network: 'Independent member of 3E Accounting (80+ countries)',
  city: 'Riyadh · Qassim',
  phone: { type: 'phone' as const, label: 'Phone', value: '+966 55 534 6560' },
};

describe('UtilityBar', () => {
  it('shows phone (as a tel link, left-to-right isolated), cities, network and licence', () => {
    render(<UtilityBar {...props} />);
    const link = screen.getByRole('link', { name: '+966 55 534 6560' });
    expect(link).toHaveAttribute('href', 'tel:+966555346560');
    expect(link.querySelector('bdi')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Riyadh · Qassim')).toBeInTheDocument();
    expect(screen.getByText(props.network)).toBeInTheDocument();
    expect(screen.getByText(props.license)).toBeInTheDocument();
  });

  it('uses an explicit href when the channel provides one', () => {
    render(<UtilityBar {...props} phone={{ ...props.phone, href: 'tel:+966112345678' }} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'tel:+966112345678');
  });

  it('is the dark hero bar with a 10 % white bottom border; the licence uses the gold accent', () => {
    const { container } = render(<UtilityBar {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-hero', 'border-b', 'border-text-on-action/10');
    expect(screen.getByText(props.license)).toHaveClass('font-bold', 'text-text-accent-inverse');
  });

  it('credentials are hidden below lg', () => {
    render(<UtilityBar {...props} />);
    expect(screen.getByText(props.license).parentElement).toHaveClass('hidden', 'lg:flex');
  });

  it('renders the language switch slot with a divider after it; dividers and the phone icon are decorative', () => {
    const { container } = render(<UtilityBar {...props} localeSwitch={<LanguageToggle href="/en" label="EN" targetLang="en" />} />);
    expect(screen.getByRole('link', { name: 'EN' })).toBeInTheDocument();
    expect(container.querySelectorAll('span[aria-hidden="true"]').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <UtilityBar {...props} localeSwitch={<LanguageToggle href="/x" label="EN" targetLang="en" />} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
