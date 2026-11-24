'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import { IconButton } from '../../primitives/IconButton';
import { Checkbox } from '../../forms/Checkbox';

export interface ConsentCategoryItem {
  id: 'necessary' | 'analytics' | 'marketing' | string;
  label: string;
  description: string;
  locked?: boolean;
}

export interface ConsentPreferencesTexts {
  title: string;
  description?: string;
  save: string;
  acceptAll?: string;
  rejectAll?: string;
  close?: string;
  alwaysActive?: string;
}

export interface ConsentPreferencesProps {
  /** Whether the preferences modal is currently open. */
  open: boolean;
  /** Callback to change open state (e.g. from Radix dialog close/esc). */
  onOpenChange: (open: boolean) => void;
  /** Localized copy for modal titles, buttons, and helper labels. */
  texts: ConsentPreferencesTexts;
  /** Consent categories with labels and descriptions. Defaults to necessary, analytics, marketing. */
  categories?: ConsentCategoryItem[];
  /** Current state of categories ({ analytics: boolean, marketing: boolean }). */
  value: { analytics: boolean; marketing: boolean };
  /** Callback fired when user saves their selection. */
  onSave: (categories: { analytics: boolean; marketing: boolean }) => void;
  /** Callback fired when user chooses to accept all from the preferences modal. */
  onAcceptAll?: () => void;
  /** Callback fired when user chooses to reject all optional cookies from modal. */
  onRejectAll?: () => void;
  /** Optional ref to restore focus to when the dialog closes. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const DEFAULT_CATEGORIES: ConsentCategoryItem[] = [
  {
    id: 'necessary',
    label: 'Strictly Necessary',
    description: 'Essential cookies required for core website functionality, security, and preference storage.',
    locked: true,
  },
  {
    id: 'analytics',
    label: 'Analytics & Performance',
    description: 'Help us understand how visitors interact with our website to measure performance and improve content.',
    locked: false,
  },
  {
    id: 'marketing',
    label: 'Marketing & Advertising',
    description: 'Used to deliver relevant announcements and evaluate promotional campaign efficiency.',
    locked: false,
  },
];

/**
 * Accessible cookie consent preferences modal dialog (Radix Dialog).
 *
 * Decision note: There is no approved Figma frame for the consent preferences dialog. This component extends
 * the established visual language using surface card styles, standard heading typography, Checkbox controls,
 * and Button primitives. Complies with WCAG 2.2 AA: focus trap, Escape key to close, and programmatic focus restoration.
 */
export function ConsentPreferences({
  open,
  onOpenChange,
  texts,
  categories = DEFAULT_CATEGORIES,
  value,
  onSave,
  onAcceptAll,
  onRejectAll,
  returnFocusRef,
}: ConsentPreferencesProps) {
  const [selected, setSelected] = React.useState({
    analytics: value.analytics,
    marketing: value.marketing,
  });

  // Sync internal state with prop value whenever opened
  React.useEffect(() => {
    if (open) {
      setSelected({
        analytics: value.analytics,
        marketing: value.marketing,
      });
    }
  }, [open, value.analytics, value.marketing]);

  const handleSave = () => {
    onSave(selected);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    const all = { analytics: true, marketing: true };
    setSelected(all);
    if (onAcceptAll) {
      onAcceptAll();
    } else {
      onSave(all);
    }
    onOpenChange(false);
  };

  const handleRejectAll = () => {
    const none = { analytics: false, marketing: false };
    setSelected(none);
    if (onRejectAll) {
      onRejectAll();
    } else {
      onSave(none);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-inverse/60 backdrop-blur-xs transition-opacity" />
        <Dialog.Content
          aria-describedby={texts.description ? 'consent-prefs-desc' : undefined}
          onCloseAutoFocus={(e) => {
            if (returnFocusRef?.current) {
              e.preventDefault();
              returnFocusRef.current.focus();
            }
          }}
          className={cn(
            'fixed top-1/2 start-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'max-h-[90vh] overflow-y-auto rounded-card bg-bg-page p-6 shadow-float outline-none sm:p-8',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-decor pb-4">
            <div>
              <Dialog.Title className="text-h5 font-bold text-text-heading">
                {texts.title}
              </Dialog.Title>
              {texts.description ? (
                <Dialog.Description id="consent-prefs-desc" className="mt-1 text-body-sm text-text-muted">
                  {texts.description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <IconButton label={texts.close || 'Close'} icon="close" size="sm" variant="outline" />
            </Dialog.Close>
          </div>

          <div className="flex flex-col divide-y divide-border-decor py-4">
            {categories.map((cat) => {
              const isLocked = Boolean(cat.locked);
              const isChecked = isLocked ? true : cat.id === 'analytics' ? selected.analytics : cat.id === 'marketing' ? selected.marketing : false;

              return (
                <div key={cat.id} className="flex flex-col gap-2 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-text-heading text-body-md">
                      {cat.label}
                    </span>
                    {isLocked ? (
                      <span className="rounded-full bg-bg-surface px-2.5 py-0.5 text-body-xs font-semibold text-text-muted">
                        {texts.alwaysActive || 'Always active'}
                      </span>
                    ) : (
                      <Checkbox
                        id={`consent-category-${cat.id}`}
                        aria-label={cat.label}
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (cat.id === 'analytics') {
                            setSelected((prev) => ({ ...prev, analytics: checked }));
                          } else if (cat.id === 'marketing') {
                            setSelected((prev) => ({ ...prev, marketing: checked }));
                          }
                        }}
                        label=""
                      />
                    )}
                  </div>
                  <p className="text-body-sm text-text-body">{cat.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-decor pt-4">
            {texts.rejectAll ? (
              <Button variant="secondary" size="sm" onClick={handleRejectAll}>
                {texts.rejectAll}
              </Button>
            ) : null}
            {texts.acceptAll ? (
              <Button variant="secondary" size="sm" onClick={handleAcceptAll}>
                {texts.acceptAll}
              </Button>
            ) : null}
            <Button variant="primary" size="sm" onClick={handleSave}>
              {texts.save}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
