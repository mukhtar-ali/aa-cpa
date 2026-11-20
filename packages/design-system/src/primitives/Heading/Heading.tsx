import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const headingVariants = cva('font-bold', {
  variants: {
    size: {
      h1: 'text-h1',
      h2: 'text-h2',
      h3: 'text-h3',
      h4: 'text-h4',
      h5: 'text-h5',
      h6: 'text-h6',
    },
    tone: {
      default: 'text-text-heading',
      inverse: 'text-text-inverse',
    },
  },
  defaultVariants: { size: 'h2', tone: 'default' },
});

/** Gradient accent text is only allowed at large sizes (H1-H3); smaller accent text is a solid colour (research R4). */
const GRADIENT_SIZES: ReadonlySet<HeadingSize> = new Set(['h1', 'h2', 'h3']);

export interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** Semantic level (document outline). */
  level: HeadingLevel;
  /** Visual size override; defaults to the size of `level`. */
  size?: HeadingSize;
  /** Optional second line rendered in the accent gradient (h1-h3 sizes) or solid accent (smaller sizes). */
  accent?: string;
  tone?: 'default' | 'inverse';
  children: React.ReactNode;
}

/**
 * Page and section heading with semantic level decoupled from visual size.
 *
 * @figma 411:169 (text styles Heading/H1 to Heading/H6)
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, size, accent, tone = 'default', className, children, ...props }, ref) => {
    const Tag = `h${level}` as const;
    const visual: HeadingSize = size ?? (`h${level}` as HeadingSize);
    return (
      <Tag ref={ref} className={cn(headingVariants({ size: visual, tone }), className)} {...props}>
        {children}
        {accent ? (
          <span
            data-accent={GRADIENT_SIZES.has(visual) ? 'gradient' : 'solid'}
            className={cn(
              'block',
              GRADIENT_SIZES.has(visual)
                ? 'bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-transparent'
                : 'text-gradient-end-text',
            )}
          >
            {accent}
          </span>
        ) : null}
      </Tag>
    );
  },
);
Heading.displayName = 'Heading';
