import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  /** Label content; may contain a link (for example to the terms). */
  label: React.ReactNode;
  /** Error message shown below and linked with aria-describedby. */
  error?: string;
}

/**
 * Checkbox (Figma 522:1194): 20 px box, 5 px radius, 1.5 px border, emerald fill with check when selected. The box sits at the
 * inline start, so it is on the right in Arabic. The unchecked border is the contrast-corrected `neutral/300`.
 *
 * @figma 522:1194
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, error, id, className, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-3">
        <span className="relative inline-flex size-5 shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              'peer size-5 shrink-0 cursor-pointer appearance-none rounded-checkbox border border-solid border-neutral-300 bg-neutral-0 outline-none',
              'border-(length:--border-width-focus) transition-colors duration-(--motion-duration-fast) ease-standard',
              'checked:border-emerald-600 checked:bg-emerald-600 focus-visible:ring-3 focus-visible:ring-ring-focus',
              'aria-[invalid=true]:border-status-error aria-[invalid=true]:focus-visible:ring-ring-error',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
            {...props}
          />
          <Icon name="check" size={14} className="pointer-events-none absolute inset-0 m-auto text-text-on-action opacity-0 peer-checked:opacity-100" />
        </span>
        <label htmlFor={inputId} className="cursor-pointer text-body-sm text-text-body">
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="text-body-xs text-status-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
