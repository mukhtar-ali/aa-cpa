import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { MobileNav } from './MobileNav';

// The sheet is a lazy chunk; load it once up front so the first click does not wait for the module transform.
beforeAll(async () => {
  await import('./MobileNavSheet');
}, 60_000);

const nav = [
  { label: 'Home', href: '#home', active: true },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];
const cta = { label: 'Request a quote', href: '/quote' };

const setup = () =>
  render(
    <MobileNav
      nav={nav}
      cta={cta}
      menuLabel="Menu"
      closeLabel="Close menu"
      navLabel="Main"
      localeSwitch={<a href="/ar">العربية</a>}
    />,
  );

describe('MobileNav', () => {
  it('shows only the menu button until opened', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a labelled dialog with the nav, CTA and language switch', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const dialog = await screen.findByRole('dialog', { name: 'Menu' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Services' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute('href', '/quote');
    expect(screen.getByRole('link', { name: 'العربية' })).toBeInTheDocument();
  });

  it('is a side sheet from the inline end', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(await screen.findByRole('dialog')).toHaveClass('fixed', 'inset-y-0', 'end-0');
  });

  it('moves focus into the panel and traps Tab inside it', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 12; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('Escape closes the panel and returns focus to the menu button', async () => {
    setup();
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('the close button closes the panel', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('activating a link closes the panel', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await userEvent.click(await screen.findByRole('link', { name: 'Services' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s (closed and open)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <MobileNav nav={nav} cta={cta} menuLabel="Menu" closeLabel="Close menu" navLabel="Main" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('clicking the language link closes the sheet', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('link', { name: 'العربية' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
