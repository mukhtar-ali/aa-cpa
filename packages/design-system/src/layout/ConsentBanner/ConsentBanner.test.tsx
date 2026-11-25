import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ConsentBanner, type ConsentBannerTexts } from './ConsentBanner';

const defaultTexts: ConsentBannerTexts = {
  title: 'Cookies & Privacy',
  description: 'We use cookies to analyze site traffic and enhance your browsing experience.',
  acceptAll: 'Accept all',
  rejectAll: 'Reject non-essential',
  customize: 'Preferences',
};

describe('ConsentBanner', () => {
  it('renders correctly when open', () => {
    render(
      <ConsentBanner
        open={true}
        texts={defaultTexts}
        onAcceptAll={vi.fn()}
        onRejectAll={vi.fn()}
        onCustomize={vi.fn()}
      />,
    );

    expect(screen.getByRole('region', { name: 'Cookies & Privacy' })).toBeInTheDocument();
    expect(screen.getByText(defaultTexts.description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject non-essential' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('renders nothing when open is false', () => {
    const { container } = render(
      <ConsentBanner
        open={false}
        texts={defaultTexts}
        onAcceptAll={vi.fn()}
        onRejectAll={vi.fn()}
        onCustomize={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('triggers onAcceptAll when Accept all is clicked', async () => {
    const onAcceptAll = vi.fn();
    render(
      <ConsentBanner
        open={true}
        texts={defaultTexts}
        onAcceptAll={onAcceptAll}
        onRejectAll={vi.fn()}
        onCustomize={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    expect(onAcceptAll).toHaveBeenCalledTimes(1);
  });

  it('triggers onRejectAll when Reject non-essential is clicked', async () => {
    const onRejectAll = vi.fn();
    render(
      <ConsentBanner
        open={true}
        texts={defaultTexts}
        onAcceptAll={vi.fn()}
        onRejectAll={onRejectAll}
        onCustomize={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(onRejectAll).toHaveBeenCalledTimes(1);
  });

  it('triggers onCustomize when Preferences is clicked', async () => {
    const onCustomize = vi.fn();
    render(
      <ConsentBanner
        open={true}
        texts={defaultTexts}
        onAcceptAll={vi.fn()}
        onRejectAll={vi.fn()}
        onCustomize={onCustomize}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preferences' }));
    expect(onCustomize).toHaveBeenCalledTimes(1);
  });

  it('is keyboard navigable via Tab and Enter keys', async () => {
    const onAcceptAll = vi.fn();
    render(
      <ConsentBanner
        open={true}
        texts={defaultTexts}
        onAcceptAll={onAcceptAll}
        onRejectAll={vi.fn()}
        onCustomize={vi.fn()}
      />,
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Accept all' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onAcceptAll).toHaveBeenCalledTimes(1);
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ConsentBanner
          open={true}
          texts={{
            title: lang === 'ar' ? 'ملفات تعريف الارتباط' : 'Cookies',
            description: lang === 'ar' ? 'نستخدم ملفات الارتباط...' : 'We use cookies...',
            acceptAll: lang === 'ar' ? 'قبول الكل' : 'Accept all',
            rejectAll: lang === 'ar' ? 'رفض' : 'Reject',
            customize: lang === 'ar' ? 'تخصيص' : 'Customize',
          }}
          onAcceptAll={vi.fn()}
          onRejectAll={vi.fn()}
          onCustomize={vi.fn()}
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
