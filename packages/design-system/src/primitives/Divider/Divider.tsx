import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const dividerVariants = cva('shrink-0 border-0', {
  variants: {
    orientation: { horizontal: 'h-px w-full', vertical: 'w-px self-stretch' },
    tone: { light: 'bg-border-decor', dark: 'bg-pine-700' },
  },
  defaultVariants: { orientation: 'horizontal', tone: 'light' },
});

export interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  /** `light` for page/ice/surface tones, `dark` for inverse tones. */
  tone?: 'light' | 'dark';
}

/**
 * 1 px rule. Horizontal renders a native `<hr>`; vertical a separator element.
 *
 * @figma 411:3785
 */
export const Divider = React.forwardRef<HTMLElement, DividerProps>(
  ({ orientation = 'horizontal', tone = 'light', className, ...props }, ref) => {
    const classes = cn(dividerVariants({ orientation, tone }), className);
    if (orientation === 'horizontal') {
      return <hr ref={ref as React.Ref<HTMLHRElement>} className={classes} {...props} />;
    }
    return <div ref={ref as React.Ref<HTMLDivElement>} role="separator" aria-orientation="vertical" className={classes} {...props} />;
  },
);
Divider.displayName = 'Divider';
