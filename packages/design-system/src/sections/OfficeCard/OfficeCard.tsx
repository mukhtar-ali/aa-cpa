import * as React from 'react';
import { cn } from '../../lib/cn';
import { safeHref } from '../../lib/safe-href';
import { Icon } from '../../icons';
import type { Office } from '../../types';

export interface OfficeCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  office: Office;
}

/**
 * Office card (Figma 529:4280): white 24 px card with a subtle border, city at the H5 size, address in Body/Small and a gold "get directions"
 * link at the bottom. The headquarters flag only affects the content (for example "Riyadh – head office"), not the styling.
 *
 * @figma 529:4280
 */
export const OfficeCard = React.forwardRef<HTMLElement, OfficeCardProps>(({ office, className, ...props }, ref) => (
  <article ref={ref} className={cn('flex min-h-42.5 flex-col gap-2 rounded-cta border border-solid border-border-subtle bg-bg-surface p-6', className)} {...props}>
    <h3 className="text-h5 font-bold text-text-heading">{office.city}</h3>
    <address className="text-body-sm text-text-body not-italic">{office.address}</address>
    {safeHref(office.mapHref) && office.mapLabel ? (
      <a href={safeHref(office.mapHref)} className="mt-auto text-body-sm font-bold text-text-accent hover:underline">
        {office.mapLabel}
        <span className="sr-only">: {office.city}</span>
      </a>
    ) : null}
  </article>
));
OfficeCard.displayName = 'OfficeCard';

export interface MapLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string;
  label: string;
}

/** "View on map" button-like link (Figma 578:1293): beige fill, 2 px radius, green label and a pin; fills green on hover. */
export const MapLink = React.forwardRef<HTMLAnchorElement, MapLinkProps>(({ href, label, className, ...props }, ref) => (
  <a
    ref={ref}
    href={safeHref(href) ?? '#'}
    className={cn(
      'inline-flex h-12 items-center justify-center gap-2 rounded-button border border-solid border-action-secondary bg-bg-page px-6 text-body-md font-bold text-text-link shadow-button-primary',
      'transition-colors duration-(--motion-duration-fast) ease-standard hover:border-action-primary hover:bg-action-primary hover:text-text-on-action',
      className,
    )}
    {...props}
  >
    {label}
    <Icon name="location" size={18} />
  </a>
));
MapLink.displayName = 'MapLink';
