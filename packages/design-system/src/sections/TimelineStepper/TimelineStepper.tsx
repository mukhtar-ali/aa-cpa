import { HeadingTag, type HeadingLevel } from '../../lib/heading-tag';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatNumber } from '../../lib/format';
import type { ProcessStep } from '../../types';

export interface TimelineStepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  /** Heading level of the card title (default 3), so the card fits the page's heading outline. */
  headingLevel?: HeadingLevel;
  steps: ProcessStep[];
  /** 1-based index of the highlighted step (inverse pill), if any. */
  current?: number;
  locale?: 'ar' | 'en';
}

/**
 * Hiring timeline: horizontal from `md`, vertical below. Each step has a 48 px numbered pill (inverse for the current step, outlined white
 * otherwise, as in the process-step sheet 530:4391), an H5 title and Body/Small text, joined by a hairline. The hiring-steps frame (519:38941)
 * was not read, so the arrangement is inferred (to verify).
 *
 * @figma 519:38941, 530:4391
 */
export const TimelineStepper = React.forwardRef<HTMLOListElement, TimelineStepperProps>(({ steps, current, locale = 'ar', headingLevel = 3, className, ...props }, ref) => (
  <ol ref={ref} className={cn('flex flex-col gap-8 md:flex-row md:gap-6', className)} {...props}>
    {steps.map((step, i) => {
      const active = current === step.index;
      return (
        <li key={step.index} aria-current={active ? 'step' : undefined} className="relative flex flex-1 gap-4 md:flex-col md:items-center md:text-center">
          {i < steps.length - 1 ? <span aria-hidden="true" className="absolute start-6 top-12 -bottom-8 w-px bg-border-subtle md:start-[calc(50%+1.875rem)] md:end-[calc(-50%+1.875rem)] md:top-6 md:bottom-auto md:h-px md:w-auto" /> : null}
          <span
            className={cn(
              'relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-full text-body-sm font-bold',
              active ? 'bg-bg-inverse text-text-inverse' : 'border border-solid border-border-subtle bg-bg-surface text-text-heading',
            )}
          >
            {formatNumber(step.index, locale, { minimumIntegerDigits: 2 })}
          </span>
          <div className="flex flex-col gap-2">
            <HeadingTag level={headingLevel} className="text-h5 font-bold text-text-heading">{step.title}</HeadingTag>
            <p className="text-body-sm text-text-body">{step.body}</p>
          </div>
        </li>
      );
    })}
  </ol>
));
TimelineStepper.displayName = 'TimelineStepper';
