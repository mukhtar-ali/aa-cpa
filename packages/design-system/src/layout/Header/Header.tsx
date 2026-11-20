import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button';
import type { ActionRef, NavItem } from '../../types';
import { Container } from '../Container';
import { MobileNav } from '../MobileNav';

export interface HeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Logo element (usually `<Logo>` inside a link to the home page). */
  logo: React.ReactNode;
  nav: NavItem[];
  cta: ActionRef;
  /** Optional `UtilityBar` rendered above the main row. */
  utility?: React.ReactNode;
  /** Language switch element shown after the CTA (and inside the mobile panel). */
  localeSwitch?: React.ReactNode;
  menuLabel: string;
  closeLabel: string;
  /** Accessible name of the main navigation landmark. */
  navLabel: string;
  /** `hero` sits on a dark photo (white text, transparent); `solid` uses the page background. Default `solid`. */
  theme?: 'hero' | 'solid';
}

/**
 * Site header (Figma 411:3807): logo at the inline start, nav links (Body/Medium Bold, 40 px gaps), call-to-action and language
 * switch at the end. Below `lg` the nav collapses into the `MobileNav` side sheet. Server shell; only MobileNav is client.
 * Active link style and header height are not specified in the frames (to verify).
 *
 * @figma 2:3, 411:3807
 */
export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ logo, nav, cta, utility, localeSwitch, menuLabel, closeLabel, navLabel, theme = 'solid', className, ...props }, ref) => {
    const hero = theme === 'hero';
    return (
      <header
        ref={ref}
        data-theme={theme}
        className={cn('relative z-30 w-full', hero ? 'text-text-on-action' : 'border-b border-border-decor bg-bg-page text-text-heading', className)}
        {...props}
      >
        {utility}
        <Container className="flex min-h-24 items-center justify-between gap-6">
          <div className="shrink-0">{logo}</div>
          <nav aria-label={navLabel} className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.active ? 'page' : undefined}
                    className={cn(
                      'text-body-md font-bold whitespace-nowrap transition-opacity duration-(--motion-duration-fast) ease-standard hover:opacity-80',
                      item.active && 'border-b-2 border-current pb-1',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden items-center gap-6 lg:flex">
            <Button href={cta.href} size="sm" variant={cta.variant ?? 'primary'}>
              {cta.label}
            </Button>
            {localeSwitch}
          </div>
          <MobileNav className="lg:hidden" nav={nav} cta={cta} localeSwitch={localeSwitch} menuLabel={menuLabel} closeLabel={closeLabel} navLabel={navLabel} theme={theme} />
        </Container>
      </header>
    );
  },
);
Header.displayName = 'Header';
