import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatNumber } from '../../lib/format';
import type { Stat } from '../../types';

type Locale = 'ar' | 'en';
type Tone = 'dark' | 'light';

export function formatStat(stat: Stat, locale: Locale): string {
  const value = typeof stat.value === 'number' ? formatNumber(stat.value, locale) : stat.value;
  return `${stat.prefix ?? ''}${value}${stat.suffix ? ` ${stat.suffix}` : ''}`;
}

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  stat: Stat;
  tone?: Tone;
  locale?: Locale;
}

/**
 * One statistic: value in the Heading/H2 size with the gradient accent, label in Body/Large (Figma proof box 411:3772).
 *
 * @figma 411:3772
 */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(({ stat, tone = 'dark', locale = 'ar', className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
    <p className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-h2 font-bold text-transparent"><bdi dir="ltr">{formatStat(stat, locale)}</bdi></p>
    <p className={cn('text-body-lg', tone === 'dark' ? 'text-text-inverse' : 'text-text-body')}>{stat.label}</p>
  </div>
));
StatTile.displayName = 'StatTile';

export interface StatsStripProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  stats: Stat[];
  tone?: Tone;
  locale?: Locale;
}

/**
 * Row of statistics separated by 1 px dividers: dark = pine-900 proof box (Figma 411:3772, 20 px radius), light = white card.
 * Exposed as a list.
 *
 * @figma 411:3772, 530:4369 (unverified)
 */
export const StatsStrip = React.forwardRef<HTMLUListElement, StatsStripProps>(({ stats, tone = 'dark', locale = 'ar', className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      'grid grid-cols-2 gap-x-8 gap-y-8 rounded-card px-8 py-6 lg:grid-cols-4',
      tone === 'dark' ? 'bg-pine-900' : 'border border-solid border-border-subtle bg-bg-surface',
      className,
    )}
    {...props}
  >
    {stats.map((stat, index) => (
      <li key={`${stat.label}-${index}`} className={cn(index > 0 && 'lg:border-s lg:border-solid lg:ps-8', index > 0 && (tone === 'dark' ? 'lg:border-pine-700' : 'lg:border-border-decor'))}>
        <StatTile stat={stat} tone={tone} locale={locale} />
      </li>
    ))}
  </ul>
));
StatsStrip.displayName = 'StatsStrip';
