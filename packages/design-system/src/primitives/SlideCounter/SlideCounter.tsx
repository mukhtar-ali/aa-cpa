import * as React from 'react';
import { cn } from '../../lib/cn';

export interface SlideCounterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 1-based index of the current slide. */
  current: number;
  total: number;
  /** Accessible name of the progress bar, for example "Slide". */
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * "01 / 05" counter with a progress bar (services page). Numbers use Western digits in both languages and are isolated
 * as LTR text; the bar fills from the inline start. The frame was not readable, so sizes follow the tokens (to verify).
 *
 * @figma 448:41066 (unverified)
 */
export const SlideCounter = React.forwardRef<HTMLDivElement, SlideCounterProps>(({ current, total, label, className, ...props }, ref) => {
  if (total < 1) return null;
  const value = Math.min(Math.max(current, 1), total);
  return (
    <div ref={ref} className={cn('flex flex-col gap-3', className)} {...props}>
      <p className="text-body-md font-bold text-text-heading">
        <bdi dir="ltr">
          {pad(value)} / {pad(total)}
        </bdi>
      </p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-valuetext={`${value} / ${total}`}
        className="h-1 w-full overflow-hidden rounded-full bg-border-decor"
      >
        <div className="h-full rounded-full bg-action-primary" style={{ width: `${(value / Math.max(total, 1)) * 100}%` }} />
      </div>
    </div>
  );
});
SlideCounter.displayName = 'SlideCounter';
