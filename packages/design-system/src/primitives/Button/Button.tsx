import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

/**
 * Values from the approved homepage instances: primary 411:3706, secondary 411:3709, paper-on-dark 411:3735, link 411:3714.
 * The homepage button is 48 px tall (26 px line + 10 px padding + 1 px border, each side); `lg` follows the library set 64:20
, ` * proportions (52 px); `sm` is the header call-to-action (411:3807: 13 px label, 43 px high). The old library set 64:20 itself (IBM Plex, other colours) is NOT used as a visual reference.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-button border border-solid text-body-md',
    'transition-colors duration-(--motion-duration-fast) ease-standard',
    'aria-disabled:pointer-events-none aria-disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-action-primary bg-action-primary font-bold text-text-on-action shadow-button-primary hover:border-text-link hover:bg-text-link',
        secondary:
          'border-action-secondary bg-bg-page font-bold text-text-link shadow-button-primary hover:bg-bg-surface',
        paper:
          'border-action-secondary bg-bg-page font-extrabold text-text-strong shadow-button-primary hover:bg-bg-surface',
        link: 'border-transparent bg-transparent font-bold text-body-lg hover:opacity-80',
      },
      size: { sm: 'min-h-11 px-5 py-2.5 text-body-sm', md: 'min-h-12 px-6 py-2.5', lg: 'min-h-13 px-8 py-3' },
    },
    compoundVariants: [{ variant: 'link', className: 'min-h-0 px-0 py-2' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

const LINK_LABEL = 'bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-transparent';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** `paper` is the beige button for dark sections (Figma 411:3735). `link` renders a gradient label. */
  variant?: 'primary' | 'secondary' | 'paper' | 'link';
  size?: 'sm' | 'md' | 'lg';
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
    const label = variant === 'link' ? <span className={LINK_LABEL}>{children}</span> : children;
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
        {label}
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
