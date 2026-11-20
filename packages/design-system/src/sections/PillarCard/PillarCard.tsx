import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import type { Pillar } from '../../types';

export interface PillarCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  pillar: Pillar;
  tone?: 'dark' | 'light';
  /** `wide` lays the icon beside the text for the full-width card (Figma 411:3738). */
  size?: 'sm' | 'wide';
}

/**
 * Value-proposition card (Figma 411:3745, 411:3759): 20 px radius, 1 px border, 48 px icon, H4 title, Body/Large text. Dark = inverse
 * border on a dark band, light = card on a light band.
 *
 * @figma 411:3745, 411:3759, 411:3738
 */
export const PillarCard = React.forwardRef<HTMLElement, PillarCardProps>(({ pillar, tone = 'dark', size = 'sm', className, ...props }, ref) => {
  const dark = tone === 'dark';
  return (
    <article
      ref={ref}
      className={cn(
        'flex gap-4 rounded-card border border-solid p-6 pt-5',
        size === 'wide' ? 'flex-col sm:flex-row sm:items-start sm:gap-8' : 'flex-col',
        dark ? 'border-border-inverse text-text-inverse' : 'border-border-subtle bg-bg-surface text-text-heading',
        className,
      )}
      {...props}
    >
      <span className={dark ? 'text-text-inverse' : 'text-emerald-600'}>
        <Icon name={pillar.icon as IconName} size={48} />
      </span>
      <div className="flex flex-col gap-4">
        <h3 className="text-h4 font-bold">{pillar.title}</h3>
        <p className={cn('text-body-lg', dark ? 'text-text-inverse' : 'text-text-body')}>{pillar.body}</p>
      </div>
    </article>
  );
});
PillarCard.displayName = 'PillarCard';
