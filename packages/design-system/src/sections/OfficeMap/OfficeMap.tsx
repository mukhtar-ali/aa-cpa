import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { ImageRef, Office } from '../../types';

export interface OfficeMapProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  offices: Office[];
  /** Static map illustration, decorative. */
  map: ImageRef;
  /** Accessible name of the pin list, for example "Our offices". */
  label: string;
}

/**
 * Static map with office pins. The map image is decorative; the pins are a labelled list of links, positioned by `coordinates` (percent of
 * width and height, measured from the inline start and the top). Without coordinates an office is listed under the map only. The map
 * illustration exported from the contact frame (524:3651) is still to be added.
 *
 * @figma 524:3651 (unverified)
 */
export const OfficeMap = React.forwardRef<HTMLElement, OfficeMapProps>(({ offices, map, label, className, ...props }, ref) => (
  <figure ref={ref} className={cn('relative overflow-hidden rounded-card bg-bg-surface-ice', className)} {...props}>
    <img src={map.src} alt="" aria-hidden="true" width={map.width} height={map.height} className="aspect-[1140/480] w-full object-cover" />
    <ul aria-label={label} className="absolute inset-0 list-none">
      {offices
        .filter((office) => office.coordinates)
        .map((office) => (
          <li key={office.city} className="absolute -translate-y-full" style={{ insetInlineStart: `${office.coordinates!.x}%`, top: `${office.coordinates!.y}%` }}>
            <a href={office.mapHref ?? '#'} className="flex flex-col items-center gap-1 text-text-heading">
              <Icon name="location" size={28} className={office.isHeadquarters ? 'text-emerald-600' : 'text-text-link'} />
              <span className="rounded-full bg-bg-surface px-3 py-0.5 text-body-xs font-bold shadow-card-float">{office.city}</span>
            </a>
          </li>
        ))}
    </ul>
  </figure>
));
OfficeMap.displayName = 'OfficeMap';
