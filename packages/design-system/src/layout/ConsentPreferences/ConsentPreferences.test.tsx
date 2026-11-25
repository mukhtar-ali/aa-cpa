import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ConsentPreferences, type ConsentPreferencesTexts } from './ConsentPreferences';

const defaultTexts: ConsentPreferencesTexts = {
  title: 'Cookie Preferences',
  description: 'Manage your cookie settings.',
  save: 'Save preferences',
  acceptAll: 'Accept all',
  rejectAll: 'Reject all',
  close: 'Close',
  alwaysActive: 'Always active',
};

describe('ConsentPreferences', () => {
  it('renders modal dialog with accessible title and categories when open', () => {
    render(
      <ConsentPreferences
        open={true}
        onOpenChange={vi.fn()}
        texts={defaultTexts}
        value={{ analytics: false, marketing: false }}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Cookie Preferences' })).toBeInTheDocument();
    expect(screen.getByText('Strictly Necessary')).toBeInTheDocument();
    expect(screen.getByText('Always active')).toBeInTheDocument();
    expect(screen.getByText('Analytics & Performance')).toBeInTheDocument();
    expect(screen.getByText('Marketing & Advertising')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save preferences' })).toBeInTheDocument();
  });

  it('saves per-category selection', async () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConsentPreferences
        open={true}
        onOpenChange={onOpenChange}
        texts={defaultTexts}
        value={{ analytics: false, marketing: false }}
        onSave={onSave}
      />,
    );

    const analyticsCheckbox = screen.getByRole('checkbox', { name: 'Analytics & Performance' });
    expect(analyticsCheckbox).not.toBeChecked();

    await userEvent.click(analyticsCheckbox);
    expect(analyticsCheckbox).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(onSave).toHaveBeenCalledWith({ analytics: true, marketing: false });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('accepts all optional categories', async () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConsentPreferences
        open={true}
        onOpenChange={onOpenChange}
        texts={defaultTexts}
        value={{ analytics: false, marketing: false }}
        onSave={onSave}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    expect(onSave).toHaveBeenCalledWith({ analytics: true, marketing: true });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('rejects all optional categories', async () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConsentPreferences
        open={true}
        onOpenChange={onOpenChange}
        texts={defaultTexts}
        value={{ analytics: true, marketing: true }}
        onSave={onSave}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Reject all' }));
    expect(onSave).toHaveBeenCalledWith({ analytics: false, marketing: false });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports Escape key and returns focus', async () => {
    const onOpenChange = vi.fn();

    function TestWrapper() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      const [open, setOpen] = React.useState(true);
      return (
        <div>
          <button ref={triggerRef} type="button">
            Open trigger
          </button>
          <ConsentPreferences
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              onOpenChange(next);
            }}
            texts={defaultTexts}
            value={{ analytics: false, marketing: false }}
            onSave={vi.fn()}
            returnFocusRef={triggerRef}
          />
        </div>
      );
    }

    render(<TestWrapper />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('returns focus to the element that opened it when no returnFocusRef is given', async () => {
    function Opener() {
      const [open, setOpen] = React.useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Cookie settings
          </button>
          <ConsentPreferences
            open={open}
            onOpenChange={setOpen}
            texts={defaultTexts}
            value={{ analytics: false, marketing: false }}
            onSave={vi.fn()}
          />
        </div>
      );
    }
    render(<Opener />);
    const opener = screen.getByRole('button', { name: 'Cookie settings' });
    await userEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('is centred without a horizontal translate, which pushes the box off-screen in RTL', () => {
    render(
      <div dir="rtl">
        <ConsentPreferences open onOpenChange={vi.fn()} texts={defaultTexts} value={{ analytics: false, marketing: false }} onSave={vi.fn()} />
      </div>,
    );
    const cls = screen.getByRole('dialog').className;
    expect(cls).toContain('mx-auto');
    expect(cls).not.toMatch(/translate-x/);
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ConsentPreferences
          open={true}
          onOpenChange={vi.fn()}
          texts={{
            ...defaultTexts,
            title: lang === 'ar' ? 'تفضيلات الارتباط' : 'Cookie Preferences',
          }}
          value={{ analytics: true, marketing: false }}
          onSave={vi.fn()}
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
