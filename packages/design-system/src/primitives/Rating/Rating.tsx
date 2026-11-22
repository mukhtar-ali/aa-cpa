import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';

export interface RatingProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 1 to 5. */
  value: 1 | 2 | 3 | 4 | 5;
  /** Accessible text, for example "4 of 5". Required: components carry no copy. */
  label: string;
}

/**
 * Five-star rating (22 px stars with 6 px gaps, 134 px wide, as in the testimonial). Empty stars are an unverified
 * extension: Figma only shows the 5-star state.
 *
 * @figma 411:3871
 */
export const Rating = React.forwardRef<HTMLSpanElement, RatingProps>(({ value, label, className, ...props }, ref) => (
  <span ref={ref} role="img" aria-label={label} className={cn('inline-flex items-center gap-1.5', className)} {...props}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Icon key={n} name="star" data-filled={n <= value} className={n <= value ? 'text-emerald-600' : 'text-neutral-200'} />
    ))}
  </span>
));
Rating.displayName = 'Rating';
