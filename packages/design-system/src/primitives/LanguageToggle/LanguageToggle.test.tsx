import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { LanguageToggle } from './LanguageToggle';

describe('LanguageToggle', () => {
  it('is a link to the other language with lang and hreflang on the label', () => {
    render(<LanguageToggle href="/en" label="EN" targetLang="en" />);
    const link = screen.getByRole('link', { name: 'EN' });
    expect(link).toHaveAttribute('href', '/en');
    expect(link).toHaveAttribute('hreflang', 'en');
    expect(link).toHaveAttribute('lang', 'en');
  });

  it('uses the accessible label when given', () => {
    render(<LanguageToggle href="/en" label="EN" targetLang="en" accessibleLabel="Switch to English" />);
    expect(screen.getByRole('link', { name: 'Switch to English' })).toBeInTheDocument();
  });

  it('matches the Figma pill: 11 px bold, 40 % outline, fully rounded', () => {
    render(<LanguageToggle href="/en" label="EN" targetLang="en" />);
    expect(screen.getByRole('link')).toHaveClass('rounded-full', 'border-icon-accent/40', 'text-body-xs', 'font-bold', 'px-2.5');
  });

  it('has no axe violations on a dark background in Arabic and English pages', async () => {
    for (const [lang, dir, label, target] of [['ar', 'rtl', 'EN', 'en'], ['en', 'ltr', 'عربي', 'ar']] as const) {
      const { container, unmount } = render(
        <div lang={lang} dir={dir} className="bg-bg-hero">
          <LanguageToggle href="/x" label={label} targetLang={target} />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
