import * as React from 'react';
import { cn } from '../../lib/cn';

export interface SkipLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  label: string;
  /** Id of the main landmark, with the leading `#`. */
  href?: string;
}

/** First focusable element of every page: hidden until it has keyboard focus, then jumps past the header to `<main>`. */
export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(({ label, href = '#main', className, ...props }, ref) => (
  <a
    ref={ref}
    href={href}
    className={cn(
      'sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-button focus:bg-bg-page focus:px-4 focus:py-3',
      'focus:text-body-md focus:font-bold focus:text-text-strong focus:shadow-float',
      className,
    )}
    {...props}
  >
    {label}
  </a>
));
SkipLink.displayName = 'SkipLink';
