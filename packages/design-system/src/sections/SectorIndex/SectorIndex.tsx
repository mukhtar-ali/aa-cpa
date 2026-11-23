import { HeadingTag, type HeadingLevel } from '../../lib/heading-tag';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { SectorSummary } from '../../types';

export interface SectorIndexProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Heading level of the card title (default 3), so the card fits the page's heading outline. */
  headingLevel?: HeadingLevel;
  sectors: SectorSummary[];
  /** Accessible name of the list, for example "Sectors we serve". */
  label: string;
}

/**
 * Sector guide (Figma 547:4555, "Sector index"): a hairline-bordered list; each row has 24 px vertical padding, 48 px between the name and the
 * description, and a 1 px divider. A row links to the sector page when it has an `href`. Figma: description 18 px in a 520 px column, title 30 px; mapped to the nearest scale steps (body-lg 19 px, h4 28 px).
 *
 * @figma 547:4555
 */
export const SectorIndex = React.forwardRef<HTMLUListElement, SectorIndexProps & React.HTMLAttributes<HTMLUListElement>>(({ sectors, label, headingLevel = 3, className, ...props }, ref) => (
  <ul ref={ref} aria-label={label} className={cn('flex flex-col border-t border-solid border-border-subtle', className)} {...(props as React.HTMLAttributes<HTMLUListElement>)}>
    {sectors.map((sector) => {
      const body = (
        <>
          <HeadingTag level={headingLevel} className="text-h4 font-bold text-text-heading md:flex-1">{sector.title}</HeadingTag>
          <p className="text-body-lg text-text-body md:w-130 md:shrink-0">{sector.summary}</p>
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
