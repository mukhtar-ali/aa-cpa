import * as React from 'react';
import { cn } from '../../lib/cn';

export interface StatementProps extends React.HTMLAttributes<HTMLParagraphElement> {
  tone?: 'light' | 'dark';
}

/**
 * Large brand statement in the Heading/H3 style (Figma 411:3796). A paragraph, not a heading: it carries no outline level.
 *
 * @figma 411:3796
 */
export const Statement = React.forwardRef<HTMLParagraphElement, StatementProps>(({ tone = 'light', className, ...props }, ref) => (
  <p ref={ref} className={cn('text-h3 font-bold', tone === 'dark' ? 'text-text-inverse' : 'text-text-heading', className)} {...props} />
));
Statement.displayName = 'Statement';
