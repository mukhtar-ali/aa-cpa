import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';

export interface ConsentBannerTexts {
  /** Optional header title, e.g. "Privacy & Cookies" / "ملفات تعريف الارتباط والخصوصية" */
  title?: string;
  /** Explanatory description of cookie usage */
  description: string;
  /** Label for accepting all categories, e.g. "Accept all" / "قبول الكل" */
  acceptAll: string;
  /** Label for rejecting non-essential cookies, e.g. "Reject non-essential" / "رفض غير الأساسية" */
  rejectAll: string;
  /** Label for opening preferences modal, e.g. "Preferences" / "تخصيص الخيارات" */
  customize: string;
}

export interface ConsentBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the banner is currently displayed. */
  open: boolean;
  /** Bilingual texts supplied via props. */
  texts: ConsentBannerTexts;
  /** Handler when user accepts all optional categories. */
  onAcceptAll: () => void;
  /** Handler when user rejects optional categories. */
  onRejectAll: () => void;
  /** Handler when user clicks customize / preferences. */
  onCustomize: () => void;
  className?: string;
}

/**
 * Non-modal cookie consent banner displayed at the bottom of the viewport.
 *
 * Decision note: There is no approved Figma frame for the consent banner. This component extends
 * the established visual language using the standard surface (`bg-bg-surface`), border (`border-border-decor`),
 * elevation shadow (`shadow-float`), and standard button primitives (`Button`).
 * On mobile viewports, the banner is rendered as a floating bottom panel with z-index 30, keeping it
 * below higher-priority interactive targets such as the floating WhatsApp contact action (`z-40`), ensuring
 * it does not cover or block the primary CTA on mobile devices.
 */
export const ConsentBanner = React.forwardRef<HTMLDivElement, ConsentBannerProps>(
  ({ open, texts, onAcceptAll, onRejectAll, onCustomize, className, ...props }, ref) => {
    if (!open) return null;

    return (
      <aside
        ref={ref}
        role="region"
        aria-label={texts.title || 'Cookie consent'}
        className={cn(
          'fixed inset-x-4 bottom-4 z-30 mb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:start-6 sm:bottom-6 sm:max-w-xl',
          'rounded-card border border-border-decor bg-bg-surface p-6 shadow-float',
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-4">
          {texts.title ? (
            <h2 className="text-h6 font-bold text-text-heading">{texts.title}</h2>
          ) : null}
          <p className="text-body-sm text-text-body">{texts.description}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={onAcceptAll}>
              {texts.acceptAll}
            </Button>
            <Button variant="secondary" size="sm" onClick={onRejectAll}>
              {texts.rejectAll}
            </Button>
            <Button variant="link" size="sm" onClick={onCustomize}>
              {texts.customize}
            </Button>
          </div>
        </div>
      </aside>
    );
  },
);

ConsentBanner.displayName = 'ConsentBanner';
