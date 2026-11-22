import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Header } from './Header';

// The mobile sheet is a lazy chunk; load it once so the first click does not wait for the module transform.
beforeAll(async () => {
  await import('../MobileNav/MobileNavSheet');
}, 60_000);

const nav = [
  { label: 'Home', href: '/', active: true },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
];
const props = {
  logo: <a href="/">Logo</a>,
  nav,
  cta: { label: 'Request a quote', href: '/quote' },
  menuLabel: 'Menu',
  closeLabel: 'Close menu',
  navLabel: 'Main navigation',
};

describe('Header', () => {
  it('is a banner landmark with a labelled main navigation', () => {
    render(<Header {...props} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('marks the active page with aria-current and styles it', () => {
    render(<Header {...props} />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    const home = within(nav).getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveClass('border-b-2');
    expect(within(nav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });

  it('shows the CTA as a small primary button link', () => {
    render(<Header {...props} />);
    const cta = screen.getByRole('link', { name: 'Request a quote' });
    expect(cta).toHaveAttribute('href', '/quote');
    expect(cta).toHaveClass('bg-action-primary', 'text-body-sm');
  });

  it('desktop nav and CTA are hidden below lg and the menu button is shown only there', () => {
    render(<Header {...props} />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveClass('hidden', 'lg:block');
    expect(screen.getByRole('link', { name: 'Request a quote' }).parentElement).toHaveClass('hidden', 'lg:flex');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass('lg:hidden');
  });

  it('can leave the language switch to the utility bar on desktop and keep it in the mobile menu', async () => {
    render(<Header {...props} desktopLocaleSwitch={false} localeSwitch={<a href="/en">EN</a>} />);
    expect(screen.queryByRole('link', { name: 'EN' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(await screen.findByRole('link', { name: 'EN' })).toBeInTheDocument();
  });

  it('renders the logo, the utility bar slot and the language switch', () => {
    render(<Header {...props} utility={<div data-testid="util">Utility</div>} localeSwitch={<a href="/en">EN</a>} />);
    expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument();
    expect(screen.getByTestId('util')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'EN' })).toBeInTheDocument();
  });

  it('hero theme is light text on the photo, solid theme uses the page background', () => {
    const { rerender } = render(<Header {...props} theme="hero" />);
    expect(screen.getByRole('banner')).toHaveClass('text-text-on-action');
    expect(screen.getByRole('banner')).not.toHaveClass('bg-bg-page');
    rerender(<Header {...props} theme="solid" />);
    expect(screen.getByRole('banner')).toHaveClass('bg-bg-page', 'text-text-heading');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (solid theme)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Header {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
