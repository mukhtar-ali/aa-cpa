import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Hides content visually but keeps it available to assistive technology.
 *
 * @figma n/a (utility)
 */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span ref={ref} className={cn('sr-only', className)} {...props} />,
);
VisuallyHidden.displayName = 'VisuallyHidden';
