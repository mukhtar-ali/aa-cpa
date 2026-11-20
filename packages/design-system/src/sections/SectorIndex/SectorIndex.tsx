import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { SectorSummary } from '../../types';

export interface SectorIndexProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  sectors: SectorSummary[];
  /** Accessible name of the list, for example "Sectors we serve". */
  label: string;
}

/**
 * Sector guide (Figma 547:4555, "Sector index"): a hairline-bordered list; each row has 24 px vertical padding, 48 px between the name and the
 * description, and a 1 px divider. A row links to the sector page when it has an `href`. Row typography is inferred (to verify).
 *
 * @figma 547:4555
 */
export const SectorIndex = React.forwardRef<HTMLUListElement, SectorIndexProps & React.HTMLAttributes<HTMLUListElement>>(({ sectors, label, className, ...props }, ref) => (
  <ul ref={ref} aria-label={label} className={cn('flex flex-col border-t border-solid border-border-subtle', className)} {...(props as React.HTMLAttributes<HTMLUListElement>)}>
    {sectors.map((sector) => {
      const body = (
        <>
          <h3 className="text-h5 font-bold text-text-heading md:w-72 md:shrink-0">{sector.title}</h3>
          <p className="flex-1 text-body-md text-text-body">{sector.summary}</p>
          {sector.href ? <Icon name="arrow" size={20} className="shrink-0 text-text-heading" /> : null}
        </>
      );
      return (
        <li key={sector.id} className="border-b border-solid border-border-subtle">
          {sector.href ? (
            <a href={sector.href} className="group flex flex-col gap-3 py-6 outline-none transition-colors duration-(--motion-duration-fast) hover:bg-bg-surface focus-visible:ring-3 focus-visible:ring-ring-focus md:flex-row md:items-center md:gap-12">
              {body}
            </a>
          ) : (
            <div className="flex flex-col gap-3 py-6 md:flex-row md:items-center md:gap-12">{body}</div>
          )}
        </li>
      );
    })}
  </ul>
));
SectorIndex.displayName = 'SectorIndex';
