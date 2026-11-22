import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import { controlVariants } from '../control-styles';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  theme?: 'light' | 'dark';
  /** Class for the wrapper (the `className` goes to the native select). */
  wrapperClassName?: string;
}

/**
 * Native select with a custom chevron placed at the inline end (so it sits on the left in RTL). Keeps native keyboard and
 * mobile behaviour. Styling follows the text control (Figma 522:1185; select frame 524:3651 could not be read).
 *
 * @figma 522:1185
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ theme, className, wrapperClassName, children, ...props }, ref) => (
  <div className={cn('relative w-full', wrapperClassName)}>
    <select ref={ref} className={cn(controlVariants({ theme, kind: 'text' }), 'appearance-none pe-12', className)} {...props}>
      {children}
    </select>
    <Icon
      name="chevron"
      size={20}
      mirror={false}
      className={cn('pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 rotate-90', theme === 'dark' ? 'text-text-inverse' : 'text-text-heading')}
    />
  </div>
));
Select.displayName = 'Select';
