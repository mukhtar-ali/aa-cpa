import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

/**
 * Sizes from Figma set 64:20: md = 44 px, lg = 52 px (26 px line height + 1 px border + 8 / 12 px vertical padding).
 * Primary values come from node 411:3706. NOTE: `secondary`, `outline-light` and `link` are PROVISIONAL, built from tokens and
 * the contract; verify against 411:3709, 411:3735 and 411:3714 when Figma access is available.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-button border border-solid font-bold text-body-md',
    'transition-colors duration-(--motion-duration-fast) ease-standard',
    'aria-disabled:pointer-events-none aria-disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-action-primary bg-action-primary text-text-on-action shadow-button-primary hover:bg-text-link hover:border-text-link',
        secondary: 'border-border-strong bg-action-secondary text-text-heading hover:bg-bg-surface',
        'outline-light': 'border-border-inverse-strong bg-transparent text-text-inverse hover:bg-bg-inverse-raised',
        link: 'border-transparent bg-transparent px-0 text-text-link underline underline-offset-4 hover:text-text-heading',
      },
      size: { md: 'min-h-11 px-5 py-2', lg: 'min-h-13 px-6 py-3' },
    },
    compoundVariants: [{ variant: 'link', className: 'px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'primary' | 'secondary' | 'outline-light' | 'link';
  size?: 'md' | 'lg';
  /** Renders an `<a>` when set. */
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  /** Rendered after the label; mirrored in RTL (it is usually an arrow). Set `mirrorEndIcon={false}` for symmetric icons. */
  endIcon?: React.ReactNode;
  mirrorEndIcon?: boolean;
  /** Render the single child element (for example a router link) with the button styling. */
  asChild?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Primary call-to-action. Native `<button>` or `<a>`; disabled and loading are announced with aria-disabled / aria-busy.
 *
 * @figma 64:20
 */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      variant,
      size,
      href,
      loading = false,
      disabled = false,
      startIcon,
      endIcon,
      mirrorEndIcon = true,
      asChild = false,
      type = 'button',
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const inactive = disabled || loading;
    const classes = cn(buttonVariants({ variant, size }), className);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (inactive) {
        event.preventDefault();
        return;
      }
      (onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event);
    };
    const common = {
      className: classes,
      'aria-disabled': inactive || undefined,
      'aria-busy': loading || undefined,
      onClick: handleClick,
      ...props,
    };

    const inner = (
      <>
        {loading ? (
          <span aria-hidden="true" className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          startIcon && <span className="inline-flex shrink-0">{startIcon}</span>
        )}
        {children}
        {endIcon && <span className={cn('inline-flex shrink-0', mirrorEndIcon && 'rtl:-scale-x-100')}>{endIcon}</span>}
      </>
    );

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>;
      return (
        <Slot ref={ref} {...(common as React.HTMLAttributes<HTMLElement>)}>
          {React.cloneElement(child, undefined, <>{loading ? null : startIcon}{child.props.children}{endIcon}</>)}
        </Slot>
      );
    }
    if (href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={inactive ? undefined : href}
          role={inactive ? 'link' : undefined}
          {...(common as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </a>
      );
    }
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} {...common}>
        {inner}
      </button>
    );
  },
);
Button.displayName = 'Button';
