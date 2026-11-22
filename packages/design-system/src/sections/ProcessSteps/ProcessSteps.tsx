import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatNumber } from '../../lib/format';
import type { ProcessStep } from '../../types';

export interface ProcessStepsProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  steps: ProcessStep[];
  locale?: 'ar' | 'en';
}

const pad = (n: number, locale: 'ar' | 'en') => (n < 10 ? `0${formatNumber(n, locale)}` : formatNumber(n, locale));

/**
 * "How we work": numbered steps as bordered cards (Figma 411:3825: H1-sized numeral, H5 title, Body/Medium text). The numbered
 * pill variant of the component sheet (530:4391) is not used on the approved pages.
 *
 * @figma 411:3825, 530:4391
 */
export const ProcessSteps = React.forwardRef<HTMLOListElement, ProcessStepsProps>(({ steps, locale = 'ar', className, ...props }, ref) => (
  <ol ref={ref} className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-4', className)} {...props}>
    {steps.map((step) => (
      <li key={step.index} className="flex flex-col gap-4 rounded-card border border-solid border-border-decor bg-transparent p-6 lg:min-h-80">
        <span aria-hidden="true" className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-h1 font-bold text-transparent">
          {pad(step.index, locale)}
        </span>
        <h3 className="text-h5 font-bold text-text-heading">{step.title}</h3>
        <p className="text-body-sm text-text-body">{step.body}</p>
      </li>
    ))}
  </ol>
));
ProcessSteps.displayName = 'ProcessSteps';
