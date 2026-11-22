import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const textVariants = cva('', {
  variants: {
    size: { lg: 'text-body-lg', md: 'text-body-md', sm: 'text-body-sm', xs: 'text-body-xs' },
    weight: { regular: 'font-normal', bold: 'font-bold', extrabold: 'font-extrabold' },
    tone: {
      body: 'text-text-body',
      muted: 'text-text-muted',
      strong: 'text-text-strong',
      inverse: 'text-text-inverse',
      'inverse-muted': 'text-text-inverse-muted',
    },
  },
  defaultVariants: { size: 'md', weight: 'regular', tone: 'body' },
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

/**
 * Body copy in the four Figma body sizes, three weights and the five text tones.
 *
 * @figma 411:169 (text styles Body/Large, Body/Medium, Body/Small, Body/XSmall)
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = 'p', size, weight, tone, className, ...props }, ref) => (
    <Tag ref={ref} className={cn(textVariants({ size, weight, tone }), className)} {...props} />
  ),
);
Text.displayName = 'Text';
