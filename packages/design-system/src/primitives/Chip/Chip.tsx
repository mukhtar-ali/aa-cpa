import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Static tag (article tags, Figma 507:4169): 40 px pill, 1 px chip-border outline, 22 px side padding, Body/Small Bold in the heading colour.
 *
 * @figma 507:4169, 499:1145
 */
export const Chip = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('inline-flex h-10 items-center justify-center rounded-full border border-solid border-border-chip px-5.5 text-body-sm font-bold whitespace-nowrap text-text-heading', className)}
    {...props}
  />
));
Chip.displayName = 'Chip';
