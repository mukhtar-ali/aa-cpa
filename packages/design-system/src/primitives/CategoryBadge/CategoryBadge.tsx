import * as React from 'react';
import { cn } from '../../lib/cn';

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `gold` is the Figma news-card tag (423:1148). `green` is an extension for other categories (not in Figma). */
  tone?: 'gold' | 'green';
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
      tone === 'gold' ? 'text-text-accent' : 'text-text-link',
      className,
    )}
    {...props}
  >
    <span>{children}</span>
    <span aria-hidden="true" data-dot className={cn('size-1.5 shrink-0 rounded-full', tone === 'gold' ? 'bg-text-accent-inverse' : 'bg-action-primary')} />
  </span>
));
CategoryBadge.displayName = 'CategoryBadge';
