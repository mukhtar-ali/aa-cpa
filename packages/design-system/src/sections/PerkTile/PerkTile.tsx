import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import type { Perk } from '../../types';

export interface PerkTileProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  perk: Perk;
}

/**
 * Perk tile (Figma 529:4296): ice-blue tile with 18 px radius, Body/Medium Bold title and Body/Small text. An optional icon (from the
 * icon set) is shown above the title; the Figma tile has none.
 *
 * @figma 529:4296
 */
export const PerkTile = React.forwardRef<HTMLElement, PerkTileProps>(({ perk, className, ...props }, ref) => (
  <article ref={ref} className={cn('flex min-h-22 flex-col gap-1 rounded-perk bg-bg-surface-ice p-5', className)} {...props}>
    {perk.icon ? <Icon name={perk.icon as IconName} size={20} className="mb-2 text-emerald-600" /> : null}
    <h3 className="text-body-md font-bold text-text-heading">{perk.title}</h3>
    <p className="text-body-sm text-text-body">{perk.body}</p>
  </article>
));
PerkTile.displayName = 'PerkTile';
