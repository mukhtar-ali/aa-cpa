'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import { IconButton } from '../../primitives/IconButton';
import type { MobileNavProps } from './MobileNav';

export interface MobileNavSheetProps extends Pick<MobileNavProps, 'nav' | 'cta' | 'localeSwitch' | 'menuLabel' | 'closeLabel' | 'navLabel'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element that receives focus when the sheet closes (the menu button). */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

/** The side sheet itself. Loaded on first open (see MobileNav) so Radix Dialog stays out of the initial client bundle. */
export default function MobileNavSheet({ nav, cta, localeSwitch, closeLabel, navLabel, open, onOpenChange, returnFocusRef }: MobileNavSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg-inverse/60" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
          className="fixed inset-y-0 end-0 z-50 flex w-88 max-w-[88vw] flex-col gap-8 overflow-y-auto bg-bg-page p-6 shadow-float outline-none"
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-h5 font-bold text-text-heading">{navLabel}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label={closeLabel} icon="close" size="sm" />
            </Dialog.Close>
          </div>
          <nav aria-label={navLabel}>
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={`${item.href}-${item.label}`} className="border-b border-border-decor">
                  <Dialog.Close asChild>
                    <a
                      href={item.href}
                      aria-current={item.active ? 'page' : undefined}
                      className={cn('block py-4 text-body-lg font-bold text-text-heading', item.active && 'text-text-link')}
                    >
                      {item.label}
                    </a>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>
          <Dialog.Close asChild>
            <Button href={cta.href} variant={cta.variant ?? 'primary'} size="lg" className="w-full">
              {cta.label}
            </Button>
          </Dialog.Close>
          {localeSwitch ? (
            // Clicking the language link closes the sheet (it matters when the link stays on the same page).
            <div className="mt-auto flex justify-start" onClickCapture={() => onOpenChange(false)}>
              {localeSwitch}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
