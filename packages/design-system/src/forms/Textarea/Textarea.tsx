import * as React from 'react';
import { cn } from '../../lib/cn';
import { controlVariants } from '../control-styles';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  theme?: 'light' | 'dark';
}

/**
 * Multi-line text control (130 px high, Figma 522:1185 Textarea variants).
 *
 * @figma 522:1185
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ theme, className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlVariants({ theme, kind: 'textarea' }), className)} {...props} />
));
Textarea.displayName = 'Textarea';
