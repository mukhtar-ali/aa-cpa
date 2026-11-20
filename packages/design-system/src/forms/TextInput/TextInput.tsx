import * as React from 'react';
import { cn } from '../../lib/cn';
import { controlVariants } from '../control-styles';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** `dark` is the estimator display field on dark sections (Figma 411:3863). */
  theme?: 'light' | 'dark';
}

/**
 * Single-line text control (56 px, Figma 522:1185). Use inside `Field` for label, help and error wiring.
 *
 * @figma 522:1185, 411:3863
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({ theme, className, type = 'text', ...props }, ref) => (
  <input ref={ref} type={type} className={cn(controlVariants({ theme, kind: 'text' }), className)} {...props} />
));
TextInput.displayName = 'TextInput';
