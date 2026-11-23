import * as React from 'react';
import { cn } from '../../lib/cn';

export interface PreviewBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  message: string;
  exitLabel: string;
  /** Route that disables draft mode and returns to the page. */
  exitHref: string;
}

/** Sticky bar shown while an editor views unpublished content (draft mode). */
export const PreviewBanner = React.forwardRef<HTMLDivElement, PreviewBannerProps>(({ message, exitLabel, exitHref, className, ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    className={cn('sticky top-0 z-50 flex flex-wrap items-center justify-center gap-4 bg-bg-hero px-4 py-2 text-body-sm text-text-on-action', className)}
    {...props}
  >
    <span>{message}</span>
    <a href={exitHref} className="font-bold underline underline-offset-4">
      {exitLabel}
    </a>
  </div>
));
PreviewBanner.displayName = 'PreviewBanner';
