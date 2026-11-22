import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const linkVariants = cva('rounded-sm transition-colors duration-(--motion-duration-fast) ease-standard', {
  variants: {
    variant: {
      inline: 'text-text-link underline underline-offset-4 hover:text-text-heading',
      nav: 'text-text-heading no-underline hover:text-text-link',
    },
  },
  defaultVariants: { variant: 'inline' },
});

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  /** Opens in a new tab with `rel="noopener noreferrer"`. */
  external?: boolean;
}

/**
 * Text link. The `arrow` variant (link with trailing arrow) is added with the icon set.
 *
 * @figma 411:169 (text/link usage)
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant, external, className, rel, target, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content -- content is supplied through props.children
    <a
      ref={ref}
      className={cn(linkVariants({ variant }), className)}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      {...props}
    />
  ),
);
Link.displayName = 'Link';
