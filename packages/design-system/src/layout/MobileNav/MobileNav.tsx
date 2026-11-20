'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import { IconButton } from '../../primitives/IconButton';
import type { ActionRef, NavItem } from '../../types';

export interface MobileNavProps {
  nav: NavItem[];
  cta: ActionRef;
  /** Language switch element (for example `LanguageToggle`) rendered at the bottom of the panel. */
  localeSwitch?: React.ReactNode;
  /** Accessible name of the menu button and the panel title. */
  menuLabel: string;
  closeLabel: string;
  /** Accessible name of the navigation landmark inside the panel. */
  navLabel: string;
  /** Visual theme of the trigger: `hero` sits on a dark photo, `solid` on the page background. */
  theme?: 'hero' | 'solid';
  className?: string;
}

/**
 * Menu button + side sheet from the inline end (Radix Dialog: focus trap, Escape closes, focus returns to the button).
 * Not in the approved Figma frames: this is a team design that needs client review (spec FR-031).
 */
export function MobileNav({ nav, cta, localeSwitch, menuLabel, closeLabel, navLabel, theme = 'solid', className }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton label={menuLabel} icon="menu" variant={theme === 'hero' ? 'ghost-light' : 'outline'} className={className} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg-inverse/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 end-0 z-50 flex w-88 max-w-[88vw] flex-col gap-8 overflow-y-auto bg-bg-page p-6 shadow-float outline-none"
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-h5 font-bold text-text-heading">{menuLabel}</Dialog.Title>
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
          {localeSwitch ? <div className="mt-auto flex justify-start">{localeSwitch}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
