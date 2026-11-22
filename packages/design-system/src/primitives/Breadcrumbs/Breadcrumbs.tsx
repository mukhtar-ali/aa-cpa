import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { LinkRef } from '../../types';

export interface BreadcrumbsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Trail from the home page to the current page; the last item is the current page (rendered without a link). */
  items: LinkRef[];
  /** Accessible name of the navigation landmark, for example "Breadcrumb". */
  label: string;
  tone?: 'light' | 'dark';
}

/**
 * Breadcrumb trail. Separators are decorative chevrons that mirror in RTL. Article frame 506:2706 and job frame 514:3194 could not
 * be read, so sizes follow Body/Small and the tokens (to verify).
 *
 * @figma 506:2706, 514:3194 (unverified)
 */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(({ items, label, tone = 'light', className, ...props }, ref) => {
  if (items.length === 0) return null;
  const dark = tone === 'dark';
  return (
    <nav ref={ref} aria-label={label} className={cn('text-body-sm', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.href + item.label} className="flex items-center gap-2">
              {current ? (
                <span aria-current="page" className={cn('font-bold', dark ? 'text-text-inverse' : 'text-text-heading')}>
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={cn('underline-offset-4 hover:underline', dark ? 'text-text-inverse-muted hover:text-text-inverse' : 'text-text-muted hover:text-text-heading')}>
                  {item.label}
                </a>
              )}
              {!current ? <Icon name="chevron" size={14} className={dark ? 'text-text-inverse-muted' : 'text-text-muted'} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Breadcrumbs.displayName = 'Breadcrumbs';
