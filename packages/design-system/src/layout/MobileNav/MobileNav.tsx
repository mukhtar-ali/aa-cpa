'use client';

import * as React from 'react';
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

const MobileNavSheet = React.lazy(() => import('./MobileNavSheet'));

/**
 * Menu button + side sheet from the inline end (Radix Dialog: focus trap, Escape closes, focus returns to the button).
 * The sheet is a separate chunk loaded on the first click, which keeps about 10 kB of Radix out of the initial JavaScript.
 * Not in the approved Figma frames: this is a team design that needs client review (spec FR-031).
 */
export function MobileNav({ nav, cta, localeSwitch, menuLabel, closeLabel, navLabel, theme = 'solid', className }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <IconButton
        ref={triggerRef}
        label={menuLabel}
        icon="menu"
        variant={theme === 'hero' ? 'ghost-light' : 'outline'}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
      />
      {loaded ? (
        <React.Suspense fallback={null}>
          <MobileNavSheet nav={nav} cta={cta} localeSwitch={localeSwitch} menuLabel={menuLabel} closeLabel={closeLabel} navLabel={navLabel} open={open} onOpenChange={setOpen} returnFocusRef={triggerRef} />
        </React.Suspense>
      ) : null}
    </>
  );
}
