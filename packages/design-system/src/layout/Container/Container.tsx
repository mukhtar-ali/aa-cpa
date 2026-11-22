import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const containerVariants = cva('w-full mx-auto px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      default: 'max-w-[calc(var(--layout-content-width)+4rem)]',
      wide: 'max-w-[calc(var(--layout-content-width-wide)+4rem)]',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

/**
 * Container component for horizontal alignment and responsive padding.
 * Enforces the 1140px desktop content column with 16/24/32px responsive gutters.
 *
 * @figma 411:169
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ as: Component = 'div', size, className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Container.displayName = 'Container';
