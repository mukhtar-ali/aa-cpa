'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';

export interface FormErrorSummaryItem {
  /** id of the invalid control. */
  id: string;
  message: string;
}

export interface FormErrorSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading text, for example "Please fix the following". */
  title: string;
  errors: FormErrorSummaryItem[];
  /** Change this value on every failed submit (for example a counter) so the summary takes focus again while the errors stay the same. */
  focusKey?: number;
}

/**
 * List of form errors shown after a failed submit. It takes focus when it appears (so screen readers announce it) and each
 * message links to its field. Renders nothing without errors.
 */
export function FormErrorSummary({ title, errors, focusKey, className, ...props }: FormErrorSummaryProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const hasErrors = errors.length > 0;
  React.useEffect(() => {
    if (hasErrors) ref.current?.focus();
  }, [hasErrors, focusKey]);
  if (!hasErrors) return null;
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={cn('rounded-field border border-solid border-status-error bg-neutral-50 p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring-error', className)}
      {...props}
    >
      <p className="text-body-md font-bold text-status-error">{title}</p>
      <ul className="mt-2 list-disc ps-5 text-body-sm text-text-heading">
        {errors.map((error) => (
          <li key={error.id}>
            <a
              href={`#${error.id}`}
              className="underline"
              onClick={(event) => {
                const target = document.getElementById(error.id);
                if (target) {
                  event.preventDefault();
                  target.focus();
                }
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
