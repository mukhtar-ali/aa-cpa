import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const sectionVariants = cva('w-full', {
  variants: {
    tone: {
      page: 'bg-bg-page text-text-heading',
      ice: 'bg-bg-surface-ice text-text-heading',
      surface: 'bg-bg-surface text-text-heading',
      inverse: 'bg-bg-inverse text-text-inverse',
      hero: 'bg-bg-hero text-text-inverse',
    },
    rounded: {
      none: 'rounded-none',
      top: 'rounded-t-section',
      bottom: 'rounded-b-section',
      both: 'rounded-section',
    },
    spacing: {
      none: 'py-0',
      sm: 'py-section-sm',
      md: 'py-section-md',
      lg: 'py-section-lg',
      xl: 'py-section-xl',
    },
  },
  defaultVariants: {
    tone: 'page',
    rounded: 'none',
    spacing: 'lg',
  },
});

export type SectionTone = 'page' | 'ice' | 'surface' | 'inverse' | 'hero';
export type SectionRounded = 'none' | 'top' | 'bottom' | 'both';
export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType;
  pattern?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Section container for page bands with tone backgrounds, 30px corner radii (Figma radius/section),
 * vertical rhythm spacing tokens, and background pattern slots.
 *
 * @figma 411:3713, 411:3729
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      as: Component = 'section',
      tone = 'page',
      rounded = 'none',
      spacing = 'lg',
      pattern,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const hasPattern = Boolean(pattern);

    return (
      <Component
        ref={ref as React.ForwardedRef<HTMLElement>}
        className={cn(
          sectionVariants({ tone, rounded, spacing }),
          hasPattern && 'relative overflow-hidden',
          className,
        )}
        {...props}
      >
        {hasPattern && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {pattern}
          </div>
        )}
        {hasPattern ? <div className="relative z-10">{children}</div> : children}
      </Component>
    );
  },
);

Section.displayName = 'Section';
