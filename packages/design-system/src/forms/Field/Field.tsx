import * as React from 'react';
import { cn } from '../../lib/cn';

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** id of the control; the label, help and error ids derive from it. */
  id: string;
  label: string;
  help?: string;
  /** Error message; marks the control invalid and is announced through aria-describedby. */
  error?: string;
  required?: boolean;
  /** Dark section styling (label colour). */
  theme?: 'light' | 'dark';
  /** Exactly one control (TextInput, Textarea, Select, ...). It receives id, required, aria-invalid and aria-describedby. */
  children: React.ReactElement<Record<string, unknown>>;
}

/**
 * Label + control + help/error wiring. Server-safe: it clones its single child instead of using context.
 *
 * @figma 522:1185
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ id, label, help, error, required, theme = 'light', className, children, ...props }, ref) => {
    const helpId = help ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [children.props['aria-describedby'] as string | undefined, helpId, errorId].filter(Boolean).join(' ') || undefined;
    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        <label htmlFor={id} className={cn('text-body-sm font-bold', theme === 'dark' ? 'text-text-inverse' : 'text-text-heading')}>
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-1 text-status-error">
              *
            </span>
          ) : null}
        </label>
        {React.cloneElement(children, {
          id,
          required: required || undefined,
          'aria-invalid': error ? true : children.props['aria-invalid'],
          'aria-describedby': describedBy,
        })}
        {help && !error ? (
          <p id={helpId} className={cn('text-body-xs', theme === 'dark' ? 'text-text-inverse-muted' : 'text-neutral-500')}>
            {help}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className={cn('text-body-xs', theme === 'dark' ? 'text-status-error-inverse' : 'text-status-error')}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Field.displayName = 'Field';
