import * as React from 'react';
import { cn } from '../../lib/cn';

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `gold` is the Figma news-card tag (423:1148). `gradient` is the related-article card tag (506:4138: gradient text plus dot). `green` is an extension (not in Figma). */
  tone?: 'gold' | 'green' | 'gradient';
}

/**
 * Category tag: label followed by a 6 px dot (news card tag).
 *
 * @figma 423:1145
 */
export const CategoryBadge = React.forwardRef<HTMLSpanElement, CategoryBadgeProps>(({ tone = 'gold', className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-pill text-body-sm font-bold',
      tone === 'gold' && 'text-text-accent',
      tone === 'green' && 'text-text-link',
      tone === 'gradient' && 'bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-transparent',
      className,
    )}
    {...props}
  >
    <span>{children}</span>
    <span aria-hidden="true" data-dot className={cn('size-1.5 shrink-0 rounded-full', tone === 'gold' ? 'bg-text-accent-inverse' : tone === 'gradient' ? 'bg-gradient-start' : 'bg-action-primary')} />
  </span>
));
CategoryBadge.displayName = 'CategoryBadge';
