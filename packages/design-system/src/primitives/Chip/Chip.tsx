import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Static tag (for example article tags). NOTE: article tag frame 506:2706 could not be read; styled from the filter chip
 * tokens (499:1149) and to be verified.
 *
 * @figma 506:2706 (unverified), 499:1149
 */
export const Chip = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('inline-flex h-8 items-center rounded-full border border-border-chip px-4 text-body-sm font-bold text-text-heading', className)}
    {...props}
  />
));
Chip.displayName = 'Chip';
