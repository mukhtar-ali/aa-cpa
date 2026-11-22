import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';

const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-full border border-solid',
    'transition-colors duration-(--motion-duration-fast) ease-standard',
    'aria-disabled:pointer-events-none aria-disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        outline: 'border-border-subtle bg-bg-surface text-text-strong hover:bg-bg-page',
        solid: 'border-bg-inverse bg-bg-inverse text-text-inverse hover:bg-bg-inverse-raised',
        'ghost-light': 'border-border-inverse bg-transparent text-text-inverse hover:bg-bg-inverse-raised',
      },
      size: { sm: 'size-10', md: 'size-12' },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  },
);

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  /** Accessible name (required). */
  label: string;
  icon: IconName;
  variant?: 'outline' | 'solid' | 'ghost-light';
  size?: 'sm' | 'md';
  href?: string;
  /** Link mode only: open in a new tab safely (target=_blank, rel=noopener noreferrer). */
  external?: boolean;
  /** Point the icon the opposite way (previous). See Icon `reverse`. */
  reverseIcon?: boolean;
}

/**
 * Round icon-only button or link. Slider nav (outline = previous, solid = next) matches Figma 529:4427; share icons 505:3864.
 *
 * @figma 529:4427
 */
export const IconButton = React.forwardRef<HTMLElement, IconButtonProps>(
  ({ label, icon, variant, size, href, external, reverseIcon, disabled, className, type = 'button', onClick, ...props }, ref) => {
    const classes = cn(iconButtonVariants({ variant, size }), className);
    const content = <Icon name={icon} size={20} reverse={reverseIcon} />;
    if (href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          // A link without href has no role: say "link" so the label of a disabled pagination arrow is still announced.
          role={disabled ? 'link' : undefined}
          aria-label={label}
          aria-disabled={disabled || undefined}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className={classes}
          onClick={
            disabled || onClick
              ? (e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  (onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined)?.(e);
                }
              : undefined
          }
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        aria-label={label}
        aria-disabled={disabled || undefined}
        className={classes}
        onClick={
          disabled || onClick
            ? (e) => {
                if (disabled) {
                  e.preventDefault();
                  return;
                }
                onClick?.(e);
              }
            : undefined
        }
        {...props}
      >
        {content}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
