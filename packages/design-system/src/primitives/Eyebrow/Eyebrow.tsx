import * as React from 'react';
import { cn } from '../../lib/cn';

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  tone?: 'default' | 'inverse';
}

/**
 * Small lead-in line above a section heading (Body/Large Bold in the heading colour).
 *
 * @figma 411:3722
 */
export const Eyebrow = React.forwardRef<HTMLParagraphElement, EyebrowProps>(({ tone = 'default', className, ...props }, ref) => (
  <p ref={ref} className={cn('text-body-lg font-bold', tone === 'inverse' ? 'text-text-inverse' : 'text-text-heading', className)} {...props} />
));
Eyebrow.displayName = 'Eyebrow';
